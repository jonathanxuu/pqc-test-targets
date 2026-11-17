import { createServer, IncomingMessage, ServerResponse } from "node:http";
import {
  createCipheriv,
  constants,
  generateKeyPairSync,
  pbkdf2Sync,
  randomBytes,
  sign,
} from "node:crypto";

const port = Number(process.env.PORT ?? 8080);

const signingKey = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicExponent: 0x10001,
});

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>安全消息保险箱 · TLS 1.2</title>
  <style>
    :root { color-scheme: light; font-family: Inter, -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; color: #12233f; background: linear-gradient(135deg, #eef6ff, #ffffff 55%, #e7f0ff); }
    .shell { max-width: 960px; margin: 0 auto; padding: 48px 22px; }
    .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 56px; }
    .mark { width: 42px; height: 42px; display: grid; place-items: center; color: white; background: #1464d2; border-radius: 13px; font-weight: 800; box-shadow: 0 10px 24px #1464d238; }
    .brand strong { display: block; font-size: 18px; letter-spacing: .02em; }
    .brand span { color: #6c7d96; font-size: 12px; }
    .hero { max-width: 680px; margin-bottom: 28px; }
    .eyebrow { color: #1464d2; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 12px 0; font-size: clamp(32px, 6vw, 56px); line-height: 1.08; letter-spacing: -.05em; }
    .intro { color: #60718a; font-size: 16px; line-height: 1.8; }
    .card { padding: 26px; background: rgba(255,255,255,.86); border: 1px solid #dce8f7; border-radius: 22px; box-shadow: 0 20px 60px #315b8c14; backdrop-filter: blur(12px); }
    label { display: block; margin: 0 0 9px; color: #52647d; font-size: 13px; font-weight: 700; }
    textarea, input { width: 100%; border: 1px solid #d2dfef; border-radius: 12px; padding: 13px 14px; color: #12233f; background: #fbfdff; font: inherit; outline: none; }
    textarea { min-height: 132px; resize: vertical; }
    textarea:focus, input:focus { border-color: #1464d2; box-shadow: 0 0 0 4px #1464d21a; }
    .row { display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: end; margin-top: 18px; }
    button { border: 0; border-radius: 12px; padding: 13px 22px; color: white; background: #1464d2; font: inherit; font-weight: 700; cursor: pointer; box-shadow: 0 8px 18px #1464d238; }
    button:hover { background: #0f55b5; }
    .hint { margin-top: 18px; color: #7b8ba0; font-size: 12px; }
    pre { margin: 20px 0 0; padding: 18px; min-height: 54px; overflow: auto; color: #cfe2ff; background: #12233f; border-radius: 14px; font-size: 12px; line-height: 1.6; }
    @media (max-width: 640px) { .shell { padding-top: 30px; } .brand { margin-bottom: 38px; } .row { grid-template-columns: 1fr; } button { width: 100%; } }
  </style>
</head>
<body>
  <main class="shell">
    <header class="brand"><div class="mark">S</div><div><strong>安全消息保险箱</strong><span>Security Message Vault</span></div></header>
    <section class="hero"><div class="eyebrow">TLS 1.2 · 传统加密链路</div><h1>让敏感消息<br>安全地传递。</h1><p class="intro">这是一个用于密码学资产盘点的测试网站。当前入口使用 TLS 1.2，应用层使用密钥派生、对称加密和数字签名保护消息。</p></section>
    <section class="card"><form id="form"><label for="message">待保护的消息</label><textarea id="message">这是一条需要被保护的测试消息。</textarea><div class="row"><div><label for="password">加密密码</label><input id="password" type="password" value="demo-password"></div><button type="submit">加密并签名 →</button></div></form><div class="hint">演示环境 · 结果仅用于测试，不要输入真实机密信息</div><pre id="output">等待生成加密结果…</pre></section>
  </main>
  <script>
    const form = document.getElementById('form'); const message = document.getElementById('message'); const password = document.getElementById('password'); const output = document.getElementById('output');
    form.onsubmit = async (event) => { event.preventDefault(); output.textContent = '正在处理…'; const response = await fetch('/api/messages/seal', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({message: message.value, password: password.value}) }); output.textContent = JSON.stringify(await response.json(), null, 2); };
  </script>
</body>
</html>`;

function json(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/") {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(html);
    return;
  }

  if (request.method === "GET" && request.url === "/api/crypto-inventory") {
    json(response, 200, {
      applicationAssets: [
        { algorithm: "PBKDF2-HMAC-SHA256", purpose: "key derivation" },
        { algorithm: "AES-256-GCM", purpose: "message encryption" },
        { algorithm: "RSA-2048-PSS-SHA256", purpose: "message signature" },
      ],
      note: "Demo-only keys; production systems should use KMS/HSM.",
    });
    return;
  }

  if (request.method === "POST" && request.url === "/api/messages/seal") {
    try {
      const input = JSON.parse(await readBody(request)) as {
        message?: string;
        password?: string;
      };
      const message = input.message ?? "";
      const password = input.password ?? "demo-password";
      const salt = randomBytes(16);
      const nonce = randomBytes(12);
      const key = pbkdf2Sync(password, salt, 600_000, 32, "sha256");
      const cipher = createCipheriv("aes-256-gcm", key, nonce);
      const ciphertext = Buffer.concat([
        cipher.update(Buffer.from(message, "utf8")),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      const signature = sign(
        "sha256",
        Buffer.concat([ciphertext, tag]),
        {
          key: signingKey.privateKey,
          padding: constants.RSA_PKCS1_PSS_PADDING,
          saltLength: 32,
        },
      );
      json(response, 200, {
        ciphertext: ciphertext.toString("base64"),
        authTag: tag.toString("base64"),
        salt: salt.toString("base64"),
        nonce: nonce.toString("base64"),
        signature: signature.toString("base64"),
        algorithms: {
          kdf: "PBKDF2-HMAC-SHA256",
          encryption: "AES-256-GCM",
          signature: "RSA-2048-PSS-SHA256",
        },
      });
      return;
    } catch (error) {
      json(response, 400, { error: String(error) });
      return;
    }
  }

  json(response, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`application listening on ${port}`);
});


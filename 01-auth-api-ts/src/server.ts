import { createServer, IncomingMessage, ServerResponse } from "node:http";
import {
  createCipheriv,
  createHmac,
  generateKeyPairSync,
  pbkdf2Sync,
  randomBytes,
} from "node:crypto";
import { SignJWT } from "jose";

const port = Number(process.env.PORT ?? 3001);
const users = new Map<string, { salt: Buffer; passwordHash: Buffer }>();
const jwtSecret = randomBytes(32);

const rsaKeys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const ecKeys = generateKeyPairSync("ec", { namedCurve: "prime256v1" });

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

async function body(req: IncomingMessage): Promise<Record<string, string>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, string>;
}

function derivePassword(password: string, salt: Buffer): Buffer {
  return pbkdf2Sync(password, salt, 600_000, 32, "sha256");
}

function protectRefreshToken(username: string): string {
  const key = randomBytes(32);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([cipher.update(username, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const mac = createHmac("sha256", key).update(encrypted).digest("hex");
  return `${nonce.toString("base64url")}.${encrypted.toString("base64url")}.${tag.toString("base64url")}.${mac}`;
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/api/crypto-inventory") {
    json(res, 200, {
      language: "TypeScript",
      assets: [
        { algorithm: "PBKDF2-HMAC-SHA256", purpose: "password derivation", source: "src/server.ts" },
        { algorithm: "AES-256-GCM", purpose: "refresh-token protection", source: "src/server.ts" },
        { algorithm: "HMAC-SHA256", purpose: "integrity/MAC", source: "src/server.ts" },
        { algorithm: "RSA-2048-PKCS1-SHA256", purpose: "JWT signing key", source: "src/server.ts" },
        { algorithm: "RSA-2048-PSS-SHA256", purpose: "JWT signing key", source: "src/server.ts" },
        { algorithm: "ECDSA P-256 / ES256", purpose: "JWT signing key", source: "src/server.ts" },
      ],
    });
    return;
  }

  if (req.method === "POST" && req.url === "/register") {
    const input = await body(req);
    const salt = randomBytes(16);
    users.set(input.username, { salt, passwordHash: derivePassword(input.password, salt) });
    json(res, 201, { username: input.username, status: "registered" });
    return;
  }

  if (req.method === "POST" && req.url === "/login") {
    const input = await body(req);
    const user = users.get(input.username);
    if (!user) { json(res, 401, { error: "invalid credentials" }); return; }
    const candidate = derivePassword(input.password, user.salt);
    if (!candidate.equals(user.passwordHash)) { json(res, 401, { error: "invalid credentials" }); return; }

    const hs256Token = await new SignJWT({ role: "user" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(input.username).setIssuedAt().setExpirationTime("1h")
      .sign(jwtSecret);
    const rsaToken = await new SignJWT({ role: "user" })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setSubject(input.username).setIssuedAt().setExpirationTime("1h")
      .sign(rsaKeys.privateKey);
    const rsaPssToken = await new SignJWT({ role: "user" })
      .setProtectedHeader({ alg: "PS256", typ: "JWT" })
      .setSubject(input.username).setIssuedAt().setExpirationTime("1h")
      .sign(rsaKeys.privateKey);
    const ecToken = await new SignJWT({ role: "user" })
      .setProtectedHeader({ alg: "ES256", typ: "JWT" })
      .setSubject(input.username).setIssuedAt().setExpirationTime("1h")
      .sign(ecKeys.privateKey);

    json(res, 200, { hs256Token, rsaToken, rsaPssToken, ecToken, protectedRefreshToken: protectRefreshToken(input.username) });
    return;
  }

  json(res, 404, { error: "not found" });
});

server.listen(port, "0.0.0.0", () => console.log(`auth API listening on ${port}`));

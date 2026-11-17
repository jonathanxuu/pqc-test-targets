# 02 File Vault - Go

命令行文件加密测试靶子。代码同时保留标准库和 `golang.org/x/crypto` 调用，测试扫描器对 Go 内置算法与第三方依赖的识别能力。

## 算法靶点

- `Argon2id`：口令派生
- `AES-256-GCM`：文件加密
- `ChaCha20-Poly1305`：备用文件加密
- `RSA-OAEP-SHA256`：密钥封装
- `Ed25519`：文件签名
- `SHA-256`：文件摘要

## 运行

```bash
go mod tidy
go run . inventory
go run . encrypt --in message.txt --out message.enc --password demo-password
```

这是演示项目，RSA 和 Ed25519 密钥在进程启动时生成，不用于生产。

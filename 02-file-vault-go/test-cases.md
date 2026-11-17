# Test cases

1. 扫描 `main.go`，应识别 Argon2id、AES-GCM、ChaCha20-Poly1305、RSA-OAEP、Ed25519、SHA-256。
2. 扫描 `go.mod`，应识别 `golang.org/x/crypto`。
3. 运行 `go run . inventory`，核对算法清单。
4. 加密后再解密文件，确认 AES-GCM 流程正常。
5. 运行 `echo test | go run . demo`，检查签名、摘要和 RSA-OAEP 路径。

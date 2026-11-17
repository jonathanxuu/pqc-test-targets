# Test cases

1. 扫描 `main.py`，识别 PBKDF2、AES-GCM、RSA-PSS、ECDSA、Ed25519 和 JWT。
2. 扫描 `requirements.txt`，识别 `cryptography` 和 `PyJWT`。
3. 运行 `python main.py inventory`，核对运行时算法清单。
4. 运行 `python main.py demo`，确认加密、签名和 JWT 流程执行。

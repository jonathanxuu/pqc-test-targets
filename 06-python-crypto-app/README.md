# 06 Python Crypto App

Python 密码学应用靶子，使用 `cryptography` 和 `PyJWT` 实现密码派生、对称加密、数字签名和 JWT。

## 算法

- PBKDF2-HMAC-SHA256
- AES-256-GCM
- RSA-2048-PSS-SHA256
- ECDSA P-256 / SHA-256
- Ed25519
- JWT HS256 / RS256

## 运行

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py inventory
python main.py demo
```

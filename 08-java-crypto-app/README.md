# 08 Java Crypto App

Java 密码学应用靶子，覆盖 JCA/JCE 标准 API 和 Bouncy Castle 第三方 Provider。

## 算法

- PBKDF2WithHmacSHA256
- AES/GCM/NoPadding
- RSA-PSS with SHA-256
- SHA256withECDSA / secp256r1
- Ed25519
- HmacSHA256
- Bouncy Castle Provider

## 运行

```bash
mvn compile exec:java
```

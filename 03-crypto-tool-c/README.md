# 03 Crypto Tool - C / OpenSSL

使用 C 语言直接调用 OpenSSL `libcrypto` 的密码学测试靶子。重点测试扫描器能否从 EVP API 和参数中推断实际算法。

## 算法靶点

- `AES-256-GCM`：AEAD 加密
- `RSA-PSS-SHA256`：签名参数
- `RSA-OAEP-SHA256`：密钥封装参数
- `ECDSA P-256`：椭圆曲线签名参数
- `Ed25519`：现代签名接口
- `SHA-1`：遗留摘要
- `SHA-256`：现代摘要

## 运行

需要安装 OpenSSL 开发包：

```bash
make
./crypto-tool
```

macOS 可以使用：

```bash
brew install openssl@3 pkg-config
make OPENSSL_PREFIX="$(brew --prefix openssl@3)"
```

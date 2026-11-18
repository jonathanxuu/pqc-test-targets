# Cryptography Test Targets

第一阶段应用层密码学测试靶场：每个项目使用一种语言，并提供预期算法清单，方便和 CBOM 扫描结果对比。

| 目录 | 语言 | 类型 |
|---|---|---|
| `01-auth-api-ts` | TypeScript | 用户认证 API |
| `02-file-vault-go` | Go | 文件加密命令行工具 |
| `03-crypto-tool-c` | C | OpenSSL 密码学工具 |
| `04-binary-file-signer-c` | C | stripped 二进制签名工具 |
| `05-openvpn-lab` | OpenVPN 配置与运行时 | VPN 静态发现和真实隧道 |
| `06-python-crypto-app` | Python | cryptography / PyJWT 应用 |
| `07-rust-crypto-app` | Rust | RustCrypto 应用 |
| `08-java-crypto-app` | Java | JCA/JCE / Bouncy Castle 应用 |
| `09-cert-key-corpus` | 多格式密码资产 | 证书、私钥、密钥库和 SSH 密钥样本 |

这些项目用于测试平台对源代码、依赖库、配置文件、二进制文件以及运行中网络服务的密码算法识别能力。

## 靶子说明

### `tls12-site`

模拟一个只支持 TLS 1.2 的 HTTPS 网站，应用层包含 PBKDF2、AES-256-GCM 和 RSA-PSS，用于测试传统 TLS 环境和应用层密码算法识别。

### `tls13-pqc-site`

模拟一个使用 TLS 1.3 和 `X25519MLKEM768` 的 HTTPS 网站，应用层逻辑与 TLS 1.2 网站类似，用于测试后量子混合密钥交换的配置和运行时协商。

### `01-auth-api-ts`

使用 TypeScript 实现用户注册、登录和 JWT 生成，覆盖 PBKDF2、AES-GCM、HMAC、RSA、RSA-PSS、ECDSA 和 JWT，用于测试 Node.js/TypeScript 源码与依赖扫描。

### `02-file-vault-go`

使用 Go 实现文件加密和解密命令行工具，覆盖 Argon2id、AES-GCM、ChaCha20-Poly1305、RSA-OAEP、Ed25519 和 SHA-256，用于测试 Go 标准库及第三方密码库识别。

### `03-crypto-tool-c`

使用 C 语言直接调用 OpenSSL `libcrypto`，通过 EVP API 实现 AES-GCM、RSA-PSS、RSA-OAEP、ECDSA、Ed25519、SHA-1 和 SHA-256，用于测试 C/OpenSSL 间接算法识别。

### `04-binary-file-signer-c`

使用 C 编译出一个 RSA-2048-PSS-SHA256 文件签名程序，并提供带调试符号和 stripped 两种二进制，用于测试平台从二进制文件反向识别 OpenSSL、RSA-PSS 和 SHA-256。

### `05-openvpn-lab`

提供现代 OpenVPN 配置文件以及服务端、客户端和内部网站组成的运行环境，使用 TLS 1.3、AES-256-GCM 和 SHA-256，用于测试 VPN 配置静态发现和实际隧道运行检测。

### `06-python-crypto-app`

使用 Python 的 `cryptography` 和 `PyJWT` 实现密码派生、AES-GCM 加密、RSA-PSS、ECDSA、Ed25519 签名和 JWT，用于测试 Python 源码与第三方依赖扫描。

### `07-rust-crypto-app`

使用 RustCrypto 生态实现 Argon2id、AES-256-GCM、RSA-PSS、Ed25519 和 SHA-256，用于测试 Rust 源码、Cargo 依赖和密码库调用识别。

### `08-java-crypto-app`

使用 Java JCA/JCE 以及 Bouncy Castle 实现 PBKDF2、AES-GCM、HMAC、RSA-PSS、ECDSA、Ed25519 和 SHA-256，用于测试 Java 标准密码接口与第三方 Provider 识别。

### `09-cert-key-corpus`

提供 RSA、EC、Ed25519、ML-DSA-44 证书，完整证书链，加密/未加密 PEM 与 DER 私钥，PKCS#12、JKS 和 SSH 密钥，并包含过期证书及伪装 PEM 干扰项，用于测试密码资产文件发现、格式解析、有效期判断和不支持格式报告。

## 测试范围总结

```text
源代码静态扫描：TypeScript、Go、C、Python、Rust、Java
配置文件扫描：OpenVPN、Nginx/TLS
二进制扫描：C stripped 签名程序
运行时检测：TLS 1.2、TLS 1.3、OpenVPN 隧道
后量子测试：X25519MLKEM768
证书与密钥资产发现：X.509、PEM、DER、PKCS#12、JKS、SSH、ML-DSA-44
```

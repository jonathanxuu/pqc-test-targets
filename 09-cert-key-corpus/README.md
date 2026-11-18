# 09 Certificate and Key Corpus

这个靶子是一组专门生成的证书、私钥、密钥库和 SSH 密钥样本，用于测试 CBOM 平台的文件系统资产发现能力。

所有私钥都是合成测试数据，不得用于生产环境。加密文件和 SSH 私钥的测试口令统一为：`test-passphrase`。

## 内容

- `certificates/`：RSA-1024、RSA-2048、RSA-4096、EC P-256/P-384/P-521、Ed25519、ML-DSA-44 和已过期证书。
- `chains/`：根 CA、中间 CA、叶子服务器证书组成的完整证书链。
- `private-keys/`：加密/未加密 PEM，以及加密/未加密 DER 私钥。
- `keystores/`：PKCS#12 和 JKS 密钥库。
- `ssh/`：SSH RSA 和 Ed25519 主机密钥、用户密钥，包含加密和未加密两种情况。
- `noise/`：扩展名为 `.pem` 但内容不是证书的干扰文件。
- `expected-inventory.json`：预期识别结果。
- `test-cases.md`：测试检查项。

除 `certificates/expired.crt` 外，其余证书从 2026-11-18 起有效 365 天，不会在一年内过期。

## 重要说明

`pq-ml-dsa-44.crt` 是使用支持 ML-DSA-44 的 OpenSSL 生成的后量子签名证书。若待测平台暂不支持 ML-DSA，应将结果记录为“不支持或无法解析”，而不是把它当作普通 RSA/EC 证书。

JKS 文件是特意加入的兼容性测试项；如果平台当前不支持 JKS，预期结果应明确报告为“不支持”，不能静默跳过。

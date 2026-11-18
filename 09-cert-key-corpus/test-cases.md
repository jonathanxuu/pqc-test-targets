# Test Cases

1. 识别 `certificates/` 下 RSA 的算法和 1024/2048/4096 位长度。
2. 识别 EC 证书的具体曲线：P-256、P-384 和 P-521。
3. 识别 Ed25519 证书和 ML-DSA-44 后量子证书。
4. 区分根 CA、中间 CA 和叶子证书，并还原 `root -> intermediate -> leaf` 链。
5. 识别 PEM 与 DER 私钥格式。
6. 识别私钥是否经过密码加密。
7. 解析 PKCS#12；对 JKS 正确报告当前是否支持。
8. 识别 SSH RSA/Ed25519 主机密钥和用户密钥。
9. 将 `certificates/expired.crt` 标记为已过期。
10. 将 `noise/fake-certificate.pem` 标记为非法或未知文件，而不是证书。
11. 验证其他证书的 `notAfter` 至少晚于扫描日期 365 天左右。

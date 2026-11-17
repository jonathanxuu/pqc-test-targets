# Test cases

1. 对 `file-signer-debug` 扫描，识别 RSA、RSA-PSS、SHA-256 和 OpenSSL。
2. 对 `file-signer-stripped` 扫描，测试去除符号表后算法识别能力。
3. 检查是否能识别 `EVP_DigestSignInit` 和 RSA-PSS 参数。
4. 检查是否能区分“发现了 OpenSSL 依赖”和“确认实际使用 RSA-PSS”。

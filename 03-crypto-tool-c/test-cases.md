# Test cases

1. 扫描 `main.c`，应识别 OpenSSL EVP API 和 SHA-1/SHA-256。
2. 识别 `EVP_aes_256_gcm` 为 AES-256-GCM。
3. 识别 RSA padding 参数中的 RSA-PSS 和 RSA-OAEP。
4. 识别 `NID_X9_62_prime256v1` 为 ECDSA P-256。
5. 识别 `EVP_PKEY_ED25519` 为 Ed25519。
6. 扫描 `Makefile`/`CMakeLists.txt`，识别 OpenSSL `libcrypto` 依赖。

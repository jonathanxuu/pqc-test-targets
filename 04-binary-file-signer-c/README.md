# 04 Binary File Signer - C

一个很小的 C 文件签名程序，用于测试二进制文件能否被反编译或逆向扫描出密码算法。

程序使用 OpenSSL `libcrypto`：

- RSA-2048 密钥生成
- RSA-PSS 签名填充
- SHA-256 摘要
- EVP_DigestSign API

程序会自动生成或读取一个 PEM 私钥，然后对输入文件签名。

## 编译

```bash
brew install openssl@3
make OPENSSL_PREFIX="$(brew --prefix openssl@3)"
```

生成两个版本：

```bash
make debug
make stripped
```

- `file-signer-debug`：包含调试符号，方便确认源码级逆向能力。
- `file-signer-stripped`：去除符号表，更接近真实发布二进制。

## 使用

```bash
printf 'binary crypto target\n' > message.txt
./file-signer-debug message.txt message.sig signer-private-key.pem
```

程序会输出签名文件和私钥文件。私钥只用于本地测试，不能用于生产。

## 逆向测试重点

即使扫描 stripped 二进制，也可以尝试识别：

- RSA
- RSA-PSS
- SHA-256
- `EVP_DigestSignInit`
- `RSA_PKCS1_PSS_PADDING`

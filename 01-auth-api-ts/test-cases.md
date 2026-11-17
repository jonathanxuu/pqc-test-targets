# Test cases

1. 扫描 `src/server.ts`，应识别 PBKDF2、AES-GCM、HMAC、RSA、ECDSA。
2. 扫描 `package.json`，应识别 `jose` 依赖。
3. 启动 API，访问 `/api/crypto-inventory`，核对运行时清单。
4. 注册并登录用户，检查返回的 HS256、RS256、PS256、ES256 四种 JWT。

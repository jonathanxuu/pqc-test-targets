# 01 Auth API - TypeScript

一个最小用户认证 API。密码只保存在内存中，适合作为扫描靶子，不用于生产。

## 算法靶点

- `PBKDF2-HMAC-SHA256`：密码派生
- `AES-256-GCM`：应用层令牌保护演示
- `HMAC-SHA256`：HS256 JWT
- `RSA-2048-PKCS1-SHA256`：RS256 JWT 签名密钥
- `RSA-2048-PSS-SHA256`：PS256 JWT 签名密钥
- `ECDSA P-256 / ES256`：ES256 JWT 签名密钥

## 启动

```bash
npm install
npm run build
npm start
```

或：

```bash
docker compose up --build
```

## 接口

```bash
curl http://localhost:3001/api/crypto-inventory
curl -X POST http://localhost:3001/register -H 'content-type: application/json' -d '{"username":"alice","password":"demo-password"}'
curl -X POST http://localhost:3001/login -H 'content-type: application/json' -d '{"username":"alice","password":"demo-password"}'
```

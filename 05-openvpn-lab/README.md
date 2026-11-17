# 04 OpenVPN Lab

OpenVPN 密码学测试靶子，同时覆盖静态配置发现和真实运行时检测。

## 目录

- `configs/openvpn-modern.conf`：TLS 1.3、AES-GCM、SHA-256 配置
- `runtime/`：服务端、客户端和 Docker Compose 运行环境
- `runtime/internal-service/`：只挂在 VPN 内部网络上的测试网站
- `expected-cbom.json`：静态扫描标准答案
- `test-cases.md`：测试用例

## 静态扫描

扫描 `configs/`，应识别 OpenVPN 协议、TLS 版本、数据加密、认证算法和密钥保护方式。

## 运行时检测

```bash
cd runtime
docker compose up --build
```

服务端和客户端会建立 TLS 1.3 的 OpenVPN 隧道；客户端随后通过隧道访问 `10.9.0.100` 的内部测试网站。

真实运行需要 Linux TUN 设备、转发权限和 `NET_ADMIN` 权限。macOS Docker Desktop 如果没有提供 `/dev/net/tun`，静态配置扫描仍然可以使用，运行时部分请放到 Ubuntu 虚拟机或 Linux 服务器执行。

## 运行时靶子中的算法

- TLS 1.3
- RSA-2048：测试证书签名
- AES-256-GCM：VPN 数据通道
- SHA-256：认证和摘要
- ECDHE：TLS 临时密钥交换

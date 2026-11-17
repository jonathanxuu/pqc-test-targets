# Test cases

1. 扫描 `configs/openvpn-modern.conf`，识别 OpenVPN、TLS 1.3、AES-256-GCM、ChaCha20-Poly1305 和 SHA-256。
2. 在 Linux 上启动 `runtime/`，确认客户端成功建立 OpenVPN 隧道。
3. 检查运行时日志，确认实际 TLS 版本和数据通道密码套件。
4. 确认客户端日志出现 `Internal service reached through OpenVPN tunnel`。
5. 确认客户端不能直接加入 `vpn-internal` 网络，只能通过 VPN 路由访问 `10.9.0.100`。

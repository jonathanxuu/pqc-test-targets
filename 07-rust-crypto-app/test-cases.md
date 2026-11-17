# Test cases

1. 扫描 `src/main.rs`，识别 Argon2id、AES-GCM、RSA-PSS、Ed25519 和 SHA-256。
2. 扫描 `Cargo.toml`，识别 RustCrypto 依赖。
3. 运行 `cargo run -- inventory`，核对算法清单。
4. 运行 `cargo run -- demo`，确认加密、签名和摘要流程执行。

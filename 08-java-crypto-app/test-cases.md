# Test cases

1. 扫描 `src/main/java`，识别 JCA/JCE 算法字符串和 KeyPairGenerator 类型。
2. 扫描 `pom.xml`，识别 Bouncy Castle 依赖。
3. 运行 `mvn compile exec:java`，确认 AES、PBKDF2、HMAC、RSA-PSS、ECDSA 和 Ed25519 流程执行。
4. 检查扫描器是否能区分 Java 标准 Provider 与 Bouncy Castle Provider。

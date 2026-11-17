package example.crypto;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.Security;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.MGF1ParameterSpec;
import java.security.spec.PSSParameterSpec;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public final class CryptoInventory {
    private CryptoInventory() {}

    private static byte[] deriveKey(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, 600_000, 256);
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        return factory.generateSecret(spec).getEncoded();
    }

    private static byte[] encryptAesGcm(byte[] plaintext, byte[] keyBytes) throws Exception {
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        byte[] nonce = new byte[12];
        GCMParameterSpec parameters = new GCMParameterSpec(128, nonce);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key, parameters);
        return cipher.doFinal(plaintext);
    }

    private static void signWithAlgorithms(byte[] message) throws Exception {
        KeyPairGenerator rsaGenerator = KeyPairGenerator.getInstance("RSA");
        rsaGenerator.initialize(2048);
        KeyPair rsa = rsaGenerator.generateKeyPair();
        Signature rsaPss = Signature.getInstance("RSASSA-PSS");
        rsaPss.setParameter(new PSSParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256, 32, 1));
        rsaPss.initSign(rsa.getPrivate());
        rsaPss.update(message);
        byte[] rsaSignature = rsaPss.sign();

        KeyPairGenerator ecGenerator = KeyPairGenerator.getInstance("EC");
        ecGenerator.initialize(new ECGenParameterSpec("secp256r1"));
        KeyPair ec = ecGenerator.generateKeyPair();
        Signature ecdsa = Signature.getInstance("SHA256withECDSA");
        ecdsa.initSign(ec.getPrivate());
        ecdsa.update(message);
        byte[] ecdsaSignature = ecdsa.sign();

        KeyPairGenerator edGenerator = KeyPairGenerator.getInstance("Ed25519");
        KeyPair ed = edGenerator.generateKeyPair();
        Signature ed25519 = Signature.getInstance("Ed25519");
        ed25519.initSign(ed.getPrivate());
        ed25519.update(message);
        byte[] edSignature = ed25519.sign();

        System.out.println("RSA-PSS signature bytes: " + rsaSignature.length);
        System.out.println("ECDSA P-256 signature bytes: " + ecdsaSignature.length);
        System.out.println("Ed25519 signature bytes: " + edSignature.length);
    }

    public static void main(String[] args) throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        byte[] message = "java crypto target".getBytes(StandardCharsets.UTF_8);
        byte[] salt = "demo-salt-123456".getBytes(StandardCharsets.UTF_8);
        byte[] key = deriveKey("demo-password".toCharArray(), salt);
        byte[] ciphertext = encryptAesGcm(message, key);

        KeyGenerator hmacGenerator = KeyGenerator.getInstance("HmacSHA256");
        SecretKey hmacKey = hmacGenerator.generateKey();
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(hmacKey);
        byte[] mac = hmac.doFinal(message);

        signWithAlgorithms(message);
        System.out.println("Provider: " + Security.getProvider("BC").getName());
        System.out.println("PBKDF2 key bytes: " + key.length);
        System.out.println("AES-256-GCM ciphertext: " + Base64.getEncoder().encodeToString(ciphertext));
        System.out.println("HmacSHA256 bytes: " + mac.length);
        System.out.println("SHA-256: " + Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-256").digest(message)));
    }
}

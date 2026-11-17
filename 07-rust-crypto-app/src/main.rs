use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{rand_core::OsRng, SaltString},
    Argon2, PasswordHasher,
};
use ed25519_dalek::{Signer, SigningKey};
use rand::rngs::OsRng as RsaOsRng;
use rsa::signature::{RandomizedSigner, SignatureEncoding};
use rsa::{pss::BlindedSigningKey, RsaPrivateKey};
use sha2::{Digest, Sha256};

fn derive_password(password: &[u8]) -> String {
    let salt = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(password, &salt)
        .unwrap()
        .to_string()
}

fn encrypt_message(message: &[u8]) -> Vec<u8> {
    let key = aes_gcm::Key::<Aes256Gcm>::from_slice(&[7u8; 32]);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(&[3u8; 12]);
    cipher.encrypt(nonce, message).unwrap()
}

fn sign_messages(message: &[u8]) -> (Vec<u8>, Vec<u8>) {
    let signing_key = SigningKey::generate(&mut OsRng);
    let ed25519_signature = signing_key.sign(message).to_bytes().to_vec();

    let mut rng = RsaOsRng;
    let rsa_key = RsaPrivateKey::new(&mut rng, 2048).unwrap();
    let rsa_signer = BlindedSigningKey::<Sha256>::new(rsa_key);
    let rsa_signature = rsa_signer.sign_with_rng(&mut rng, message).to_vec();
    (rsa_signature, ed25519_signature)
}

fn inventory() {
    println!(
        r#"{{
  "language": "Rust",
  "assets": [
    {{"algorithm":"Argon2id","purpose":"password derivation"}},
    {{"algorithm":"AES-256-GCM","purpose":"message encryption"}},
    {{"algorithm":"RSA-2048-PSS-SHA256","purpose":"digital signature"}},
    {{"algorithm":"Ed25519","purpose":"digital signature"}},
    {{"algorithm":"SHA-256","purpose":"message digest"}}
  ]
}}"#
    );
}

fn demo() {
    let message = b"rust crypto target";
    let password_hash = derive_password(b"demo-password");
    let ciphertext = encrypt_message(message);
    let (rsa_signature, ed25519_signature) = sign_messages(message);
    let digest = Sha256::digest(message);
    println!("Argon2id: {}", password_hash);
    println!("AES-256-GCM ciphertext bytes: {}", ciphertext.len());
    println!("RSA-PSS signature bytes: {}", rsa_signature.len());
    println!("Ed25519 signature bytes: {}", ed25519_signature.len());
    println!("SHA-256: {:x}", digest);
}

fn main() {
    match std::env::args().nth(1).as_deref() {
        Some("demo") => demo(),
        _ => inventory(),
    }
}

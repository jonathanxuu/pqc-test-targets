import base64
import hashlib
import json
import os
import sys

import jwt
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, ed25519, padding, rsa
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


RSA_PRIVATE_KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)
EC_PRIVATE_KEY = ec.generate_private_key(ec.SECP256R1())
ED_PRIVATE_KEY = ed25519.Ed25519PrivateKey.generate()


def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=600_000)
    return kdf.derive(password.encode())


def encrypt_message(message: str, password: str) -> dict[str, str]:
    salt = os.urandom(16)
    nonce = os.urandom(12)
    key = derive_key(password, salt)
    ciphertext = AESGCM(key).encrypt(nonce, message.encode(), None)
    return {"salt": base64.b64encode(salt).decode(), "nonce": base64.b64encode(nonce).decode(), "ciphertext": base64.b64encode(ciphertext).decode()}


def sign_message(message: bytes) -> dict[str, str]:
    rsa_signature = RSA_PRIVATE_KEY.sign(message, padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.DIGEST_LENGTH), hashes.SHA256())
    ec_signature = EC_PRIVATE_KEY.sign(message, ec.ECDSA(hashes.SHA256()))
    ed_signature = ED_PRIVATE_KEY.sign(message)
    return {"RSA-PSS-SHA256": base64.b64encode(rsa_signature).decode(), "ECDSA-P256-SHA256": base64.b64encode(ec_signature).decode(), "Ed25519": base64.b64encode(ed_signature).decode()}


def inventory() -> None:
    print(json.dumps({"language": "Python", "assets": [
        {"algorithm": "PBKDF2-HMAC-SHA256", "purpose": "password derivation"},
        {"algorithm": "AES-256-GCM", "purpose": "message encryption"},
        {"algorithm": "RSA-2048-PSS-SHA256", "purpose": "digital signature"},
        {"algorithm": "ECDSA P-256 / SHA-256", "purpose": "digital signature"},
        {"algorithm": "Ed25519", "purpose": "digital signature"},
        {"algorithm": "JWT HS256 / RS256", "purpose": "token signing"},
    ]}, indent=2))


def demo() -> None:
    message = b"python crypto target"
    encrypted = encrypt_message(message.decode(), "demo-password")
    signatures = sign_message(message)
    hs256 = jwt.encode({"sub": "alice"}, os.urandom(32), algorithm="HS256")
    rsa_pem = RSA_PRIVATE_KEY.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption())
    rs256 = jwt.encode({"sub": "alice"}, rsa_pem, algorithm="RS256")
    print(json.dumps({"encrypted": encrypted, "sha256": hashlib.sha256(message).hexdigest(), "signatures": signatures, "hs256": hs256, "rs256": rs256}, indent=2))


if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] == "inventory":
        inventory()
    elif sys.argv[1] == "demo":
        demo()
    else:
        raise SystemExit("usage: python main.py inventory|demo")

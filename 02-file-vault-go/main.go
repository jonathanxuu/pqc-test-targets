package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"os"

	"golang.org/x/crypto/argon2"
	"golang.org/x/crypto/chacha20poly1305"
)

var rsaPrivateKey *rsa.PrivateKey
var signingPrivateKey ed25519.PrivateKey

func initKeys() {
	var err error
	rsaPrivateKey, err = rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	_, signingPrivateKey, err = ed25519.GenerateKey(rand.Reader)
	if err != nil {
		panic(err)
	}
}

func deriveKey(password string, salt []byte) []byte {
	return argon2.IDKey([]byte(password), salt, 3, 64*1024, 4, 32)
}

func encryptAESGCM(plaintext []byte, password string) ([]byte, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return nil, err
	}
	key := deriveKey(password, salt)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	nonce := make([]byte, aead.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return nil, err
	}
	sealed := aead.Seal(nil, nonce, plaintext, nil)
	return append(append(salt, nonce...), sealed...), nil
}

func decryptAESGCM(blob []byte, password string) ([]byte, error) {
	if len(blob) < 16+12 {
		return nil, errors.New("ciphertext too short")
	}
	salt, nonce, sealed := blob[:16], blob[16:28], blob[28:]
	key := deriveKey(password, salt)
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}
	return aead.Open(nil, nonce, sealed, nil)
}

func demonstrateOtherAlgorithms(data []byte) map[string]string {
	hash := sha256.Sum256(data)
	signature := ed25519.Sign(signingPrivateKey, data)
	rsaCiphertext, _ := rsa.EncryptOAEP(sha256.New(), rand.Reader, &rsaPrivateKey.PublicKey, data, nil)
	chachaKey := make([]byte, chacha20poly1305.KeySize)
	_, _ = rand.Read(chachaKey)
	chacha, _ := chacha20poly1305.New(chachaKey)
	chachaNonce := make([]byte, chacha.NonceSize())
	_, _ = rand.Read(chachaNonce)
	chachaCiphertext := chacha.Seal(nil, chachaNonce, data, nil)
	publicKey, _ := x509.MarshalPKIXPublicKey(&rsaPrivateKey.PublicKey)
	return map[string]string{
		"SHA-256":           base64.RawStdEncoding.EncodeToString(hash[:]),
		"Ed25519-signature": base64.RawStdEncoding.EncodeToString(signature),
		"RSA-OAEP-SHA256":   base64.RawStdEncoding.EncodeToString(rsaCiphertext),
		"ChaCha20-Poly1305": base64.RawStdEncoding.EncodeToString(chachaCiphertext),
		"RSA-public-key":    base64.RawStdEncoding.EncodeToString(publicKey),
	}
}

func inventory() {
	assets := []map[string]string{
		{"algorithm": "Argon2id", "purpose": "password derivation", "source": "main.go"},
		{"algorithm": "AES-256-GCM", "purpose": "file encryption", "source": "main.go"},
		{"algorithm": "ChaCha20-Poly1305", "purpose": "alternative encryption", "source": "main.go"},
		{"algorithm": "RSA-OAEP-SHA256", "purpose": "key encapsulation", "source": "main.go"},
		{"algorithm": "Ed25519", "purpose": "file signing", "source": "main.go"},
		{"algorithm": "SHA-256", "purpose": "file digest", "source": "main.go"},
	}
	output, _ := json.MarshalIndent(map[string]any{"language": "Go", "assets": assets}, "", "  ")
	fmt.Println(string(output))
}

func main() {
	initKeys()
	if len(os.Args) < 2 || os.Args[1] == "inventory" {
		inventory()
		return
	}
	if os.Args[1] == "encrypt" {
		cmd := flag.NewFlagSet("encrypt", flag.ExitOnError)
		input, output, password := cmd.String("in", "", "input file"), cmd.String("out", "", "output file"), cmd.String("password", "", "password")
		_ = cmd.Parse(os.Args[2:])
		data, err := os.ReadFile(*input)
		if err != nil {
			panic(err)
		}
		sealed, err := encryptAESGCM(data, *password)
		if err != nil {
			panic(err)
		}
		if err := os.WriteFile(*output, sealed, 0600); err != nil {
			panic(err)
		}
		fmt.Printf("encrypted %d bytes\n", len(data))
		return
	}
	if os.Args[1] == "decrypt" {
		cmd := flag.NewFlagSet("decrypt", flag.ExitOnError)
		input, output, password := cmd.String("in", "", "input file"), cmd.String("out", "", "output file"), cmd.String("password", "", "password")
		_ = cmd.Parse(os.Args[2:])
		data, err := os.ReadFile(*input)
		if err != nil {
			panic(err)
		}
		plain, err := decryptAESGCM(data, *password)
		if err != nil {
			panic(err)
		}
		if err := os.WriteFile(*output, plain, 0600); err != nil {
			panic(err)
		}
		fmt.Printf("decrypted %d bytes\n", len(plain))
		return
	}
	if os.Args[1] == "demo" {
		data, _ := io.ReadAll(os.Stdin)
		output, _ := json.MarshalIndent(demonstrateOtherAlgorithms(data), "", "  ")
		fmt.Println(string(output))
		return
	}
	fmt.Fprintln(os.Stderr, "usage: inventory | encrypt | decrypt | demo")
}

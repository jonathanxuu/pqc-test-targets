#include <openssl/evp.h>
#include <openssl/ec.h>
#include <openssl/err.h>
#include <openssl/rsa.h>
#include <openssl/sha.h>
#include <stdio.h>
#include <string.h>

static void print_hex(const unsigned char *data, unsigned int length) {
    for (unsigned int i = 0; i < length; i++) printf("%02x", data[i]);
    putchar('\n');
}

static int digest_examples(const unsigned char *message, size_t length) {
    unsigned char sha1_digest[SHA_DIGEST_LENGTH];
    unsigned char sha256_digest[SHA256_DIGEST_LENGTH];

    /* Legacy algorithm deliberately included for migration testing. */
    SHA1(message, length, sha1_digest);
    SHA256(message, length, sha256_digest);

    printf("SHA-1: ");
    print_hex(sha1_digest, SHA_DIGEST_LENGTH);
    printf("SHA-256: ");
    print_hex(sha256_digest, SHA256_DIGEST_LENGTH);
    return 1;
}

static int aes_gcm_example(const unsigned char *plaintext, int length) {
    unsigned char key[32] = {0};
    unsigned char nonce[12] = {0};
    unsigned char ciphertext[256] = {0};
    unsigned char tag[16] = {0};
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    int written = 0;
    int final_length = 0;

    if (ctx == NULL) return 0;
    EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), NULL, NULL, NULL);
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_IVLEN, sizeof(nonce), NULL);
    EVP_EncryptInit_ex(ctx, NULL, NULL, key, nonce);
    EVP_EncryptUpdate(ctx, ciphertext, &written, plaintext, length);
    EVP_EncryptFinal_ex(ctx, ciphertext + written, &final_length);
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, sizeof(tag), tag);
    EVP_CIPHER_CTX_free(ctx);

    printf("AES-256-GCM ciphertext: ");
    print_hex(ciphertext, (unsigned int)(written + final_length));
    return 1;
}

static void key_api_examples(void) {
    EVP_PKEY_CTX *rsa_context = EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, NULL);
    EVP_PKEY_CTX *ec_context = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, NULL);
    EVP_PKEY_CTX *ed25519_context = EVP_PKEY_CTX_new_id(EVP_PKEY_ED25519, NULL);

    /* RSA-PSS and RSA-OAEP are deliberately explicit for scanner discovery. */
    if (rsa_context != NULL) {
        EVP_PKEY_keygen_init(rsa_context);
        EVP_PKEY_CTX_set_rsa_keygen_bits(rsa_context, 2048);
        EVP_PKEY_CTX_set_rsa_padding(rsa_context, RSA_PKCS1_PSS_PADDING);
        EVP_PKEY_CTX_set_rsa_pss_saltlen(rsa_context, RSA_PSS_SALTLEN_DIGEST);
        EVP_PKEY_CTX_set_rsa_padding(rsa_context, RSA_PKCS1_OAEP_PADDING);
        EVP_PKEY_CTX_free(rsa_context);
    }

    /* ECDSA P-256 and Ed25519 are separate key-generation paths. */
    if (ec_context != NULL) {
        EVP_PKEY_paramgen_init(ec_context);
        EVP_PKEY_CTX_set_ec_paramgen_curve_nid(ec_context, NID_X9_62_prime256v1);
        EVP_PKEY_CTX_free(ec_context);
    }
    if (ed25519_context != NULL) EVP_PKEY_CTX_free(ed25519_context);
}

int main(void) {
    const unsigned char message[] = "cryptography inventory target";
    printf("C / OpenSSL crypto target\n");
    printf("Algorithms: AES-256-GCM, RSA-PSS-SHA256, RSA-OAEP-SHA256, ECDSA P-256, Ed25519, SHA-1, SHA-256\n");
    digest_examples(message, strlen((const char *)message));
    aes_gcm_example(message, (int)strlen((const char *)message));
    key_api_examples();
    ERR_print_errors_fp(stderr);
    return 0;
}

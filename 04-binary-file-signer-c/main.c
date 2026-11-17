#include <openssl/err.h>
#include <openssl/evp.h>
#include <openssl/pem.h>
#include <openssl/rsa.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void print_errors(void) {
    ERR_print_errors_fp(stderr);
}

static EVP_PKEY *generate_rsa_key(void) {
    EVP_PKEY *key = NULL;
    EVP_PKEY_CTX *keygen = EVP_PKEY_CTX_new_id(EVP_PKEY_RSA, NULL);
    if (keygen == NULL) return NULL;
    if (EVP_PKEY_keygen_init(keygen) <= 0 ||
        EVP_PKEY_CTX_set_rsa_keygen_bits(keygen, 2048) <= 0 ||
        EVP_PKEY_keygen(keygen, &key) <= 0) {
        EVP_PKEY_free(key);
        key = NULL;
    }
    EVP_PKEY_CTX_free(keygen);
    return key;
}

static EVP_PKEY *load_or_create_key(const char *path) {
    FILE *key_file = fopen(path, "rb");
    EVP_PKEY *key = NULL;
    if (key_file != NULL) {
        key = PEM_read_PrivateKey(key_file, NULL, NULL, NULL);
        fclose(key_file);
        return key;
    }

    key = generate_rsa_key();
    if (key == NULL) return NULL;
    key_file = fopen(path, "wb");
    if (key_file == NULL || PEM_write_PrivateKey(key_file, key, NULL, NULL, 0, NULL, NULL) != 1) {
        if (key_file != NULL) fclose(key_file);
        EVP_PKEY_free(key);
        return NULL;
    }
    fclose(key_file);
    return key;
}

static int sign_file(const char *input_path, const char *signature_path, EVP_PKEY *key) {
    FILE *input = fopen(input_path, "rb");
    FILE *signature_file = NULL;
    EVP_MD_CTX *digest_context = NULL;
    EVP_PKEY_CTX *signature_context = NULL;
    unsigned char buffer[4096];
    unsigned char *signature = NULL;
    size_t signature_length = 0;
    size_t bytes_read;
    int result = 0;

    if (input == NULL) return 0;
    digest_context = EVP_MD_CTX_new();
    if (digest_context == NULL) goto cleanup;

    /* SHA-256 digest with RSA-PSS signature padding. */
    if (EVP_DigestSignInit(digest_context, &signature_context, EVP_sha256(), NULL, key) <= 0) goto cleanup;
    if (EVP_PKEY_CTX_set_rsa_padding(signature_context, RSA_PKCS1_PSS_PADDING) <= 0) goto cleanup;
    if (EVP_PKEY_CTX_set_rsa_pss_saltlen(signature_context, RSA_PSS_SALTLEN_DIGEST) <= 0) goto cleanup;

    while ((bytes_read = fread(buffer, 1, sizeof(buffer), input)) > 0) {
        if (EVP_DigestSignUpdate(digest_context, buffer, bytes_read) <= 0) goto cleanup;
    }
    if (ferror(input)) goto cleanup;
    if (EVP_DigestSignFinal(digest_context, NULL, &signature_length) <= 0) goto cleanup;

    signature = malloc(signature_length);
    if (signature == NULL) goto cleanup;
    if (EVP_DigestSignFinal(digest_context, signature, &signature_length) <= 0) goto cleanup;

    signature_file = fopen(signature_path, "wb");
    if (signature_file == NULL) goto cleanup;
    if (fwrite(signature, 1, signature_length, signature_file) != signature_length) goto cleanup;
    result = 1;

cleanup:
    if (!result) print_errors();
    if (signature_file != NULL) fclose(signature_file);
    free(signature);
    EVP_MD_CTX_free(digest_context);
    fclose(input);
    return result;
}

int main(int argc, char **argv) {
    const char *input_path;
    const char *signature_path;
    const char *key_path;
    EVP_PKEY *key;

    if (argc != 4) {
        fprintf(stderr, "usage: %s <input-file> <signature-file> <private-key.pem>\n", argv[0]);
        return 2;
    }
    input_path = argv[1];
    signature_path = argv[2];
    key_path = argv[3];
    key = load_or_create_key(key_path);
    if (key == NULL) {
        print_errors();
        return 1;
    }
    if (!sign_file(input_path, signature_path, key)) {
        EVP_PKEY_free(key);
        return 1;
    }
    printf("signed %s with RSA-2048-PSS-SHA256 -> %s\n", input_path, signature_path);
    EVP_PKEY_free(key);
    return 0;
}

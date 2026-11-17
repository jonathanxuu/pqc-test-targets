CC ?= cc
OPENSSL_PREFIX ?=
CFLAGS ?= -O2 -Wall -Wextra -std=c11

ifeq ($(OPENSSL_PREFIX),)
OPENSSL_FLAGS := $(shell pkg-config --cflags --libs openssl)
else
OPENSSL_FLAGS := -I$(OPENSSL_PREFIX)/include -L$(OPENSSL_PREFIX)/lib -lssl -lcrypto
endif

file-signer: main.c
	$(CC) $(CFLAGS) main.c -o $@ $(OPENSSL_FLAGS)

debug: main.c
	$(CC) -g -O0 -Wall -Wextra -std=c11 main.c -o file-signer-debug $(OPENSSL_FLAGS)

stripped: main.c
	$(CC) -O2 -Wall -Wextra -std=c11 -s main.c -o file-signer-stripped $(OPENSSL_FLAGS)

clean:
	rm -f file-signer file-signer-debug file-signer-stripped *.sig signer-private-key.pem

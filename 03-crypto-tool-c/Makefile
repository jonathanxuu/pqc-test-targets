CC ?= cc
OPENSSL_PREFIX ?=
CFLAGS ?= -O2 -Wall -Wextra -std=c11

ifeq ($(OPENSSL_PREFIX),)
OPENSSL_FLAGS := $(shell pkg-config --cflags --libs openssl)
else
OPENSSL_FLAGS := -I$(OPENSSL_PREFIX)/include -L$(OPENSSL_PREFIX)/lib -lssl -lcrypto
endif

crypto-tool: main.c
	$(CC) $(CFLAGS) main.c -o $@ $(OPENSSL_FLAGS)

clean:
	rm -f crypto-tool

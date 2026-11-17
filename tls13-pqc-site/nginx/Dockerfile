# Debian 13 (Trixie) ships OpenSSL 3.5 and an arm64 Nginx package.
FROM debian:trixie-slim

RUN apt-get -o Acquire::Retries=10 update \
  && apt-get -o Acquire::Retries=10 install --fix-missing -y --no-install-recommends \
    ca-certificates nginx openssl \
  && rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 443
ENTRYPOINT ["/entrypoint.sh"]

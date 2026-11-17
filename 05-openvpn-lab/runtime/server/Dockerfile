FROM debian:trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openvpn openssl iproute2 iptables procps \
  && rm -rf /var/lib/apt/lists/*

COPY server-entrypoint.sh /usr/local/bin/server-entrypoint.sh
COPY server.conf /etc/openvpn/server/server.conf
RUN chmod +x /usr/local/bin/server-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/server-entrypoint.sh"]

FROM debian:trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends openvpn iproute2 curl \
  && rm -rf /var/lib/apt/lists/*

COPY client-entrypoint.sh /usr/local/bin/client-entrypoint.sh
COPY client.conf /etc/openvpn/client/client.conf
RUN chmod +x /usr/local/bin/client-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/client-entrypoint.sh"]

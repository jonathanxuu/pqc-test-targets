#!/bin/sh
set -eu

PKI=/shared/pki
mkdir -p "$PKI"

# Allow VPN clients to reach the isolated internal-service network.
sysctl -w net.ipv4.ip_forward=1 >/dev/null 2>&1 || true
iptables -A FORWARD -i tun0 -o eth1 -j ACCEPT || true
iptables -A FORWARD -i eth1 -o tun0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT || true
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth1 -j MASQUERADE || true

if [ ! -f "$PKI/ca.crt" ]; then
  echo "Generating demo OpenVPN PKI..."
  openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
    -keyout "$PKI/ca.key" -out "$PKI/ca.crt" \
    -subj "/CN=OpenVPN Demo CA"

  openssl req -newkey rsa:2048 -nodes \
    -keyout "$PKI/server.key" -out "$PKI/server.csr" \
    -subj "/CN=openvpn-server"
  printf 'subjectAltName=DNS:openvpn-server\nextendedKeyUsage=serverAuth\n' > "$PKI/server.ext"
  openssl x509 -req -days 365 -in "$PKI/server.csr" \
    -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" -CAcreateserial \
    -out "$PKI/server.crt" -extfile "$PKI/server.ext"

  openssl req -newkey rsa:2048 -nodes \
    -keyout "$PKI/client.key" -out "$PKI/client.csr" \
    -subj "/CN=openvpn-client"
  printf 'extendedKeyUsage=clientAuth\n' > "$PKI/client.ext"
  openssl x509 -req -days 365 -in "$PKI/client.csr" \
    -CA "$PKI/ca.crt" -CAkey "$PKI/ca.key" -CAcreateserial \
    -out "$PKI/client.crt" -extfile "$PKI/client.ext"

  openvpn --genkey secret "$PKI/ta.key"
  chmod 600 "$PKI"/*.key
fi

exec openvpn --config /etc/openvpn/server/server.conf

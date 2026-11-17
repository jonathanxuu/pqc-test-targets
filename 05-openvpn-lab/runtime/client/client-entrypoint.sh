#!/bin/sh
set -eu

until [ -f /shared/pki/client.crt ] && [ -f /shared/pki/ta.key ]; do
  echo "Waiting for OpenVPN server PKI..."
  sleep 2
done

openvpn --config /etc/openvpn/client/client.conf > /tmp/openvpn-client.log 2>&1 &
VPN_PID=$!
trap 'kill "$VPN_PID" 2>/dev/null || true' EXIT

until ip link show tun0 >/dev/null 2>&1; do
  if ! kill -0 "$VPN_PID" 2>/dev/null; then
    cat /tmp/openvpn-client.log
    exit 1
  fi
  sleep 2
done

echo "VPN tunnel is up; testing internal service through 10.9.0.0/24..."
curl --fail --max-time 15 http://10.9.0.100/ \
  && echo "Internal service reached through OpenVPN tunnel"

cat /tmp/openvpn-client.log
wait "$VPN_PID"

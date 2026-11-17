# TLS 1.3 + X25519MLKEM768 target

This is an independent copy of the TLS 1.2 target. Its application behavior
is intentionally the same, so the test isolates the TLS termination change.

Planned TLS configuration:

```nginx
ssl_protocols TLSv1.3;
ssl_ecdh_curve X25519MLKEM768:X25519:prime256v1;
```

The image uses Debian 13 (Trixie), whose official Nginx package is linked with
OpenSSL 3.5. This avoids compiling OpenSSL and Nginx locally.


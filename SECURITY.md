# Security Policy

## Supported Versions

Security updates are provided for the latest release of MQTT Explorer.

| Version | Supported          |
| ------- | ------------------ |
| 0.4.x   | :white_check_mark: |
| < 0.4   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please follow these steps:

### How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Report via one of these channels:
   - GitHub Security Advisories (preferred): https://github.com/thomasnordquist/MQTT-Explorer/security/advisories/new
   - Email the maintainer directly
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will provide updates on the status of your report within 7 days
- **Fix Timeline**: We aim to release security fixes within 30 days for critical issues
- **Credit**: With your permission, we will credit you in the security advisory and release notes

## Security Features

### Browser Mode Security

MQTT Explorer's browser mode includes several security features:

#### Authentication
- **bcrypt Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
- **Constant-Time Comparison**: Username comparison uses crypto.timingSafeEqual() to prevent timing attacks
- **Environment Variable Configuration**: Credentials can be set via environment variables for production
- **Automatic Credential Generation**: Secure random credentials generated if not provided

#### Rate Limiting
- **Authentication Rate Limiting**: Maximum 5 failed authentication attempts per IP per 15 minutes
- **Per-IP Tracking**: Failed attempts tracked separately for each client IP
- **Automatic Reset**: Rate limit counters automatically reset after 15 minutes

#### HTTP Security Headers (helmet.js)
- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **HTTP Strict Transport Security (HSTS)**: Enforces HTTPS in production
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-XSS-Protection**: Enables browser XSS protection

#### Input Validation
- **File Size Limits**: Maximum 16MB for file uploads
- **Path Traversal Protection**: All file paths validated and sanitized
- **Filename Sanitization**: Removes path separators, null bytes, and validates against traversal patterns
- **Real Path Validation**: Ensures resolved paths stay within allowed directories
- **Base64 Validation**: All file data properly validated before processing

#### CORS Configuration
- **Configurable Origins**: CORS origins configurable via ALLOWED_ORIGINS environment variable
- **Production Restrictions**: Wildcard CORS automatically disabled in production
- **Credential Support**: CORS configured with credentials: true for authenticated requests

#### Error Handling
- **Generic Error Messages**: Detailed errors only shown in development mode
- **No Information Leakage**: Error messages sanitized to prevent information disclosure
- **Secure Logging**: Sensitive information not logged in production

## Security Best Practices

### For Server Deployment

1. **Always Use HTTPS in Production**
   - Use a reverse proxy (nginx, Apache) with TLS certificates
   - Never expose the Node.js server directly to the internet
   - Use Let's Encrypt for free TLS certificates

2. **Set Strong Credentials**
   ```bash
   export MQTT_EXPLORER_USERNAME=your_secure_username
   export MQTT_EXPLORER_PASSWORD=your_strong_password_min_12_chars
   export NODE_ENV=production
   ```

3. **Configure CORS Properly**
   ```bash
   # Single origin
   export ALLOWED_ORIGINS=https://mqtt-explorer.example.com
   
   # Multiple origins
   export ALLOWED_ORIGINS=https://app1.example.com,https://app2.example.com
   ```

4. **Network Security**
   - Deploy behind a firewall or VPN
   - Use IP whitelisting when possible
   - Implement network-level rate limiting
   - Monitor access logs regularly

5. **Keep Dependencies Updated**
   ```bash
   yarn audit
   yarn upgrade-interactive
   ```

6. **Regular Security Audits**
   - Run security tests: `yarn test:security`
   - Review access logs for suspicious activity
   - Monitor authentication failures
   - Check for outdated dependencies

### For MQTT Connections

1. **Use TLS/SSL**: Always connect to MQTT brokers using TLS encryption
2. **Strong Credentials**: Use unique, strong passwords for MQTT authentication
3. **Certificate Validation**: Verify broker certificates in production
4. **Least Privilege**: Connect with minimal required permissions

## Security Testing

The project includes comprehensive security tests:

```bash
# Run all tests including security tests
yarn test

# Run only security tests
npx mocha --require source-map-support/register dist/src/spec/security-tests.spec.js
```

Security tests cover:
- Path traversal attack prevention
- Input validation and sanitization
- Authentication security
- CORS configuration
- Rate limiting
- Error handling
- Data sanitization

## Security Audit History

### December 2024 - Initial Security Review
- Added helmet.js for HTTP security headers
- Implemented rate limiting for authentication
- Added path traversal protection with sanitization
- Implemented constant-time comparison for credentials
- Added input validation and size limits
- Removed credential logging in production
- Added configurable CORS origins
- Created comprehensive security test suite (19 tests)
- Enhanced documentation with security best practices

## Known Limitations

### Browser Mode
- File system access limited to server-side directories
- No native OS dialogs (uses browser file input)
- Session management is stateless (no persistent sessions)

### Desktop Mode (Electron)
- Inherits security model from Electron framework
- IPC communication between renderer and main process
- No network exposure by default

## Recommended Security Tools

- **Dependency Scanning**: Dependabot, Snyk, or npm audit
- **SAST**: SonarQube, ESLint security plugins
- **Container Scanning**: If using Docker deployment
- **TLS Testing**: SSL Labs, testssl.sh
- **Penetration Testing**: OWASP ZAP, Burp Suite

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [helmet.js Documentation](https://helmetjs.github.io/)
- [MQTT Security](https://mqtt.org/mqtt-specification/)

## Contact

For security-related questions or concerns:
- GitHub Security Advisories: https://github.com/thomasnordquist/MQTT-Explorer/security/advisories
- Project Issues (for non-sensitive topics): https://github.com/thomasnordquist/MQTT-Explorer/issues

Thank you for helping keep MQTT Explorer secure!

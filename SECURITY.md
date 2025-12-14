# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing **security@gitgrade.com** (or create a private security advisory on GitHub).

**Do not** create a public GitHub issue for security vulnerabilities.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and notify you when it's released

## Security Best Practices

### For Users

1. **Keep API Keys Secure**: Never commit `.env` files to version control
2. **Use Environment Variables**: Store sensitive data in environment variables
3. **Rate Limiting**: Respect API rate limits to avoid service disruption
4. **HTTPS Only**: Always use HTTPS in production

### For Contributors

1. **No Hardcoded Secrets**: Use environment variables for all sensitive data
2. **Dependency Updates**: Keep dependencies up to date
3. **Input Validation**: Always validate and sanitize user input
4. **Code Review**: All PRs must be reviewed before merging

## Known Issues

None currently reported.

## Security Updates

Security updates will be released as patch versions and announced via:
- GitHub Security Advisories
- Release notes
- Project README

Thank you for helping keep GitGrade secure! 🔒

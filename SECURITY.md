# Security Policy

## Supported Versions

We provide security support for the **latest major version** of the package only. All previous major versions are considered deprecated and will not receive security updates.

For critical security vulnerabilities, we will backport fixes to the **last relevant minor version** of the current major version to ensure users can apply security patches without upgrading to a new minor release.

**Current package version: 7.0.x**

| Version | Supported          |
| ------- | ------------------ |
| 7.x.x   | :white_check_mark: |
| 6.x.x   | :white_check_mark: |
| < 6.0.0 | :x:                |

### Examples

- **Version 7.x.x** (current): Fully supported with security updates.
- **Version 6.x.x**: ✅ Will receive backported fixes for critical security vulnerabilities, but recommended to upgrade to the latest version.
- **Version < 6.x.x**: ❌ Deprecated - no security updates provided.

## Reporting a Vulnerability

If you have discovered a security vulnerability in this project, please report it privately.
**Do not disclose it as a public issue**. This gives us time to work with you to fix the issue before public exposure, reducing the chance that the exploit will be used before a patch is released. Please disclose it at [security advisory](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new).

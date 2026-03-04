# Security Policy

## Supported Versions

We provide security support for the **latest major version** of the package only. All previous major versions are considered deprecated and will not receive security updates.

For critical security vulnerabilities, we will backport fixes to the **last relevant minor version** of the current major version to ensure users can apply security patches without upgrading to a new minor release.

**Current package version: 6.5.0**

| Version | Supported          |
| ------- | ------------------ |
| 6.x.x   | :white_check_mark: |
| < 6.0.0 | :x:                |

### Examples

- **Version 6.5.0** (current): ✅ Fully supported with security updates
- **Version 6.4.x**: ✅ Will receive backported fixes for critical security vulnerabilities
- **Version 6.0.x**: ✅ Supported, but recommended to upgrade to the latest 6.x.x version
- **Version 5.x.x**: ❌ Deprecated - no security updates provided
- **Version 4.x.x or below**: ❌ Deprecated - no security updates provided

## Reporting a Vulnerability

If you have discovered a security vulnerability in this project, please report it privately.
**Do not disclose it as a public issue**. This gives us time to work with you to fix the issue before public exposure, reducing the chance that the exploit will be used before a patch is released. Please disclose it at [security advisory](https://github.com/IgniteUI/igniteui-webcomponents/security/advisories/new).

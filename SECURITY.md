# Security Policy

## Supported Versions

KeySprout is currently in early development (pre-1.0). Security fixes are applied to the latest release only.

| Version | Supported |
|---------|-----------|
| latest  | Yes       |
| older   | No        |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability, email **malakaidmj@gmail.com** with:

1. A description of the vulnerability and its potential impact
2. Steps to reproduce or a proof-of-concept
3. Any relevant file paths or component names

You should receive a response within **72 hours**. If you don't hear back, follow up in the same email thread.

Once a fix is confirmed, we will:
- Patch the vulnerability and release a new version
- Credit you in the release notes (unless you prefer to remain anonymous)
- Publish a brief advisory in the GitHub Security Advisories tab

## Scope

The following are in scope for vulnerability reports:

- Authentication bypasses (admin cookie forgery, session hijacking)
- Privilege escalation (student accessing teacher or admin routes)
- SQL injection or Prisma query manipulation
- Exposure of personally identifiable information (real Google emails, names)
- Cross-site scripting (XSS) in any student-facing or teacher-facing UI

The following are **out of scope**:

- Denial-of-service attacks that require valid admin credentials
- Vulnerabilities in third-party dependencies that have no published fix yet
- Issues that only affect self-hosted instances misconfigured by the operator

## Privacy Design

KeySprout is designed to store as little personal data as possible. Students authenticate with Google but only their opaque `sub` identifier is stored — real names and email addresses are never saved. Nicknames are generated deterministically from `sub` using a one-way hash. See `CODEBASE.md` for a full privacy audit table.

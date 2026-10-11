# Security Specification & Test Matrix

## 1. Data Invariants
- `site_config/{configId}`: Defines global brand settings and IPTV configurations. Read is public so visitors see customizations; write is authorized.
- `apps/{appId}`: Publicly accessible catalog of vehicle apps. Valid string IDs required.
- `news/{newsId}`: Publicly accessible automotive news articles.
- `products/{productId}`: Publicly accessible store catalog items.
- `wallpapers/{wallpaperId}`: Publicly accessible vehicle wallpapers.
- `contact_messages/{messageId}`: Public write (visitor submissions), protected read.

## 2. Dirty Dozen Invariant Payloads
1. ID Poisoning (1.5KB string path ID): Rejected by `isValidId`.
2. ID with invalid special characters (e.g. `../../admin`): Rejected by `isValidId` regex `^[a-zA-Z0-9_\-]+$`.
3. Unauthenticated read to `contact_messages`: Rejected (permission denied).
4. Unauthenticated deletion of `contact_messages`: Rejected (permission denied).
5. Catch-all unknown collection read/write (`/private/{doc}`): Rejected by default-deny rule.
6. Empty name in contact message create: Rejected by `request.resource.data.name is string`.
7. Non-string email in contact message create: Rejected by `request.resource.data.email is string`.
8. Oversized document ID (>128 chars): Rejected by `isValidId` size check.
9. Write to random root path (`/test`): Rejected by default-deny rule.
10. System root access (`/{document=**}`): Denied.
11. Malformed payload with null message on contact form: Rejected.
12. Attempt to read other users' unlisted collections: Denied.

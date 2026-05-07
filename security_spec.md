# Security Specification for Sora Sushi

## Data Invariants
1. A booking cannot be created without a valid user ID that matches the authenticated user.
2. Users can only see their own profile, bookings, and notifications.
3. Admins (defined in the `admins` collection) have read/write access to all collections for management.
4. Timestamps (`createdAt`) must be server-generated (`request.time`).
5. Document IDs must be alphanumeric and of reasonable length.

## The Dirty Dozen (Attacker Payloads)

1. **Identity Theft (Booking)**: Create a booking with `clientId` set to another user's ID.
2. **PII Scraping**: Attempting to `list` all users to extract emails.
3. **Status Hijack**: Creating a booking with `status: 'confirmed'` bypassing payment/admin check.
4. **Deposit Forgery**: Updating a booking to `depositPaid: true` without actual payment.
5. **Notification Spam**: Writing a notification to another user's ID.
6. **Shadow Fields**: Adding a `verfied: true` field to a user profile.
7. **Junk ID**: Creating a booking with a 2MB long string as the document ID.
8. **Time Travel**: Setting `createdAt` to a date in the past.
9. **Orphaned Writes**: Creating a booking for a menu that doesn't exist (if checked).
10. **Admin Escalation**: Trying to create a document in the `admins` collection.
11. **PII Leakage**: Authenticated but non-owner user attempting to `get` a private user profile.
12. **Bulk Delete**: Attempting to delete all bookings via a collection-wide operation.

## Firestore Rules Draft
(To be implemented in firestore.rules after validation)

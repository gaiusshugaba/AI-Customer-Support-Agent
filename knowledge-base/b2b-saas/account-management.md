---
doc_id: kb-b2b-004
title: Account & Team Management
tenant_id: b2b-saas-demo
industry_pack: saas
category: account
version: 1.0
last_updated: 2026-07-28
source: internal
---

# Account & Team Management

## User Roles

FlowStack accounts support three roles:

- **Owner** — one per account, billing access, can delete the account, can transfer ownership.
- **Admin** — can manage workflows, connectors, and team members, but cannot change billing or delete the account.
- **Member** — can build and edit workflows they have access to, cannot manage team members or billing.

## Inviting Team Members

Go to **Settings → Team → Invite Member**, enter their email and select a role. Invitees receive an email with a signup link valid for 7 days. Growth and Enterprise plans support unlimited team members; Starter is capped at 3 seats.

## Single Sign-On (SSO)

SSO (SAML 2.0) is available on Enterprise plans only. Once configured by your account manager, team members sign in through your identity provider and new accounts are provisioned automatically on first login — you don't need to send individual invites once SSO is active.

## Changing Account Email

Only the account Owner can change the primary account email, under **Settings → Account → Email**. A confirmation link is sent to both the old and new address; the change only takes effect once the new address is confirmed. This is a security measure and cannot be bypassed by support.

## Deleting Your Account

Account deletion is available to Owners only, under **Settings → Account → Delete Account**. This immediately stops all workflow executions and is irreversible after a 14-day grace period, during which you can contact support to restore the account. After 14 days, all workflow data, execution history, and connector credentials are permanently deleted.

## Transferring Ownership

Go to **Settings → Team → Transfer Ownership**, select the new owner (must already be an Admin on the account), and confirm via the email link sent to the current Owner. The current Owner is automatically downgraded to Admin once the transfer completes.

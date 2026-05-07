# Contributions Smoke Checklist

## Pre-conditions

- Apply migration: `migrations/20260507_003_contributions_foundation.sql`.
- Start app with valid database credentials.
- Enable `Contribuicoes` in `Funcionalidades` for the target list.

## Public Share Page (`/share/[shareId]`)

- Confirm "Contribuicoes" section appears only when feature is enabled.
- Submit contribution with valid values and verify success message.
- Validate error handling for invalid amount (0 or negative).

## Dashboard Payments Tab (`/lists/[listId]/payments`)

- Confirm no 404 and counters render.
- Verify newly created public contribution appears in list.
- Add a contribution manually from dashboard.
- Edit contribution status (pending/received/cancelled) and verify update.
- Delete contribution and confirm it disappears.
- Use filter input by name/contact/message and verify results.

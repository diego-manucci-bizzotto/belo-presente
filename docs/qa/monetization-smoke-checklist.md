# Monetization Smoke Checklist

## Pre-conditions

- Apply migration: `migrations/20260507_004_affiliate_links_monetization.sql`.
- Start app with valid database credentials.
- Use one list with at least:
  - one product `redirect`
  - one product `qrcode`

## Product Configuration (`/lists/[listId]/products`)

- Edit a redirect product and set:
  - `URL` (store URL)
  - `Link de afiliado` (affiliate/referrer URL)
- Save and confirm product card shows monetization indicator.
- Open product link from dashboard card and confirm it uses affiliate URL.

## Public Gift Flow (`/share/[shareId]`)

- Select a redirect product and proceed to "Abrir loja".
- Confirm opened URL is the affiliate URL.
- Select a QR code product and confirm QR flow still works.
- Use "Desmarcar selecao" and confirm cancellation still works.

## Payments Tab (`/lists/[listId]/payments`)

- Confirm "Monetizacao por presentes" section is visible.
- Validate counters:
  - total intents
  - active intents
  - cancelled intents
  - split by redirect / qrcode
- Validate estimated volume and top products list update after new selections.

## Build/Lint Gate

- Run `npm run lint` -> pass.
- Run `npm run build` -> pass.

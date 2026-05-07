# Feature Flags Smoke Checklist

## Scope
Validate list feature flag behavior across dashboard APIs, public APIs, and shared UI.

## Setup
1. Pick one list with at least one product.
2. Ensure you can access:
   - `/lists/[listId]/features`
   - `/lists/[listId]/products`
   - `/share/[shareId]`

## Matrix

### `share_enabled`
1. Turn `share_enabled` OFF in `/lists/[listId]/features`.
2. Expected:
   - Dashboard header hides "Visitar lista".
   - Nav hides "Compartilhar".
   - Public routes return not found or blocked:
     - `GET /api/share/[shareId]` -> 404
     - `GET /api/share/[shareId]/products` -> 404
     - `POST /api/share/[shareId]/products/[productId]/gift` -> 404
3. Turn it ON again and confirm routes recover.

### `attendance_confirmation_enabled`
1. Turn OFF.
2. Expected:
   - Nav hides "Convidados".
   - `/lists/[listId]/guests` shows disabled message.
   - Guests APIs blocked with `403`:
     - `GET /api/lists/[listId]/guests`
     - `POST /api/lists/[listId]/guests`
     - `PATCH /api/lists/[listId]/guests/[guestId]`
     - `DELETE /api/lists/[listId]/guests/[guestId]`
   - Shared RSVP section hidden.
   - `POST /api/share/[shareId]/rsvp` -> 403.
3. Turn ON and confirm behavior restores.

### `notes_enabled`
1. Turn OFF.
2. Expected:
   - Nav hides "Recados".
   - `/lists/[listId]/notes` shows disabled message.
   - Internal notes APIs blocked with `403`:
     - `GET /api/lists/[listId]/notes`
     - `DELETE /api/lists/[listId]/notes/[noteId]`
   - Shared notes section hidden.
   - Shared notes APIs blocked with `403`:
     - `GET /api/share/[shareId]/notes`
     - `POST /api/share/[shareId]/notes`
3. Turn ON and confirm recados work.

### `contributions_enabled`
1. Turn OFF.
2. Expected:
   - Nav keeps "Pagamentos" available (monetizacao continua visivel).
   - `/lists/[listId]/payments` keeps card de monetizacao por presentes.
   - `/lists/[listId]/payments` shows contribuicoes diretas como desabilitadas.
   - Contributions APIs blocked with `403`:
     - `GET /api/lists/[listId]/contributions`
     - `POST /api/lists/[listId]/contributions`
     - `PATCH /api/lists/[listId]/contributions/[contributionId]`
     - `DELETE /api/lists/[listId]/contributions/[contributionId]`
   - Shared contributions section hidden.
   - `POST /api/share/[shareId]/contributions` -> 403.
3. Turn ON and confirm item appears.

### `selection_notifications_enabled`
1. Turn ON.
2. Execute a public gift selection on any product.
3. Expected:
   - `/lists/[listId]/notifications` shows status ativo and channel card.
   - Event appears in `/lists/[listId]/notifications`.
   - If SMTP is configured, owner receives notification email.
4. Turn OFF and repeat selection.
5. Expected:
   - `/lists/[listId]/notifications` shows disabled message.
   - `GET /api/lists/[listId]/selection-events` -> 403.
   - New selection event is not recorded.
   - No notification email is sent.

## Build/Lint Gate
1. Run `npm run lint` -> pass.
2. Run `npm run build` -> pass.

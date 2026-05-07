# Gallery Smoke Checklist

## Pre-conditions

- Apply migration: `migrations/20260507_002_gallery_foundation.sql`.
- Start app with valid database credentials.
- Use a list owned by your logged-in user.

## Dashboard: Gallery Tab (`/lists/[listId]/gallery`)

- Open tab and confirm no 404.
- Add image with valid URL and optional caption.
- Confirm new item appears at the end of the list.
- Edit image URL/caption and confirm card updates.
- Move item up and down; confirm order changes.
- Delete item; confirm it disappears from list.

## Dashboard: Share Tab (`/lists/[listId]/share`)

- Confirm public link is shown.
- Click copy link and verify clipboard content.
- Confirm QR code is rendered and matches share link.

## Public Share Page (`/share/[shareId]`)

- Confirm gallery card appears when gallery has images.
- Confirm carousel navigation works with multiple images.
- Confirm captions are shown.
- Confirm gallery card is hidden when there are no images.

# FE-10 Accessibility and Performance Audit

## Before Audit Scores

Record baseline Lighthouse and WAVE results here before comparing the fixes.

![Lighthouse before audit](./docs/audit/lighthouse-before.png)

![WAVE before audit](./docs/audit/wave-before.png)

## Specific Fixes Applied

### AI accessibility

- Added `role="log"`, `aria-label="Chat conversation"`, `aria-live="polite"`, and `aria-relevant="additions text"` to the streaming message container.
- Polite announcements allow streamed content to be announced without interrupting the user.
- Kept explicit alert semantics for API failures through `InlineErrorBanner`.

### Keyboard navigation

- Added an explicit `aria-label` to the chat textarea.
- The message input, SmartButton send control, stop button, retry controls, dismiss controls, and chat navigation remain native keyboard controls.
- Added a consistent high-contrast `:focus-visible` ring for buttons, links, textareas, inputs, and selects.

### WAVE and semantic structure

- Added a labeled `<nav>` landmark inside the chat header while preserving the existing page `<main>` landmarks.
- Audited image usage: the interface currently uses no raster `<img>` elements, so there are no missing image `alt` attributes.
- Preserved high-contrast text and action colors already used by the chat error and status states.

### CLS and performance

- Matched the loading skeleton bubble padding and width constraints to the incoming assistant message bubble.
- Kept the existing fixed-height skeleton and reserved message layout so the first streamed token does not resize the footer or scroll region.
- The existing 3D route remains client-lazy-loaded and outside the primary chat render path.

## After Audit Scores

Add post-fix Lighthouse and WAVE screenshots here after running the audit in the target browser and viewport.

![Lighthouse after audit](./docs/audit/lighthouse-after.png)

![WAVE after audit](./docs/audit/wave-after.png)

| Audit | Before | After | Notes |
| --- | --- | --- | --- |
| Lighthouse Accessibility | _Add score_ | _Add score_ | Capture desktop and mobile runs. |
| Lighthouse Performance | _Add score_ | _Add score_ | Compare CLS and total blocking time. |
| WAVE Errors | _Add count_ | _Add count_ | Confirm no new contrast or label errors. |
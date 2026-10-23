# Aarohi Bridal Studio – demo website

A demo introduction website for a bridal boutique in Rajkot. It's built on
[On-Scroll 3D Carousel by Codrops](https://github.com/codrops/3DCarousel) (MIT, see
`LICENSE-codrops-3dcarousel.txt`): each style rolls past as a 3D carousel while you scroll,
and tapping its title opens a full-screen grid of the outfits.

No build step: plain HTML, CSS and JavaScript modules. Serve the folder with any static
server (`python3 -m http.server`); modules don't load from `file://`. Vercel serves it as is.

## Re-using it for a new client

Everything client-specific is in **`js/config.js`**:

| What | Where |
| --- | --- |
| Name, taglines, address, timings, phone | `business` |
| WhatsApp | `business.whatsappNumber` (e.g. `919876543210`), then `liveMode: true` |
| Google rating and links | `business.googleRating`, `googleReviewCount`, `googleReviewsUrl`, `mapsUrl` |
| Colours | `colors` (background, text, muted text, accent) |
| Carousels and their titles | `styles` (one carousel per style, in order) |
| Outfits and photos | `outfits` – each outfit's `photos` list; it appears in the carousel of its first category |
| Form dropdowns | `outfitTypes`, `budgetRanges` |
| Story and reviews (sample) | `story`, `reviews` |
| Gujarati labels | `TEXT.gu` |

Photos go in `photos/`, ideally 2:3 portrait, around 800 × 1200 px, as WebP.
A style only shows up once at least one of its outfits has photos.

# Aarohi Bridal Studio – demo website

A one-page demo website for a bridal boutique in Rajkot. Everything (HTML, CSS, JS and the placeholder artwork) lives in `index.html`; there is no build step.

## Re-using it for a new client

Open `index.html` and find the `CONFIG` object at the top of the `<script>` block (search for `1. CLIENT CONFIG`).

| What to change | Where in `CONFIG` |
| --- | --- |
| Boutique name, monogram, city | `business.name`, `business.nameMain`, `business.nameSub`, `business.monogram`, `business.city` |
| English / Gujarati taglines | `business.tagline`, `business.taglineGu` |
| Address, timings, phone | `business.address`, `business.timings`, `business.sunday`, `business.phoneDisplay` |
| WhatsApp | `business.whatsappNumber` (e.g. `919876543210`), then set `liveMode: true` |
| Google rating and links | `business.googleRating`, `business.googleReviewCount`, `business.googleReviewsUrl`, `business.mapsUrl` |
| Brand colours | `colors` (main wine, gold, background, text) |
| Outfits | `outfits` – code, name, categories, rent/buy prices, description, `image` |
| Real photos | set `image: "photos/br-07.jpg"` on an outfit and add the file to the repo |
| 3 outfits in the hero stack | `heroOutfits` |
| Form dropdowns | `outfitTypes`, `budgetRanges` |
| Owner story | `story` (sample text) |
| Reviews | `reviews` (sample, not real; add `photo` for a bride photo) |
| Your agency name in footer | `business.demoBy` |

Gujarati translations of headings and buttons are in the `TEXT.gu` object just below `CONFIG`.

## Deploy

It's a static site, so Vercel serves `index.html` from the repo root with no extra settings.

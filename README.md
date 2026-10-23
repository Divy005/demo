# Aarohi – floating gallery demo

A demo introduction website for a bridal boutique in Rajkot. The outfits float around the
visitor in 3D on aged parchment; "Change the view" switches between a sphere and a cylinder,
and tapping an outfit flies it to the centre with its name, price and description.
The menu opens the founder's story, reviews, and Visit & Connect (address, map, WhatsApp,
trial booking).

No build step: open `index.html` through any static server (`python3 -m http.server`).
Vercel serves the folder as is.

- `js/config.js` – everything client-specific: business details, outfits and their photos,
  story, reviews, form options, Gujarati labels
- `js/gallery.js` – the 3D gallery (CSS 3D, positions computed each frame), the parchment
  background (drawn on a canvas), transitions (GSAP) and the pages
- `css/style.css` – styles
- `photos/` – outfit photos, ideally 2:3 portrait, about 800 × 1200 px, WebP

Set `whatsappNumber` and `liveMode: true` in `js/config.js` to make the WhatsApp buttons live.

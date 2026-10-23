/* =====================================================================
   CLIENT CONFIG  -  edit this file for each new boutique
   ---------------------------------------------------------------------
   - business : name, taglines, address, timings, phone, links
   - colors   : the four page colours
   - styles   : one rolling 3D carousel per style, in this order.
                A style only appears once at least one outfit in it has photos.
   - outfits  : the collection. photos = list of image paths, the first is the
                main photo. Best as 2:3 portrait photos (e.g. 800 x 1200 px).
                An outfit with no photos yet is kept here but not shown.
   - price    : a number (e.g. 25000) or null to show [price]
   - reviews  : SAMPLE reviews. Replace with real Google reviews before going live.
   - liveMode : set to true once whatsappNumber is filled in; enquiries and
                bookings then open WhatsApp with the message ready.
   ===================================================================== */
window.CONFIG = {
  business: {
    name: 'Aarohi Bridal Studio',
    shortName: 'Aarohi',
    city: 'Rajkot',
    tagline: 'Bridal & festive wear, crafted in Rajkot',
    taglineGu: 'રાજકોટમાં બનેલા બ્રાઇડલ અને ફેસ્ટિવ પોશાક',
    address: '[Shop address], Kalawad Road, Rajkot',
    timings: '10:30 AM – 8:30 PM, Monday to Saturday',
    sunday: 'Sunday by appointment',
    phoneDisplay: '[Phone number]',
    whatsappNumber: '', // digits with country code, e.g. "919876543210"
    googleRating: '[Rating]', // e.g. "4.9"
    googleReviewCount: '[Number]', // e.g. "180"
    googleReviewsUrl: '#',
    mapsUrl: '#',
    demoBy: '[Your business name]',
  },
  liveMode: false,

  colors: {
    bg: '#0f0d0d', // page background
    text: '#f4ede4', // main text
    muted: 'rgba(244, 237, 228, 0.62)', // secondary text
    accent: '#d9a441', // marigold, used sparingly (buttons, highlights)
  },

  styles: [
    { cat: 'Bridal', title: 'Bridal — Lehengas for the pheras', titleGu: 'બ્રાઇડલ — ફેરા માટે લહેંગા' },
    { cat: 'Engagement', title: 'Engagement — Silk & sequin', titleGu: 'સગાઈ — સિલ્ક અને સિક્વિન' },
    { cat: 'Sider', title: 'Sider — Light for long nights', titleGu: 'સાઇડર — હળવા અને સુંદર' },
    { cat: 'Navratri', title: 'Navratri — Bandhani & mirror', titleGu: 'નવરાત્રી — બાંધણી અને આભલા' },
    { cat: 'Rentals', title: 'Rentals — Wear it, return it', titleGu: 'ભાડે — પહેરો અને પરત કરો' },
  ],

  outfits: [
    {
      code: 'EN-11', name: 'Champagne Silk Anarkali', categories: ['Engagement', 'Sider'], offer: 'both', rentPrice: null, buyPrice: null,
      photos: ['photos/anarkali-front.webp', 'photos/anarkali-detail.webp', 'photos/anarkali-back.webp'],
      description: 'Champagne silk anarkali with a zari neckline and sequinned hem, straight pants and a plum dupatta in a sequin jaal.',
    },
    {
      code: 'NV-08', name: 'Red Bandhani Kurta Set', categories: ['Navratri', 'Rentals'], offer: 'both', rentPrice: null, buyPrice: null,
      photos: ['photos/bandhani-front.webp', 'photos/bandhani-back.webp'],
      description: 'Red bandhani kurta with straight pants and a matching bandhani dupatta edged in gota lace.',
    },
    {
      code: 'NV-11', name: 'Kalamkari Tussar Silk Chaniya Choli', categories: ['Navratri'], offer: 'buy', rentPrice: null, buyPrice: null,
      photos: [], // waiting for photos
      description: 'Tussar silk chaniya choli with Kalamkari foil print, a 3-metre flared skirt and a tasselled dupatta.',
    },
    {
      code: 'SD-09', name: 'Rani Pink Patola Silk Saree', categories: ['Sider', 'Bridal'], offer: 'buy', rentPrice: null, buyPrice: null,
      photos: [], // waiting for photos
      description: 'Soft lichi silk saree in rani pink with an all-over patola weave, a woven zari pallu and tassels.',
    },
  ],

  outfitTypes: ['Bridal lehenga', 'Sider outfit', 'Engagement outfit', 'Saree / Gharchola', 'Navratri chaniya choli', 'Indo-western', 'Not sure yet'],
  budgetRanges: ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000', 'Looking to rent', 'Prefer to discuss'],

  // SAMPLE story - replace with the real owner's story
  story:
    'I started stitching in a small room in my mother’s house in Rajkot, making outfits for cousins before their weddings. Today our studio on Kalawad Road sketches, dyes, embroiders and fits every piece by hand, so each bride wears something that feels made for her.',

  // SAMPLE reviews - not real
  reviews: [
    { name: 'Riya P.', detail: 'Bride · Rajkot', text: 'They kept three lehengas ready for my trial and the fitting was perfect on the wedding day.' },
    { name: 'Nidhi S.', detail: 'NRI bride · London', text: 'Shopped completely on video calls. Every outfit was shown in daylight and reached us well before the wedding.' },
    { name: 'Hetal V.', detail: 'Bride’s mother · Jamnagar', text: 'Bought my gharchola and rented outfits for the whole family. Warm, honest and always on time.' },
  ],
};

/* English / Gujarati labels */
window.TEXT = {
  en: {
    navCollection: 'Collection', navStory: 'Story', navReviews: 'Reviews', navVisit: 'Visit', lang: 'ગુજરાતી',
    eyebrow: 'Bridal · Sider · Engagement · Navratri', ctaBook: 'Book a trial', ctaChat: 'Chat on WhatsApp', scrollHint: 'Scroll to see the collection',
    tapTitle: 'Tap a title to see every piece', dragHint: 'Drag to turn',
    close: 'Close ×', enquire: 'Enquire', rentFrom: 'Rent from', buyFrom: 'Buy from', or: 'or',
    storyLabel: 'Our story', sample: 'Sample text', madeIn: 'Designed and stitched in Rajkot', custom: 'Colour, neckline, sleeves, embroidery and fit can all be customised.',
    reviewsLabel: 'Reviews', onGoogle: 'on Google', reviewsWord: 'reviews', sampleReviews: 'Sample reviews for this demo. Real Google reviews will appear here.', ctaGoogle: 'Read all reviews on Google',
    visitLabel: 'Visit & book', visitTitle: 'Book a trial at the studio', address: 'Address', timings: 'Timings', phone: 'Phone / WhatsApp', directions: 'Get directions', mapNote: 'Map placeholder',
    fName: 'Your name', fPhone: 'Phone / WhatsApp', fDate: 'Function date', fType: 'Outfit type', fBudget: 'Budget', fMsg: 'Message (optional)', choose: 'Choose one', submit: 'Request my trial',
    errName: 'Please enter your name.', errPhone: 'Please enter a valid phone number.', errDate: 'Please choose your function date.', errType: 'Please choose an outfit type.',
    readyTitle: 'Your trial request is ready', readyText: 'In the live website, this booking will open WhatsApp with all your details filled in.', copy: 'Copy message', edit: 'Edit details', copied: 'Message copied',
    nriTitle: 'Can’t visit Rajkot? Shop with us on a video call.', nriText: 'See outfits live, compare colours in daylight and get help with measurements, from anywhere in India or abroad.', ctaVideo: 'Book a video call',
    enqTitle: 'Enquire about', enqDate: 'Your function date (optional)', enqSub: 'The message the customer will send', liveNote: 'In the live website, this opens WhatsApp with this message ready to send.',
    chatText: 'WhatsApp chat will be connected in the live version. Customers will tap here and start chatting with the boutique straight away.', notLive: 'Coming in the live version',
  },
  gu: {
    navCollection: 'કલેક્શન', navStory: 'અમારી વાત', navReviews: 'રિવ્યૂ', navVisit: 'મુલાકાત', lang: 'English',
    eyebrow: 'બ્રાઇડલ · સાઇડર · સગાઈ · નવરાત્રી', ctaBook: 'ટ્રાયલ બુક કરો', ctaChat: 'WhatsApp પર વાત કરો', scrollHint: 'કલેક્શન જોવા સ્ક્રોલ કરો',
    tapTitle: 'બધા પોશાક જોવા નામ પર ટેપ કરો', dragHint: 'ફેરવવા ખેંચો',
    close: 'બંધ ×', enquire: 'પૂછો', rentFrom: 'ભાડું', buyFrom: 'ખરીદી', or: 'અથવા',
    storyLabel: 'અમારી વાત', sample: 'નમૂનાનું લખાણ', madeIn: 'રાજકોટમાં ડિઝાઇન અને સિલાઈ', custom: 'રંગ, ગળું, બાંય, ભરતકામ અને ફિટિંગ તમારી પસંદ પ્રમાણે.',
    reviewsLabel: 'રિવ્યૂ', onGoogle: 'Google પર', reviewsWord: 'રિવ્યૂ', sampleReviews: 'આ ડેમો માટેના નમૂનાના રિવ્યૂ છે. અહીં સાચા Google રિવ્યૂ દેખાશે.', ctaGoogle: 'Google પર બધા રિવ્યૂ વાંચો',
    visitLabel: 'મુલાકાત અને બુકિંગ', visitTitle: 'સ્ટુડિયોમાં ટ્રાયલ બુક કરો', address: 'સરનામું', timings: 'સમય', phone: 'ફોન / WhatsApp', directions: 'રસ્તો જુઓ', mapNote: 'નકશાની જગ્યા',
    fName: 'તમારું નામ', fPhone: 'ફોન / WhatsApp', fDate: 'પ્રસંગની તારીખ', fType: 'પોશાકનો પ્રકાર', fBudget: 'બજેટ', fMsg: 'સંદેશ (વૈકલ્પિક)', choose: 'પસંદ કરો', submit: 'ટ્રાયલ માટે વિનંતી કરો',
    errName: 'કૃપા કરીને તમારું નામ લખો.', errPhone: 'કૃપા કરીને સાચો ફોન નંબર લખો.', errDate: 'કૃપા કરીને પ્રસંગની તારીખ પસંદ કરો.', errType: 'કૃપા કરીને પોશાકનો પ્રકાર પસંદ કરો.',
    readyTitle: 'તમારી ટ્રાયલ વિનંતી તૈયાર છે', readyText: 'લાઇવ વેબસાઇટમાં આ બુકિંગ તમારી બધી વિગતો સાથે WhatsApp ખોલશે.', copy: 'સંદેશ કૉપી કરો', edit: 'વિગતો બદલો', copied: 'સંદેશ કૉપી થયો',
    nriTitle: 'રાજકોટ આવી શકતા નથી? વિડિયો કૉલ પર ખરીદી કરો.', nriText: 'ભારત કે વિદેશમાં ક્યાંયથી પણ પોશાક લાઇવ જુઓ, દિવસના પ્રકાશમાં રંગ સરખાવો અને માપ માટે મદદ મેળવો.', ctaVideo: 'વિડિયો કૉલ બુક કરો',
    enqTitle: 'પૂછપરછ', enqDate: 'તમારા પ્રસંગની તારીખ (વૈકલ્પિક)', enqSub: 'ગ્રાહક આ સંદેશ મોકલશે', liveNote: 'લાઇવ વેબસાઇટમાં આ સંદેશ સાથે WhatsApp ખુલશે.',
    chatText: 'લાઇવ વેબસાઇટમાં અહીં WhatsApp ચેટ જોડાશે. ગ્રાહક ટેપ કરીને તરત બુટિક સાથે વાત કરી શકશે.', notLive: 'લાઇવ વર્ઝનમાં આવશે',
  },
};

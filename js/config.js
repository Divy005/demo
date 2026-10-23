/* =====================================================================
   CLIENT CONFIG  -  edit this file for each new boutique
   ---------------------------------------------------------------------
   - business : name, taglines, address, timings, phone, links
   - outfits  : the floating gallery. photos = list of image paths, the first is
                the main one. Best as 2:3 portrait photos (about 800 x 1200 px).
                An outfit with no photos yet is kept here but not shown.
   - price    : a number (e.g. 25000) or null to show [price]
   - story / reviews : SAMPLE text. Replace before going live.
   - liveMode : set to true once whatsappNumber is filled in; enquiries and
                bookings then open WhatsApp with the message ready.
   ===================================================================== */
window.CONFIG = {
  business: {
    name: 'Aarohi',
    subtitle: 'Bridal & festive wear · Rajkot',
    subtitleGu: 'રાજકોટમાં બનેલા બ્રાઇડલ અને ફેસ્ટિવ પોશાક',
    fullName: 'Aarohi Bridal Studio',
    address: '[Shop address], Kalawad Road, Rajkot',
    timings: '10:30 AM – 8:30 PM, Monday to Saturday',
    sunday: 'Sunday by appointment',
    phoneDisplay: '[Phone number]',
    whatsappNumber: '', // digits with country code, e.g. "919876543210"
    googleRating: '[Rating]', // e.g. "4.9"
    googleReviewCount: '[Number]', // e.g. "180"
    googleReviewsUrl: '#',
    mapsUrl: '#',
    founder: '[Founder name]',
    since: '[Year]',
    demoBy: '[Your business name]',
  },
  liveMode: false,

  // offer: "rent" | "buy" | "both"
  outfits: [
    {
      code: 'KS-11', name: 'Champagne Silk Anarkali', category: 'Kurta sets', offer: 'both', rentPrice: null, buyPrice: null,
      photos: ['photos/anarkali-front.webp', 'photos/anarkali-detail.webp', 'photos/anarkali-back.webp'],
      description: 'A champagne silk anarkali that falls in soft panels to the ankle. The neckline and hem are worked in zari and sequins, and the plum dupatta carries a sequinned jaal that catches light when you move.',
      fabric: 'Silk, silk dupatta', work: 'Zari, sequin jaal',
    },
    {
      code: 'BD-08', name: 'Red Bandhani Kurta Set', category: 'Bandhani', offer: 'both', rentPrice: null, buyPrice: null,
      photos: ['photos/bandhani-front.webp', 'photos/bandhani-back.webp'],
      description: 'Hand-tied bandhani in deep red, made into a kurta with straight pants. The matching dupatta is edged in gota lace, so it frames the face the way bandhani is meant to be worn.',
      fabric: 'Cotton silk', work: 'Bandhani, gota lace',
    },
    {
      code: 'NV-11', name: 'Kalamkari Tussar Chaniya Choli', category: 'Navratri', offer: 'buy', rentPrice: null, buyPrice: null,
      photos: [], // waiting for photos
      description: 'Tussar silk chaniya choli with a Kalamkari foil print and a 3-metre flared skirt, finished with a broad zari border and a tasselled dupatta.',
      fabric: 'Dola tussar silk', work: 'Foil print, zari border, tassels',
    },
    {
      code: 'SR-09', name: 'Rani Pink Patola Silk Saree', category: 'Sarees', offer: 'buy', rentPrice: null, buyPrice: null,
      photos: [], // waiting for photos
      description: 'Soft lichi silk in rani pink with an all-over patola weave, a woven zari pallu and orange tassels.',
      fabric: 'Lichi silk', work: 'Patola weave, zari pallu',
    },
  ],

  outfitTypes: ['Bridal lehenga', 'Saree / Gharchola', 'Kurta set', 'Bandhani', 'Navratri chaniya choli', 'Not sure yet'],
  budgetRanges: ['Under ₹25,000', '₹25,000 – ₹50,000', '₹50,000 – ₹1,00,000', 'Above ₹1,00,000', 'Looking to rent', 'Prefer to discuss'],

  // SAMPLE story - replace with the real founder's story
  story: [
    'I started stitching in a small room in my mother’s house in Rajkot, making outfits for cousins before their weddings. Every bride had a picture in her mind, and my joy was turning that picture into something she could wear.',
    'Today the studio on Kalawad Road works with a small team of karigars who sketch, dye, embroider and fit every piece by hand. Whether you buy, rent or design from scratch, we take the time to understand your function, your family and your budget.',
  ],

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
    navCollection: 'Collection', navStory: 'Story', navReviews: 'Reviews', navVisit: 'Visit & Connect', lang: 'ગુજરાતી', whatsapp: 'Chat on WhatsApp',
    changeView: 'Change the view', sphere: 'sphere', cylinder: 'cylinder', hint: 'Drag to turn · tap an outfit',
    close: 'Close', rentFrom: 'Rent from', buyFrom: 'Buy from', or: 'or', fabric: 'Fabric', work: 'Work', price: 'Price',
    enquire: 'Enquire on WhatsApp', book: 'Book a trial', prev: 'Previous photo', next: 'Next photo',
    storyTitle: 'From a small room in Rajkot', storyLabel: 'The founder’s story', sample: 'Sample text', madeIn: 'Designed and stitched in Rajkot', custom: 'Colour, neckline, sleeves, embroidery and fit can all be made to your choice.',
    reviewsTitle: 'What our brides say', onGoogle: 'on Google', reviewsWord: 'reviews', sampleReviews: 'Sample reviews for this demo. Real Google reviews will appear here.', ctaGoogle: 'Read all reviews on Google',
    visitTitle: 'Visit the studio', address: 'Address', timings: 'Timings', phone: 'Phone / WhatsApp', directions: 'Get directions', mapNote: 'Map placeholder',
    bookTitle: 'Book a trial', fName: 'Your name', fPhone: 'Phone / WhatsApp', fDate: 'Function date', fType: 'Outfit type', fBudget: 'Budget', fMsg: 'Message (optional)', choose: 'Choose one', submit: 'Request my trial',
    errName: 'Please enter your name.', errPhone: 'Please enter a valid phone number.', errDate: 'Please choose your function date.', errType: 'Please choose an outfit type.',
    readyTitle: 'Your trial request is ready', readyText: 'In the live website, this booking will open WhatsApp with all your details filled in.', copy: 'Copy message', edit: 'Edit details', copied: 'Message copied',
    nriTitle: 'Can’t visit Rajkot? Shop with us on a video call.', nriText: 'See outfits live, compare colours in daylight and get help with measurements, from anywhere in India or abroad.', ctaVideo: 'Book a video call',
    enqSub: 'The message the customer will send', enqDate: 'Function date (optional)', liveNote: 'In the live website, this opens WhatsApp with the message ready to send.',
    chatText: 'WhatsApp will be connected in the live version. Customers tap here and start chatting with the boutique straight away.', notLive: 'Coming in the live version',
  },
  gu: {
    navCollection: 'કલેક્શન', navStory: 'અમારી વાત', navReviews: 'રિવ્યૂ', navVisit: 'મુલાકાત અને સંપર્ક', lang: 'English', whatsapp: 'WhatsApp પર વાત કરો',
    changeView: 'દેખાવ બદલો', sphere: 'ગોળ', cylinder: 'વર્તુળ', hint: 'ફેરવવા ખેંચો · પોશાક પર ટેપ કરો',
    close: 'બંધ કરો', rentFrom: 'ભાડું', buyFrom: 'ખરીદી', or: 'અથવા', fabric: 'કાપડ', work: 'કામ', price: 'કિંમત',
    enquire: 'WhatsApp પર પૂછો', book: 'ટ્રાયલ બુક કરો', prev: 'પાછલો ફોટો', next: 'આગળનો ફોટો',
    storyTitle: 'રાજકોટના નાના રૂમથી', storyLabel: 'સ્થાપકની વાત', sample: 'નમૂનાનું લખાણ', madeIn: 'રાજકોટમાં ડિઝાઇન અને સિલાઈ', custom: 'રંગ, ગળું, બાંય, ભરતકામ અને ફિટિંગ તમારી પસંદ પ્રમાણે.',
    reviewsTitle: 'અમારી દુલ્હનો શું કહે છે', onGoogle: 'Google પર', reviewsWord: 'રિવ્યૂ', sampleReviews: 'આ ડેમો માટેના નમૂનાના રિવ્યૂ છે. અહીં સાચા Google રિવ્યૂ દેખાશે.', ctaGoogle: 'Google પર બધા રિવ્યૂ વાંચો',
    visitTitle: 'સ્ટુડિયોની મુલાકાત લો', address: 'સરનામું', timings: 'સમય', phone: 'ફોન / WhatsApp', directions: 'રસ્તો જુઓ', mapNote: 'નકશાની જગ્યા',
    bookTitle: 'ટ્રાયલ બુક કરો', fName: 'તમારું નામ', fPhone: 'ફોન / WhatsApp', fDate: 'પ્રસંગની તારીખ', fType: 'પોશાકનો પ્રકાર', fBudget: 'બજેટ', fMsg: 'સંદેશ (વૈકલ્પિક)', choose: 'પસંદ કરો', submit: 'ટ્રાયલ માટે વિનંતી કરો',
    errName: 'કૃપા કરીને તમારું નામ લખો.', errPhone: 'કૃપા કરીને સાચો ફોન નંબર લખો.', errDate: 'કૃપા કરીને પ્રસંગની તારીખ પસંદ કરો.', errType: 'કૃપા કરીને પોશાકનો પ્રકાર પસંદ કરો.',
    readyTitle: 'તમારી ટ્રાયલ વિનંતી તૈયાર છે', readyText: 'લાઇવ વેબસાઇટમાં આ બુકિંગ તમારી બધી વિગતો સાથે WhatsApp ખોલશે.', copy: 'સંદેશ કૉપી કરો', edit: 'વિગતો બદલો', copied: 'સંદેશ કૉપી થયો',
    nriTitle: 'રાજકોટ આવી શકતા નથી? વિડિયો કૉલ પર ખરીદી કરો.', nriText: 'ભારત કે વિદેશમાં ક્યાંયથી પણ પોશાક લાઇવ જુઓ, દિવસના પ્રકાશમાં રંગ સરખાવો અને માપ માટે મદદ મેળવો.', ctaVideo: 'વિડિયો કૉલ બુક કરો',
    enqSub: 'ગ્રાહક આ સંદેશ મોકલશે', enqDate: 'પ્રસંગની તારીખ (વૈકલ્પિક)', liveNote: 'લાઇવ વેબસાઇટમાં આ સંદેશ સાથે WhatsApp ખુલશે.',
    chatText: 'લાઇવ વેબસાઇટમાં અહીં WhatsApp જોડાશે. ગ્રાહક ટેપ કરીને તરત બુટિક સાથે વાત કરી શકશે.', notLive: 'લાઇવ વર્ઝનમાં આવશે',
  },
};

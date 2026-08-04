// ═══════════════════════════════════════════════════════════════════
// MGTM EXPRESS — DATABASE SEED FILE
// Personal Delivery Partner sa Mangatarem, Pangasinan
// ═══════════════════════════════════════════════════════════════════
// I-run ito ISANG BESES LANG pagkatapos mag-setup ng database:
//   npm run seed
//
// Para i-reset at i-re-seed:
//   npx prisma migrate reset
//   npm run seed
// ═══════════════════════════════════════════════════════════════════

'use strict';

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════
// BUSINESS SETTINGS DATA
// ═══════════════════════════════════════════════════════════════════
// Ito ang lahat ng default settings ng MGTM Express.
// Pwedeng baguhin ng admin sa pamamagitan ng Admin Panel
// nang hindi kailangang baguhin ang code.
// ═══════════════════════════════════════════════════════════════════
const businessSettings = [

  // ── BRANDING ──────────────────────────────────────────────────
  {
    key:         'business_name',
    value:       'MGTM Express',
    type:        'STRING',
    category:    'BRANDING',
    label:       'Business Name',
    description: 'Pangalan ng negosyo na lalabas sa lahat ng pages',
    isPublic:    true,
  },
  {
    key:         'business_tagline',
    value:       'Personal Delivery Partner sa Mangatarem, Pangasinan',
    type:        'STRING',
    category:    'BRANDING',
    label:       'Tagline',
    description: 'Maikling pangungusap na sumasaklaw sa brand identity',
    isPublic:    true,
  },
  {
    key:         'business_logo_url',
    value:       '/uploads/logo/mgtm-logo.png',
    type:        'URL',
    category:    'BRANDING',
    label:       'Logo URL',
    description: 'URL ng opisyal na logo ng negosyo',
    isPublic:    true,
  },
  {
    key:         'business_logo_dark_url',
    value:       '/uploads/logo/mgtm-logo-white.png',
    type:        'URL',
    category:    'BRANDING',
    label:       'Logo URL (Dark Mode)',
    description: 'White/light version ng logo para sa dark backgrounds',
    isPublic:    true,
  },
  {
    key:         'primary_color',
    value:       '#22C55E',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Primary Accent Color',
    description: 'Pangunahing kulay ng brand (green). Ginagamit sa buttons, highlights, at accents.',
    isPublic:    true,
  },
  {
    key:         'primary_color_dark',
    value:       '#16A34A',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Primary Color (Dark Variant)',
    description: 'Mas madilim na variant ng primary color para sa hover states',
    isPublic:    true,
  },
  {
    key:         'primary_color_light',
    value:       '#4ADE80',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Primary Color (Light Variant)',
    description: 'Mas maliwanag na variant para sa highlights',
    isPublic:    true,
  },
  {
    key:         'secondary_color',
    value:       '#0F172A',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Secondary Color (Background)',
    description: 'Pangalawang kulay — dark/black na background ng app',
    isPublic:    true,
  },
  {
    key:         'surface_color',
    value:       '#1E293B',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Surface Color',
    description: 'Kulay ng mga cards at containers sa dark background',
    isPublic:    true,
  },
  {
    key:         'text_primary_color',
    value:       '#F8FAFC',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Primary Text Color',
    description: 'Kulay ng pangunahing text (laban sa dark background)',
    isPublic:    true,
  },
  {
    key:         'text_secondary_color',
    value:       '#94A3B8',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Secondary Text Color',
    description: 'Kulay ng subtitle at secondary text',
    isPublic:    true,
  },
  {
    key:         'border_color',
    value:       '#334155',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Border Color',
    description: 'Kulay ng mga borders at dividers',
    isPublic:    true,
  },
  {
    key:         'success_color',
    value:       '#22C55E',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Success Color',
    description: 'Kulay para sa success states (green)',
    isPublic:    true,
  },
  {
    key:         'error_color',
    value:       '#EF4444',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Error Color',
    description: 'Kulay para sa errors at warnings (red)',
    isPublic:    true,
  },
  {
    key:         'warning_color',
    value:       '#F59E0B',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'Warning Color',
    description: 'Kulay para sa warnings (amber)',
    isPublic:    true,
  },

  // ── CONTACT INFO ───────────────────────────────────────────────
  {
    key:         'contact_phone',
    value:       '+639319711028',
    type:        'STRING',
    category:    'CONTACT',
    label:       'Contact Phone Number',
    description: 'Pangunahing contact number ng MGTM Express',
    isPublic:    true,
  },
  {
    key:         'contact_phone_display',
    value:       '0931-971-1028',
    type:        'STRING',
    category:    'CONTACT',
    label:       'Contact Phone (Display Format)',
    description: 'Formatted na phone number para sa display',
    isPublic:    true,
  },
  {
    key:         'contact_email',
    value:       'mgtmexpress@gmail.com',
    type:        'STRING',
    category:    'CONTACT',
    label:       'Contact Email',
    description: 'Email address para sa customer support',
    isPublic:    true,
  },
  {
    key:         'contact_messenger',
    value:       'https://m.me/mgtmexpress',
    type:        'URL',
    category:    'CONTACT',
    label:       'Facebook Messenger Link',
    description: 'Link sa Facebook Messenger para sa customer chat',
    isPublic:    true,
  },
  {
    key:         'facebook_page',
    value:       'https://www.facebook.com/mgtmexpress',
    type:        'URL',
    category:    'CONTACT',
    label:       'Facebook Page URL',
    description: 'Link sa opisyal na Facebook Page',
    isPublic:    true,
  },
  {
    key:         'hub_address',
    value:       'Mangatarem, Pangasinan',
    type:        'STRING',
    category:    'CONTACT',
    label:       'Hub/Office Address',
    description: 'Pisikal na address ng opisina o hub ng MGTM Express',
    isPublic:    true,
  },
  {
    key:         'hub_latitude',
    value:       '15.7933',
    type:        'NUMBER',
    category:    'CONTACT',
    label:       'Hub Latitude',
    description: 'GPS latitude ng hub — ginagamit para sa delivery fee calculation',
    isPublic:    false,
  },
  {
    key:         'hub_longitude',
    value:       '120.2072',
    type:        'NUMBER',
    category:    'CONTACT',
    label:       'Hub Longitude',
    description: 'GPS longitude ng hub — ginagamit para sa delivery fee calculation',
    isPublic:    false,
  },

  // ── PRICING ENGINE ─────────────────────────────────────────────
  {
    key:         'rate_per_km',
    value:       '18',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Rate per Kilometer (₱)',
    description: 'Halaga ng delivery fee kada kilometro. Formula: (km × rate) + base_fee',
    isPublic:    true,
  },
  {
    key:         'base_fee',
    value:       '20',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Base Fee (₱)',
    description: 'Fixed na base fee na idinagdag sa bawat delivery',
    isPublic:    true,
  },
  {
    key:         'minimum_fee',
    value:       '55',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Minimum Delivery Fee (₱)',
    description: 'Pinakamababang delivery fee (para sa unang 1 km). Hindi dapat bumaba dito ang fee.',
    isPublic:    true,
  },
  {
    key:         'additional_store_fee',
    value:       '15',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Additional Store Fee (₱)',
    description: 'Flat rate na idinagdag para sa bawat extra store/pickup location sa isang booking',
    isPublic:    true,
  },
  {
    key:         'free_delivery_threshold',
    value:       '0',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Free Delivery Threshold (₱)',
    description: 'Minimum na halaga ng order para sa libre na delivery. Set to 0 kung walang free delivery.',
    isPublic:    true,
  },

  // ── OPERATING HOURS ────────────────────────────────────────────
  {
    key:         'operating_hours_open',
    value:       '08:00',
    type:        'TIME',
    category:    'OPERATIONS',
    label:       'Opening Time',
    description: 'Oras ng pagbubukas ng serbisyo (24-hour format)',
    isPublic:    true,
  },
  {
    key:         'operating_hours_close',
    value:       '21:00',
    type:        'TIME',
    category:    'OPERATIONS',
    label:       'Closing Time',
    description: 'Oras ng pagsasara ng serbisyo (24-hour format)',
    isPublic:    true,
  },
  {
    key:         'operating_days',
    value:       'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
    type:        'STRING',
    category:    'OPERATIONS',
    label:       'Operating Days',
    description: 'Mga araw na bukas ang serbisyo (comma-separated)',
    isPublic:    true,
  },
  {
    key:         'is_accepting_orders',
    value:       'true',
    type:        'BOOLEAN',
    category:    'OPERATIONS',
    label:       'Accepting Orders',
    description: 'I-toggle kung bukas o sarado ang MGTM Express. Kapag false, hindi maka-order ang customers.',
    isPublic:    true,
  },
  {
    key:         'closed_message',
    value:       'Sarado pa kami ngayon. Bukas kami mula 8:00 AM hanggang 9:00 PM araw-araw.',
    type:        'STRING',
    category:    'OPERATIONS',
    label:       'Closed Message',
    description: 'Message na lalabas kapag sarado ang serbisyo',
    isPublic:    true,
  },
  {
    key:         'max_delivery_distance_km',
    value:       '25',
    type:        'NUMBER',
    category:    'OPERATIONS',
    label:       'Maximum Delivery Distance (km)',
    description: 'Pinakamalalayong distansya na tinatanggap ng delivery orders',
    isPublic:    true,
  },

  // ── SERVICE AREAS ─────────────────────────────────────────────
  {
    key:         'service_areas',
    value:       JSON.stringify([
      { name: 'Mangatarem',   province: 'Pangasinan', isActive: true, sortOrder: 1  },
      { name: 'Aguilar',      province: 'Pangasinan', isActive: true, sortOrder: 2  },
      { name: 'Urbiztondo',   province: 'Pangasinan', isActive: true, sortOrder: 3  },
      { name: 'San Clemente', province: 'Pangasinan', isActive: true, sortOrder: 4  },
      { name: 'Bayambang',    province: 'Pangasinan', isActive: true, sortOrder: 5  },
      { name: 'Villasis',     province: 'Pangasinan', isActive: true, sortOrder: 6  },
      { name: 'Santa Barbara',province: 'Pangasinan', isActive: true, sortOrder: 7  },
      { name: 'Malasiqui',    province: 'Pangasinan', isActive: true, sortOrder: 8  },
    ]),
    type:        'JSON',
    category:    'OPERATIONS',
    label:       'Service Areas',
    description: 'Listahan ng mga lugar na covered ng MGTM Express delivery',
    isPublic:    true,
  },

  // ── CORE SERVICES ─────────────────────────────────────────────
  {
    key:         'core_services',
    value:       JSON.stringify([
      {
        id:          'food_delivery',
        name:        'Food Delivery',
        icon:        '🍔',
        description: 'Mag-order ng pagkain mula sa mga restaurant at carinderias',
        isActive:    true,
        sortOrder:   1,
      },
      {
        id:          'grocery',
        name:        'Grocery',
        icon:        '🛒',
        description: 'Pabili ng groceries mula sa palengke o supermarket',
        isActive:    true,
        sortOrder:   2,
      },
      {
        id:          'medicine',
        name:        'Medicine',
        icon:        '💊',
        description: 'Pabili ng gamot mula sa botika',
        isActive:    true,
        sortOrder:   3,
      },
      {
        id:          'pasabay_pabili',
        name:        'Pasabay / Pabili',
        icon:        '📦',
        description: 'Pabili ng kahit anong bagay o magpadala ng package',
        isActive:    true,
        sortOrder:   4,
      },
      {
        id:          'errand',
        name:        'Any Errands',
        icon:        '✅',
        description: 'Bill payment, pag-file ng dokumento, at iba pang errands',
        isActive:    true,
        sortOrder:   5,
      },
    ]),
    type:        'JSON',
    category:    'OPERATIONS',
    label:       'Core Services',
    description: 'Mga serbisyong inaalok ng MGTM Express',
    isPublic:    true,
  },

  // ── FEATURES FLAGS ─────────────────────────────────────────────
  {
    key:         'feature_merchant_portal',
    value:       'true',
    type:        'BOOLEAN',
    category:    'FEATURES',
    label:       'Merchant Portal Enabled',
    description: 'Kung pinapayagan ang mga merchant na mag-register at gumamit ng merchant dashboard',
    isPublic:    false,
  },
  {
    key:         'feature_subscriptions',
    value:       'true',
    type:        'BOOLEAN',
    category:    'FEATURES',
    label:       'Subscriptions Enabled',
    description: 'Kung aktibo ang subscription billing para sa mga merchant',
    isPublic:    false,
  },
  {
    key:         'feature_rider_app',
    value:       'false',
    type:        'BOOLEAN',
    category:    'FEATURES',
    label:       'Rider App Enabled',
    description: 'Kung available ang rider management features',
    isPublic:    false,
  },
  {
    key:         'feature_reviews',
    value:       'true',
    type:        'BOOLEAN',
    category:    'FEATURES',
    label:       'Reviews & Ratings Enabled',
    description: 'Kung pwedeng mag-review ang customers pagkatapos ng delivery',
    isPublic:    true,
  },
  {
    key:         'feature_real_time_tracking',
    value:       'true',
    type:        'BOOLEAN',
    category:    'FEATURES',
    label:       'Real-time Order Tracking',
    description: 'Live order tracking via Socket.io',
    isPublic:    true,
  },

  // ── SUBSCRIPTION PRICING ───────────────────────────────────────
  {
    key:         'subscription_monthly_price',
    value:       '1499',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Monthly Subscription Price (₱)',
    description: 'Presyo ng monthly subscription para sa mga merchant',
    isPublic:    true,
  },
  {
    key:         'subscription_yearly_price',
    value:       '15289.80',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Yearly Subscription Price (₱)',
    description: 'Presyo ng yearly subscription (may 15-20% discount)',
    isPublic:    true,
  },
  {
    key:         'subscription_yearly_discount_percent',
    value:       '15',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Yearly Subscription Discount (%)',
    description: 'Porsyento ng discount para sa yearly subscription',
    isPublic:    true,
  },
  {
    key:         'subscription_trial_days',
    value:       '14',
    type:        'NUMBER',
    category:    'PRICING',
    label:       'Free Trial Days',
    description: 'Gaano karaming araw ang libre na trial para sa bagong merchant',
    isPublic:    true,
  },

  // ── NOTIFICATIONS ──────────────────────────────────────────────
  {
    key:         'notification_order_placed_template',
    value:       'Kumusta {{customer_name}}! Natanggap na namin ang iyong order #{{order_number}}. Ipapaalam namin sa iyo ang status ng iyong delivery. — MGTM Express 🛵',
    type:        'STRING',
    category:    'NOTIFICATIONS',
    label:       'Order Placed SMS Template',
    description: 'Template ng SMS na ipapadala sa customer kapag na-place ang order',
    isPublic:    false,
  },
  {
    key:         'notification_order_delivered_template',
    value:       'Naihatid na ang iyong order #{{order_number}}! Salamat sa pagtangkilik sa MGTM Express. 🎉 Para sa feedback: {{contact_phone}}',
    type:        'STRING',
    category:    'NOTIFICATIONS',
    label:       'Order Delivered SMS Template',
    description: 'Template ng SMS pagkatapos maka-deliver',
    isPublic:    false,
  },

  // ── PWA SETTINGS ───────────────────────────────────────────────
  {
    key:         'pwa_name',
    value:       'MGTM Express',
    type:        'STRING',
    category:    'BRANDING',
    label:       'PWA App Name',
    description: 'Pangalan ng app kapag na-install sa home screen',
    isPublic:    true,
  },
  {
    key:         'pwa_short_name',
    value:       'MGTM',
    type:        'STRING',
    category:    'BRANDING',
    label:       'PWA Short Name',
    description: 'Maikling pangalan para sa home screen icon (max 12 characters)',
    isPublic:    true,
  },
  {
    key:         'pwa_description',
    value:       'Personal Delivery Partner sa Mangatarem, Pangasinan. Food, Grocery, Medicine, at iba pa.',
    type:        'STRING',
    category:    'BRANDING',
    label:       'PWA Description',
    description: 'Paglalarawan ng app para sa app stores at install prompts',
    isPublic:    true,
  },
  {
    key:         'pwa_theme_color',
    value:       '#0F172A',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'PWA Theme Color',
    description: 'Kulay ng browser bar kapag naka-install ang PWA (dapat match ang primary background)',
    isPublic:    true,
  },
  {
    key:         'pwa_background_color',
    value:       '#0F172A',
    type:        'COLOR',
    category:    'BRANDING',
    label:       'PWA Splash Screen Background Color',
    description: 'Background color ng splash screen kapag nagbubukas ang app',
    isPublic:    true,
  },
];

// ═══════════════════════════════════════════════════════════════════
// SERVICE AREAS DATA
// ═══════════════════════════════════════════════════════════════════
const serviceAreas = [
  { name: 'Mangatarem',     province: 'Pangasinan', isActive: true,  estimatedMinutes: 0,  sortOrder: 1, notes: 'Main hub location' },
  { name: 'Aguilar',        province: 'Pangasinan', isActive: true,  estimatedMinutes: 15, sortOrder: 2, notes: null },
  { name: 'Urbiztondo',     province: 'Pangasinan', isActive: true,  estimatedMinutes: 20, sortOrder: 3, notes: null },
  { name: 'San Clemente',   province: 'Pangasinan', isActive: true,  estimatedMinutes: 25, sortOrder: 4, notes: null },
  { name: 'Bayambang',      province: 'Pangasinan', isActive: true,  estimatedMinutes: 30, sortOrder: 5, notes: null },
  { name: 'Villasis',       province: 'Pangasinan', isActive: true,  estimatedMinutes: 35, sortOrder: 6, notes: null },
  { name: 'Santa Barbara',  province: 'Pangasinan', isActive: true,  estimatedMinutes: 30, sortOrder: 7, notes: null },
  { name: 'Malasiqui',      province: 'Pangasinan', isActive: true,  estimatedMinutes: 40, sortOrder: 8, notes: null },
  { name: 'Lingayen',       province: 'Pangasinan', isActive: false, estimatedMinutes: 45, sortOrder: 9, notes: 'Coming soon' },
  { name: 'San Carlos',     province: 'Pangasinan', isActive: false, estimatedMinutes: 60, sortOrder: 10, notes: 'Coming soon' },
];

// ═══════════════════════════════════════════════════════════════════
// SAMPLE MENU ITEMS
// ═══════════════════════════════════════════════════════════════════
// Generic menu items para sa general delivery requests
// (Hindi para sa specific merchant — para sa walk-in o phone orders)
const menuItems = [

  // ── FOOD DELIVERY ITEMS ────────────────────────────────────────
  {
    name:        'Lechon Kawali',
    description: 'Crispy deep-fried pork belly. Malutong sa labas, malambot sa loob. May liver sauce.',
    price:       189,
    category:    'Pork',
    imageUrl:    'https://images.unsplash.com/photo-1619221882220-947b3d3c8861?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  true,
    sortOrder:   1,
  },
  {
    name:        'Pork Sinigang',
    description: 'Masabaw na sopas na may tamarind broth, pork ribs, at sariwang gulay.',
    price:       165,
    category:    'Pork',
    imageUrl:    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   2,
  },
  {
    name:        'Pork Adobo',
    description: 'Klasikong Filipino adobo. Baboy na nilaga sa toyo, suka, at bawang.',
    price:       149,
    category:    'Pork',
    imageUrl:    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   3,
  },
  {
    name:        'Crispy Pata',
    description: 'Deep-fried pork knuckle. Golden at extra crispy. Para sa espesyal na okasyon.',
    price:       299,
    category:    'Pork',
    imageUrl:    'https://images.unsplash.com/photo-1548869206-93b036288d7f?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  true,
    sortOrder:   4,
  },
  {
    name:        'Chicken Inasal',
    description: 'Bacolod-style grilled chicken. Marinated sa lemongrass at annatto oil.',
    price:       159,
    category:    'Chicken',
    imageUrl:    'https://images.unsplash.com/photo-1598103442097-8b74394b95c0?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  true,
    sortOrder:   5,
  },
  {
    name:        'Chicken Adobo',
    description: 'Tender na manok na nilaga sa toyo at suka. Paboritong ulam ng mga Pilipino.',
    price:       145,
    category:    'Chicken',
    imageUrl:    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   6,
  },
  {
    name:        'Fried Chicken (2 pcs)',
    description: 'Crispy golden fried chicken. Dalawang piraso ng masarap na prito.',
    price:       135,
    category:    'Chicken',
    imageUrl:    'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   7,
  },
  {
    name:        'Beef Caldereta',
    description: 'Mayamang tomato-based beef stew na may patatas at bell peppers.',
    price:       195,
    category:    'Beef',
    imageUrl:    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   8,
  },
  {
    name:        'Beef Sinigang',
    description: 'Masabaw at maasim na sopas na may tender na beef at gulay.',
    price:       185,
    category:    'Beef',
    imageUrl:    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   9,
  },
  {
    name:        'Inihaw na Bangus',
    description: 'Sariwang bangus na pinuno ng tomato at sibuyas, inihaw sa uling.',
    price:       165,
    category:    'Seafood',
    imageUrl:    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   10,
  },
  {
    name:        'Sinigang na Hipon',
    description: 'Masabaw na sopas na may malalaking hipon at gulay sa tamarind broth.',
    price:       195,
    category:    'Seafood',
    imageUrl:    'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  true,
    sortOrder:   11,
  },
  {
    name:        'Pinakbet',
    description: 'Mixed vegetables niluto sa bagoong at may pork bits para sa lasa.',
    price:       130,
    category:    'Vegetables',
    imageUrl:    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   12,
  },
  {
    name:        'Chopsuey',
    description: 'Colorful na stir-fried mixed vegetables sa oyster sauce.',
    price:       125,
    category:    'Vegetables',
    imageUrl:    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   13,
  },
  {
    name:        'Ginisang Monggo',
    description: 'Malapot na monggo na may malunggay, hipon, at crispy pork bits.',
    price:       115,
    category:    'Vegetables',
    imageUrl:    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop',
    isAvailable: true,
    isFeatured:  false,
    sortOrder:   14,
  },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log('🛵 ════════════════════════════════════════════════');
  console.log('🛵  MGTM EXPRESS — DATABASE SEED');
  console.log('🛵  Personal Delivery Partner sa Mangatarem');
  console.log('🛵 ════════════════════════════════════════════════');
  console.log('');

  // ── STEP 1: Business Settings ──────────────────────────────────
  console.log('⚙️  Seeding business settings...');
  let settingsCreated = 0;
  let settingsUpdated = 0;

  for (const setting of businessSettings) {
    const existing = await prisma.businessSettings.findUnique({
      where: { key: setting.key },
    });

    if (existing) {
      // I-update ang label at description pero hindi ang value
      // (para hindi ma-overwrite ang mga changes ng admin)
      await prisma.businessSettings.update({
        where: { key: setting.key },
        data: {
          label:       setting.label,
          description: setting.description,
          type:        setting.type,
          category:    setting.category,
          isPublic:    setting.isPublic,
        },
      });
      settingsUpdated++;
    } else {
      // Gawa ng bagong setting kasama ang default value
      await prisma.businessSettings.create({ data: setting });
      settingsCreated++;
    }
  }

  console.log(`   ✅ Settings: ${settingsCreated} created, ${settingsUpdated} updated`);

  // ── STEP 2: Service Areas ──────────────────────────────────────
  console.log('');
  console.log('📍 Seeding service areas...');

  // I-clear ang existing service areas at i-replace
  await prisma.serviceArea.deleteMany();
  await prisma.serviceArea.createMany({ data: serviceAreas });

  const activeAreas = serviceAreas.filter(a => a.isActive);
  console.log(`   ✅ ${serviceAreas.length} service areas created`);
  console.log(`      Active: ${activeAreas.map(a => a.name).join(', ')}`);
  console.log(`      Coming soon: ${serviceAreas.filter(a => !a.isActive).map(a => a.name).join(', ')}`);

  // ── STEP 3: Menu Items ─────────────────────────────────────────
  console.log('');
  console.log('🍽️  Seeding menu items...');

  // I-clear ang existing generic menu items (walang merchantId)
  await prisma.menuItem.deleteMany({ where: { merchantId: null } });

  const createdItems = await prisma.menuItem.createMany({ data: menuItems });
  console.log(`   ✅ ${createdItems.count} menu items created`);

  // Show breakdown by category
  const categoryBreakdown = menuItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  Object.entries(categoryBreakdown).forEach(([cat, count]) => {
    console.log(`      ${cat}: ${count} items`);
  });

  // ── STEP 4: Admin Account ──────────────────────────────────────
  console.log('');
  console.log('👤 Setting up admin account...');

  const adminPhone = process.env.ADMIN_PHONE || '09319711028';
  const adminName  = process.env.ADMIN_NAME  || 'MGTM Admin';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mgtmexpress.ph';

  const existingAdmin = await prisma.user.findUnique({
    where: { phone: adminPhone },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { phone: adminPhone },
      data: {
        name:       adminName,
        email:      adminEmail,
        role:       'SUPER_ADMIN',
        isVerified: true,
        isActive:   true,
      },
    });
    console.log(`   ✅ Admin account updated`);
  } else {
    await prisma.user.create({
      data: {
        name:       adminName,
        phone:      adminPhone,
        email:      adminEmail,
        role:       'SUPER_ADMIN',
        isVerified: true,
        isActive:   true,
      },
    });
    console.log(`   ✅ Admin account created`);
  }

  console.log('');
  console.log('   Admin Credentials:');
  console.log(`   Phone    : ${adminPhone}`);
  console.log(`   Role     : SUPER_ADMIN`);
  console.log(`   Dashboard: http://localhost:5173/admin`);

  // ── STEP 5: Sample Customer (para sa testing) ──────────────────
  console.log('');
  console.log('👤 Setting up sample customer...');

  const testPhone = '09111111111';
  const existingCustomer = await prisma.user.findUnique({
    where: { phone: testPhone },
  });

  if (!existingCustomer) {
    await prisma.user.create({
      data: {
        name:       'Juan dela Cruz',
        phone:      testPhone,
        email:      'juan@example.com',
        role:       'CUSTOMER',
        isVerified: true,
        isActive:   true,
      },
    });
    console.log(`   ✅ Sample customer created`);
  } else {
    console.log(`   ⏭️  Sample customer already exists, skipping`);
  }

  console.log('');
  console.log('   Sample Customer:');
  console.log(`   Phone: ${testPhone}`);
  console.log(`   Use this to test the customer flow`);

  // ── DONE! ──────────────────────────────────────────────────────
  console.log('');
  console.log('🎉 ════════════════════════════════════════════════');
  console.log('🎉  SEED COMPLETE! MGTM Express is ready!');
  console.log('🎉 ════════════════════════════════════════════════');
  console.log('');
  console.log('   Next Steps:');
  console.log('   1. npm run dev          — Start ang backend server');
  console.log('   2. Test API:            http://localhost:5000/');
  console.log('   3. Public settings:     http://localhost:5000/api/settings/public');
  console.log('   4. Menu:                http://localhost:5000/api/menu');
  console.log('   5. Prisma Studio:       npx prisma studio');
  console.log('');
  console.log('   Pricing:');
  console.log('   Formula: (km × ₱18) + ₱20 = Delivery Fee');
  console.log('   Minimum: ₱55 (para sa unang 1 km)');
  console.log('   Extra Store: + ₱15 per additional pickup point');
  console.log('');
}

// ─── Run ─────────────────────────────────────────────────────────
main()
  .catch((error) => {
    console.error('');
    console.error('❌ ════════════════════════════════════════════');
    console.error('❌  SEED FAILED!');
    console.error('❌ ════════════════════════════════════════════');
    console.error('');
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('   Possible causes:');
    console.error('   - Hindi connected sa database');
    console.error('   - Hindi pa na-run: npx prisma migrate dev');
    console.error('   - Mali ang DATABASE_URL sa .env');
    console.error('');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

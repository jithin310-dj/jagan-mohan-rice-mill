import { Product } from './types';

export const CATEGORIES = [
  'Jagan Mohan Rice',
  'BPT & BPT Silk Rice',
  'Health & Diet Rice',
  'Basmati Rice',
  'Millets',
  'Specialty Rice & Rice Products'
];

export const PRODUCTS: Product[] = [
  // CATEGORY 1: Jagan Mohan Rice
  {
    id: 'jm-rose',
    name: 'Rose (White Ponni)',
    description: 'Our absolute bestseller. Extremely aged, slender White Ponni grains with a delicate aroma and fluffiest texture. Perfect for premium daily dining.',
    rating: 4.9,
    price: 64, // ₹64 per kg
    discount: 10, // 10% off
    stock: 1500,
    category: 'Jagan Mohan Rice',
    image: '/rose.png?v=4',
    bagSizes: [ 5, 10, 26, 52],
    nutrition: {
      calories: '356 kcal',
      protein: '7.1g',
      carbs: '79g',
      fat: '0.6g',
      fiber: '1.3g'
    },
    reviews: [
      { id: 'r1', userName: 'Srinivas Rao', userEmail: 'srinivas@gmail.com', rating: 5, comment: 'Exceptional quality rice! The grain length is long and cooks beautifully. Our family signature choice.', date: '2026-06-20' },
      { id: 'r2', userName: 'Rama Lakshmi', userEmail: 'ramalakshmi@yahoo.com', rating: 5, comment: 'Very soft, light and non-sticky. Worth every rupee.', date: '2026-07-02' }
    ]
  },
  {
    id: 'jm-lily',
    name: 'Lily (BPT Rice)',
    description: 'Fine slender grains crafted for quick cooking. Highly digestible BPT variety and remains soft even hours after cooking. Ideal for home meals.',
    rating: 4.8,
    price: 58,
    discount: 5,
    stock: 1200,
    category: 'Jagan Mohan Rice',
    image: '/lily.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '352 kcal',
      protein: '6.8g',
      carbs: '80g',
      fat: '0.5g',
      fiber: '1.2g'
    },
    reviews: [
      { id: 'r3', userName: 'K. Venkatesh', userEmail: 'venkat@gmail.com', rating: 4, comment: 'Very good daily use rice. Fast delivery within Guntur.', date: '2026-06-25' }
    ]
  },
  {
    id: 'jm-lotus',
    name: 'Lotus (Kurnool Sona)',
    description: 'Aged for 18 months, Lotus Kurnool Sona delivers a distinct rich taste with high swelling and absolute yield. Outstanding culinary performance.',
    rating: 4.9,
    price: 72,
    discount: 12,
    stock: 950,
    category: 'Jagan Mohan Rice',
    image: '/lotus.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '360 kcal',
      protein: '7.3g',
      carbs: '78g',
      fat: '0.7g',
      fiber: '1.5g'
    },
    reviews: [
      { id: 'r4', userName: 'Priya Reddy', userEmail: 'priya@gmail.com', rating: 5, comment: 'Incredibly delicious! The grains grow double in size. Highly recommended.', date: '2026-07-08' }
    ]
  },
  {
    id: 'jm-jasmine',
    name: 'Jasmine (HMT Rice)',
    description: 'Slightly sticky texture with a heavenly sweet-smelling HMT rice aroma. Sourced and processed using advanced steam technology.',
    rating: 4.7,
    price: 85,
    discount: 8,
    stock: 800,
    category: 'Jagan Mohan Rice',
    image: '/jasmine.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '354 kcal',
      protein: '7.0g',
      carbs: '79g',
      fat: '0.4g',
      fiber: '1.0g'
    },
    reviews: []
  },
  {
    id: 'jm-sunflower',
    name: 'Sunflower (NDL Rice)',
    description: 'Golden-tinged NDL grains milled carefully to preserve the essential bran layers. Combines premium taste with natural goodness.',
    rating: 4.6,
    price: 52,
    discount: 0,
    stock: 1400,
    category: 'Jagan Mohan Rice',
    image: '/sunflower.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '350 kcal',
      protein: '6.5g',
      carbs: '81g',
      fat: '0.8g',
      fiber: '1.8g'
    },
    reviews: []
  },

  // CATEGORY 2: BPT & BPT Silk Rice
  {
    id: 'bullet-rice',
    name: 'Bullet',
    description: 'Short and super-fine grains, widely known as Bullet BPT Rice. Outstanding cooking quality, extremely soft and is a household favorite in Andhra Pradesh.',
    rating: 4.8,
    price: 68,
    discount: 10,
    stock: 1800,
    category: 'BPT & BPT Silk Rice',
    image: '/Bullet.jpeg?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '355 kcal',
      protein: '7.0g',
      carbs: '79g',
      fat: '0.5g',
      fiber: '1.2g'
    },
    reviews: [
      { id: 'r5', userName: 'Anjaneyulu M.', userEmail: 'anjaneyulu@gmail.com', rating: 5, comment: 'Perfect Bullet BPT. Standard size and genuine aroma. Excellent mill quality.', date: '2026-07-01' }
    ]
  },
  {
    id: 'aahar-premium',
    name: 'Aahar',
    description: 'Wholesome rice tailored specifically for bulk food catering, hostels, and restaurant usage. Soft, economical, and delivers high bulk output.',
    rating: 4.5,
    price: 45,
    discount: 5,
    stock: 3500,
    category: 'BPT & BPT Silk Rice',
    image: '/aahar.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '350 kcal',
      protein: '6.4g',
      carbs: '81g',
      fat: '0.6g',
      fiber: '1.0g'
    },
    reviews: []
  },
  {
    id: 'kisan-5293-bpt',
    name: 'Kisan (5293)',
    description: 'Premium farmer-favorite BPT variety milled carefully to retain optimal grain length and purity. Exceptional swelling ratio and high meal satisfaction.',
    rating: 4.8,
    price: 58,
    discount: 5,
    stock: 1200,
    category: 'BPT & BPT Silk Rice',
    image: '/kisan.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '352 kcal',
      protein: '6.8g',
      carbs: '80g',
      fat: '0.5g',
      fiber: '1.2g'
    },
    reviews: []
  },
  {
    id: 'popcorn-premium',
    name: 'Popcorn (BPT Silk)',
    description: 'Extremely rare specialty BPT Silk rice that smells naturally of toasted buttered popcorn. Adds immense excitement to any traditional meal.',
    rating: 4.7,
    price: 95,
    discount: 15,
    stock: 400,
    category: 'BPT & BPT Silk Rice',
    image: '/popcorn.png?v=4',
    bagSizes: [ 5, 10, 26, 52],
    nutrition: {
      calories: '358 kcal',
      protein: '7.1g',
      carbs: '79g',
      fat: '0.7g',
      fiber: '1.4g'
    },
    reviews: []
  },
  {
    id: 'classic-bpt',
    name: 'Classic (Sona Masoori)',
    description: 'Super-refined traditional Sona Masoori variety. Milled with utmost care to offer a balanced grain texture, high culinary yield, and a nostalgic home-style flavor.',
    rating: 4.8,
    price: 62,
    discount: 5,
    stock: 1100,
    category: 'BPT & BPT Silk Rice',
    image: '/classic.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '354 kcal',
      protein: '6.9g',
      carbs: '79g',
      fat: '0.5g',
      fiber: '1.3g'
    },
    reviews: []
  },

  // CATEGORY 3: Health & Diet Rice
  {
    id: 'bell-brown-rice',
    name: 'Bell (Brown Rice)',
    description: 'Unpolished raw brown rice containing 100% of the nutrient-rich bran layer. Loaded with dietary fiber, magnesium, and essential vitamins.',
    rating: 4.6,
    price: 78,
    discount: 12,
    stock: 750,
    category: 'Health & Diet Rice',
    image: '/bell.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '348 kcal',
      protein: '7.9g',
      carbs: '74g',
      fat: '2.8g',
      fiber: '4.5g'
    },
    reviews: [
      { id: 'r7', userName: 'Dr. Madhavi L.', userEmail: 'madhavi@med.org', rating: 5, comment: 'Highly recommended brown rice for diabetic patients. Superior fiber retention.', date: '2026-06-18' }
    ]
  },
  {
    id: 'bell-without-polish',
    name: 'Bell (Without Polish)',
    description: 'Single-polished rice designed to strike the perfect compromise between white rice taste and brown rice nutritional retention. Highly wholesome.',
    rating: 4.7,
    price: 74,
    discount: 8,
    stock: 850,
    category: 'Health & Diet Rice',
    image: '/bell.png?v=4',
    bagSizes: [5, 10, 26, 52],
    nutrition: {
      calories: '352 kcal',
      protein: '7.4g',
      carbs: '76g',
      fat: '1.5g',
      fiber: '2.8g'
    },
    reviews: []
  },
  {
    id: 'befach-diet-rice',
    name: 'Befach (Diet Rice)',
    description: 'Clinically tested low glycemic index (GI) white rice. Prevents blood sugar spikes while retaining the beautiful traditional white rice flavor.',
    rating: 4.8,
    price: 90,
    discount: 10,
    stock: 600,
    category: 'Health & Diet Rice',
    image: '/befach.png?v=4',
    bagSizes: [1, 2, 5],
    nutrition: {
      calories: '345 kcal',
      protein: '7.5g',
      carbs: '73g',
      fat: '0.6g',
      fiber: '3.0g'
    },
    reviews: [
      { id: 'r8', userName: 'Narayana Murthy', userEmail: 'nm@gmail.com', rating: 5, comment: 'Excellent alternative for regular Sona Masoori without compromising on taste.', date: '2026-07-09' }
    ]
  },

  // CATEGORY 4: Basmati Rice
  {
    id: 'daawat-basmati',
    name: 'Daawat Basmati Rice',
    description: 'The connoisseurs choice. Extra long pearl white grains that elongate up to 2.5x. Rich aroma, perfect for Biryanis and premium Pulaos.',
    rating: 4.9,
    price: 180,
    discount: 15,
    stock: 500,
    category: 'Basmati Rice',
    image: '/Daawat rice.png?v=4',
    bagSizes: [1, 2, 5, 10, 30],
    nutrition: {
      calories: '365 kcal',
      protein: '8.2g',
      carbs: '77g',
      fat: '0.5g',
      fiber: '1.6g'
    },
    reviews: []
  },
  {
    id: 'india-gate-basmati',
    name: 'India Gate Basmati Rice',
    description: 'Royal selection, aged meticulously for years. It features thin grain profile, rich culinary fragrance, and royal cooking appearance.',
    rating: 4.9,
    price: 195,
    discount: 10,
    stock: 450,
    category: 'Basmati Rice',
    image: '/Indiagate Rice.webp?v=4',
    bagSizes: [1, 2, 5, 10, 30],
    nutrition: {
      calories: '368 kcal',
      protein: '8.5g',
      carbs: '77g',
      fat: '0.4g',
      fiber: '1.7g'
    },
    reviews: [
      { id: 'r9', userName: 'Ayesha Khan', userEmail: 'ayesha@yahoo.com', rating: 5, comment: 'Simply divine Biryani using this. Extremely premium.', date: '2026-07-10' }
    ]
  },

  // CATEGORY 5: Millets
  {
    id: 'kodo-millet',
    name: 'Kodo Millet (Arikelu)',
    description: 'Unpolished organic Kodo Millet (Arikelu). Packed with antioxidants and high fiber content, ideal for blood pressure regulation.',
    rating: 4.7,
    price: 85,
    discount: 10,
    stock: 650,
    category: 'Millets',
    isAddOn: true,
    image: '/kodomillet.png',
    bagSizes: [ 1, 2, 5 ],
    nutrition: {
      calories: '333 kcal',
      protein: '8.3g',
      carbs: '65g',
      fat: '1.4g',
      fiber: '9.0g'
    },
    reviews: []
  },
  {
    id: 'foxtail-millet',
    name: 'Foxtail Millet (Korralu)',
    description: 'Mineral-rich Foxtail Millet (Korra) processed carefully in clean de-stoner systems. Ideal for nerve system strength and immunity.',
    rating: 4.8,
    price: 75,
    discount: 8,
    stock: 700,
    category: 'Millets',
    isAddOn: true,
    image: '/foxtailmillet.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '351 kcal',
      protein: '11.2g',
      carbs: '63g',
      fat: '4.0g',
      fiber: '8.0g'
    },
    reviews: []
  },
  {
    id: 'brown-top-millet',
    name: 'Brown Top Millet (Andu Korralu)',
    description: 'Super-premium and rare Brown Top Millet (Andu Korralu). Highly alkaline and rich in fiber (12.5%). Helps deeply cleanse the digestive tract.',
    rating: 4.9,
    price: 110,
    discount: 12,
    stock: 500,
    category: 'Millets',
    isAddOn: true,
    image: '/browntopmillet.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '338 kcal',
      protein: '8.9g',
      carbs: '69g',
      fat: '1.9g',
      fiber: '12.5g'
    },
    reviews: []
  },
  {
    id: 'little-millet',
    name: 'Little Millet (Samalu)',
    description: 'Rich in magnesium and phosphorous, organic Little Millet (Sama) is a great gluten-free replacement for rice or wheat in everyday recipes.',
    rating: 4.7,
    price: 80,
    discount: 5,
    stock: 600,
    category: 'Millets',
    isAddOn: true,
    image: '/littlemillet.png',
    bagSizes: [ 1, 2, 5 ],
    nutrition: {
      calories: '341 kcal',
      protein: '7.7g',
      carbs: '67g',
      fat: '2.1g',
      fiber: '7.6g'
    },
    reviews: []
  },
  {
    id: 'barnyard-millet',
    name: 'Barnyard Millet (Oodalu)',
    description: 'Extremely fast-digesting organic Barnyard Millet (Odalur). High in digestible protein and lowest in caloric density among all cereals.',
    rating: 4.6,
    price: 82,
    discount: 8,
    stock: 550,
    category: 'Millets',
    isAddOn: true,
    image: '/barnyardmillet.png',
    bagSizes: [ 1, 2, 5 ],
    nutrition: {
      calories: '307 kcal',
      protein: '6.2g',
      carbs: '65g',
      fat: '1.8g',
      fiber: '10.0g'
    },
    reviews: []
  },
  {
    id: 'quinoa-organic',
    name: 'Quinoa (Kinova)',
    description: 'High-altitude organic white quinoa. Full protein profile containing all 9 essential amino acids. Sourced fresh and packed sanitarily.',
    rating: 4.8,
    price: 190,
    discount: 15,
    stock: 450,
    category: 'Millets',
    isAddOn: true,
    image: '/quinoa.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '368 kcal',
      protein: '14.1g',
      carbs: '64g',
      fat: '6.1g',
      fiber: '7.0g'
    },
    reviews: []
  },



  // CATEGORY 6: Specialty Rice & Rice Products
  {
    id: 'black-rice-karuppu',
    name: 'Black Rice',
    description: 'The ancient \"Forbidden Rice\" rich in Anthocyanin antioxidants. High medicinal value, promotes liver health, stamina, and deep detoxification.',
    rating: 4.9,
    price: 150,
    discount: 10,
    stock: 350,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/blackrice.png',
    bagSizes: [ 1, 2, 5 ],
    nutrition: {
      calories: '340 kcal',
      protein: '8.5g',
      carbs: '72g',
      fat: '3.5g',
      fiber: '4.9g'
    },
    reviews: [
      { id: 'r10', userName: 'Rajesh Guntur', userEmail: 'rajeshg@gmail.com', rating: 5, comment: 'Phenomenal quality. Extremely fresh black rice with thick outer husk.', date: '2026-07-07' }
    ]
  },
  {
    id: 'red-rice-kerala',
    name: 'Red Rice',
    description: 'Kerala unpolished thick red rice. Wholesome grain loaded with vitamins and earthy flavor, perfect for traditional meals.',
    rating: 4.7,
    price: 85,
    discount: 5,
    stock: 800,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/redrice.png',
    bagSizes: [ 1, 2, 5],   
    nutrition: {
      calories: '343 kcal',
      protein: '7.6g',
      carbs: '76g',
      fat: '1.2g',
      fiber: '3.2g'
    },
    reviews: []
  },
  {
    id: 'chitti-mutyalu',
    name: 'Chitti Mutyalu Rice',
    description: 'Tiny pearl-like aromatic grains. The legendary rice of Andhra Pradesh used traditionally for high-grade Biryani, Pulaos and Ghee rice.',
    rating: 4.9,
    price: 110,
    discount: 10,
    stock: 600,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/chittimuthyalurice.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '357 kcal',
      protein: '7.2g',
      carbs: '79g',
      fat: '0.5g',
      fiber: '1.4g'
    },
    reviews: [
      { id: 'r11', userName: 'Kalyani S.', userEmail: 'kalyanis@gmail.com', rating: 5, comment: 'Chitti Mutyalu biryani is unmatched! Best quality grains, no broken pieces.', date: '2026-07-06' }
    ]
  },
  {
    id: 'idli-rava-premium',
    name: 'Idli Rava',
    description: 'Double-ground and filtered premium rice semolina. Creates perfectly fluffy, feather-soft traditional idlis every single time.',
    rating: 4.8,
    price: 48,
    discount: 0,
    stock: 1200,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/idlyrava.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '345 kcal',
      protein: '6.4g',
      carbs: '80g',
      fat: '0.4g',
      fiber: '1.0g'
    },
    reviews: []
  },
  {
    id: 'rice-rava-upma',
    name: 'Rice Rava',
    description: 'Thick-grained premium rice semolina designed specifically for high-texture traditional rice upmas and pulihora prasadam.',
    rating: 4.7,
    price: 50,
    discount: 5,
    stock: 1000,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/ricerava.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '346 kcal',
      protein: '6.5g',
      carbs: '80g',
      fat: '0.4g',
      fiber: '1.1g'
    },
    reviews: []
  },
  {
    id: 'boiled-rice-ponni',
    name: 'Boiled Rice',
    description: 'Pre-steamed Ponni Rice that retains vital water-soluble minerals during parboiling. Outstanding digestibility and soft bite.',
    rating: 4.7,
    price: 56,
    discount: 5,
    stock: 1500,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/boiledrice.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '349 kcal',
      protein: '6.9g',
      carbs: '79g',
      fat: '0.5g',
      fiber: '1.5g'
    },
    reviews: []
  },
  {
    id: 'rice-bran-specialty',
    name: 'Rice Bran',
    description: 'Highly nutritious specialty rice bran product, freshly milled at Guntur. Retains essential dietary oils, vitamins, and minerals. Perfect for baking, brewing, health supplements, or specialized culinary recipes.',
    rating: 4.8,
    price: 40,
    discount: 0,
    stock: 800,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/ricebran.png',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '310 kcal',
      protein: '13.3g',
      carbs: '50g',
      fat: '20.1g',
      fiber: '21.0g'
    },
    reviews: []
  },
  {
    id: 'broken-rice',
    name: 'Broken Rice (Nooka)',
    description: 'Double-cleaned premium broken rice (nooka). Extremely versatile and highly cost-effective, ideal for traditional rice ravva, idli preparation, healthy congee/porridges, or daily home recipes.',
    rating: 4.7,
    price: 32,
    discount: 0,
    stock: 2500,
    category: 'Specialty Rice & Rice Products',
    isAddOn: true,
    image: '/brokenrice.jpeg',
    bagSizes: [ 1, 2, 5],
    nutrition: {
      calories: '348 kcal',
      protein: '6.2g',
      carbs: '79g',
      fat: '0.4g',
      fiber: '1.0g'
    },
    reviews: []
  },
  {
    id: "millets-combo",
    name: "Millets Combo Pack",
    description:
      "Contains 1kg each of Kodo, Foxtail, Brown Top, Little and Barnyard Millets. Quinoa is not included.",
    rating: 5,
    price: 432, // Replace with your actual combo price
    discount: 10,
    stock: 100,
    category: "Millets",
    image: "/milletscombo.png",
    bagSizes: [1],
    nutrition: {
      calories: "-",
      protein: "-",
      carbs: "-",
      fat: "-",
      fiber: "-"
    },
    reviews: []
  }
];
  

export const COUPONS: Coupon[] = [
  { code: 'JAGANMOHAN10', type: 'percentage', value: 10, minOrderValue: 1000 },
  { code: 'RICEGOLD500', type: 'fixed', value: 500, minOrderValue: 5000 },
  { code: 'FREEDELIVERY', type: 'percentage', value: 0, minOrderValue: 2000 }
];

export const CONTACT_INFO = {
  name: 'Jagan Mohan Rice Mill',
  address: '1st Lane, Cobald Pet, Guntur, Andhra Pradesh – 522002',
  phone1: '08632-230154',
  phone2: '08632-234022',
  mobile: '7382299666',
  whatsapp: '7382299666',
  email: 'jaganmohanricemill@gmail.com',
  hoursWeekday: 'Monday-Saturday: 8AM - 7PM',
  hoursSunday: 'Sunday: 8AM - 1PM'
};

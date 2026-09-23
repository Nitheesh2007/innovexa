/**
 * Client-Side Intelligent Product Image Matcher
 */

export const EXACT_PRODUCT_IMAGES = {
  // Apple Smartphones
  'iphone 15 pro max': '/images/products/smartphone_homescreen.jpg',
  'iphone 15 pro': '/images/products/smartphone_homescreen.jpg',
  'iphone 15': '/images/products/smartphone_homescreen.jpg',
  'iphone 14': '/images/products/smartphone_homescreen.jpg',
  'iphone 13': '/images/products/smartphone_homescreen.jpg',

  // Samsung Smartphones
  'samsung galaxy s24 ultra': '/images/products/smartphone_homescreen.jpg',
  'samsung galaxy s24': '/images/products/smartphone_homescreen.jpg',
  'samsung galaxy s23': '/images/products/smartphone_homescreen.jpg',

  // Google Pixel & Other Phones
  'google pixel 8 pro': '/images/products/smartphone_homescreen.jpg',
  'google pixel 8': '/images/products/smartphone_homescreen.jpg',

  // Laptops
  'macbook pro 16" m3 max': '/images/products/laptop_screen.jpg',
  'macbook pro 16-inch': '/images/products/laptop_screen.jpg',
  'macbook pro 14-inch': '/images/products/laptop_screen.jpg',
  'macbook air m3': '/images/products/laptop_screen.jpg',
  'macbook air m2': '/images/products/laptop_screen.jpg',
  'dell xps 15': '/images/products/laptop_screen.jpg',
  'dell xps 13': '/images/products/laptop_screen.jpg',
  'lenovo thinkpad x1 carbon': '/images/products/laptop_screen.jpg',
  'asus rog zephyrus g14': '/images/products/laptop_screen.jpg',
  'surface pro': '/images/products/laptop_screen.jpg',

  // Smartwatches & Wearables
  'apple watch series 9': '/images/products/smartwatch_display.jpg',
  'apple watch ultra 2': '/images/products/smartwatch_display.jpg',
  'samsung galaxy watch 6': '/images/products/smartwatch_display.jpg',
  'garmin fenix 7': '/images/products/smartwatch_display.jpg',

  // Headphones & Audio
  'sony wh-1000xm5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
  'bose quietcomfort ultra': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
  'airpods pro (2nd gen)': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
  'airpods pro': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&q=80',
  'airpods max': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',

  // PC Components & GPUs
  'nvidia rtx 4090': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  'nvidia rtx 4080': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&q=80',
  'amd ryzen 9 7950x3d': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
  'intel core i9-14900k': 'https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800&q=80',
  'samsung 990 pro 2tb ssd': 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&q=80',

  // Gaming Consoles
  'playstation 5': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
  'sony playstation 5': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80',
  'xbox series x': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&q=80',
  'nintendo switch oled': 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&q=80',
  'steam deck': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',

  // Peripherals
  'logitech mx master 3s': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
  'keychron q1 pro': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
  'sony a7 iv': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
  'dji mini 4 pro': 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&q=80',
  'lg c3 65-inch oled tv': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80'
};

export const CATEGORY_FALLBACK_IMAGES = {
  'smartphones': '/images/products/smartphone_homescreen.jpg',
  'laptops': '/images/products/laptop_screen.jpg',
  'wearables': '/images/products/smartwatch_display.jpg',
  'audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'components': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  'groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  'apparel': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
  'home goods': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
  'toys': 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
  'books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
  'beauty': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
  'sports': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&q=80',
  'automotive': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&q=80',
  'office supplies': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
  'pet supplies': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80',
  'tools': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80',
  'health': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
  'garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  'jewelry': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'
};

export function getMatchingProductImage(name = '', categoryName = '') {
  if (!name) return 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?w=800&q=80';
  
  const lower = name.toLowerCase().trim();

  // 1. Direct match in dictionary
  for (const [key, url] of Object.entries(EXACT_PRODUCT_IMAGES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return url;
    }
  }

  // 2. Keyword heuristic checks
  // Phones & Tablets
  if (lower.includes('iphone') || lower.includes('galaxy s') || lower.includes('pixel') || lower.includes('smartphone') || lower.includes('phone')) {
    return EXACT_PRODUCT_IMAGES['iphone 15 pro max'];
  }
  if (lower.includes('ipad') || lower.includes('tablet') || lower.includes('tab')) {
    return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80';
  }

  // Computers & Laptops
  if (lower.includes('macbook') || lower.includes('laptop') || lower.includes('xps') || lower.includes('thinkpad') || lower.includes('zenbook') || lower.includes('notebook')) {
    return EXACT_PRODUCT_IMAGES['macbook pro 16" m3 max'];
  }

  // Wearables & Watches
  if (lower.includes('watch') || lower.includes('fitbit') || lower.includes('garmin') || lower.includes('smartwatch')) {
    return EXACT_PRODUCT_IMAGES['apple watch series 9'];
  }

  // Audio & Sound
  if (lower.includes('headphone') || lower.includes('earbud') || lower.includes('airpod') || lower.includes('wh-1000xm') || lower.includes('soundbar') || lower.includes('audio') || lower.includes('speaker')) {
    return EXACT_PRODUCT_IMAGES['sony wh-1000xm5'];
  }

  // PC Components
  if (lower.includes('rtx') || lower.includes('geforce') || lower.includes('gpu') || lower.includes('graphics card')) {
    return EXACT_PRODUCT_IMAGES['nvidia rtx 4090'];
  }
  if (lower.includes('ryzen') || lower.includes('core i') || lower.includes('processor') || lower.includes('cpu')) {
    return EXACT_PRODUCT_IMAGES['amd ryzen 9 7950x3d'];
  }
  if (lower.includes('ssd') || lower.includes('ram') || lower.includes('ddr5') || lower.includes('memory') || lower.includes('motherboard')) {
    return EXACT_PRODUCT_IMAGES['samsung 990 pro 2tb ssd'];
  }

  // Gaming Consoles
  if (lower.includes('playstation') || lower.includes('ps5') || lower.includes('sony playstation')) {
    return EXACT_PRODUCT_IMAGES['playstation 5'];
  }
  if (lower.includes('xbox')) {
    return EXACT_PRODUCT_IMAGES['xbox series x'];
  }
  if (lower.includes('switch') || lower.includes('nintendo')) {
    return EXACT_PRODUCT_IMAGES['nintendo switch oled'];
  }
  if (lower.includes('steam deck') || lower.includes('console')) {
    return EXACT_PRODUCT_IMAGES['steam deck'];
  }

  // Peripherals & Desks
  if (lower.includes('mouse') || lower.includes('logitech') || lower.includes('trackpad')) {
    return EXACT_PRODUCT_IMAGES['logitech mx master 3s'];
  }
  if (lower.includes('keyboard') || lower.includes('keychron')) {
    return EXACT_PRODUCT_IMAGES['keychron q1 pro'];
  }
  if (lower.includes('chair') || lower.includes('aeron') || lower.includes('seating')) {
    return EXACT_PRODUCT_IMAGES['herman miller aeron'];
  }
  if (lower.includes('camera') || lower.includes('lens') || lower.includes('dslr')) {
    return EXACT_PRODUCT_IMAGES['sony a7 iv'];
  }
  if (lower.includes('drone') || lower.includes('dji')) {
    return EXACT_PRODUCT_IMAGES['dji mini 4 pro'];
  }
  if (lower.includes('tv') || lower.includes('oled') || lower.includes('monitor') || lower.includes('display') || lower.includes('screen')) {
    return EXACT_PRODUCT_IMAGES['lg c3 65-inch oled tv'];
  }

  // Fashion & Apparel
  if (lower.includes('shirt') || lower.includes('tshirt') || lower.includes('pants') || lower.includes('jeans') || lower.includes('jacket') || lower.includes('dress') || lower.includes('apparel') || lower.includes('clothing') || lower.includes('hoodie')) {
    return CATEGORY_FALLBACK_IMAGES['apparel'];
  }

  // Groceries & Food
  if (lower.includes('grocery') || lower.includes('food') || lower.includes('coffee') || lower.includes('tea') || lower.includes('organic') || lower.includes('snack') || lower.includes('fruit') || lower.includes('mix') || lower.includes('fresh')) {
    return CATEGORY_FALLBACK_IMAGES['groceries'];
  }

  // Home Goods & Decor
  if (lower.includes('home') || lower.includes('table') || lower.includes('lamp') || lower.includes('shelf') || lower.includes('sofa') || lower.includes('furniture') || lower.includes('decor') || lower.includes('bed')) {
    return CATEGORY_FALLBACK_IMAGES['home goods'];
  }

  // Toys & Games
  if (lower.includes('toy') || lower.includes('puzzle') || lower.includes('lego') || lower.includes('game') || lower.includes('doll') || lower.includes('plush') || lower.includes('action figure')) {
    return CATEGORY_FALLBACK_IMAGES['toys'];
  }

  // Books
  if (lower.includes('book') || lower.includes('novel') || lower.includes('guide') || lower.includes('reading') || lower.includes('magazine')) {
    return CATEGORY_FALLBACK_IMAGES['books'];
  }

  // Beauty & Skincare
  if (lower.includes('beauty') || lower.includes('serum') || lower.includes('cream') || lower.includes('lotion') || lower.includes('cosmetic') || lower.includes('skincare') || lower.includes('perfume') || lower.includes('glow')) {
    return CATEGORY_FALLBACK_IMAGES['beauty'];
  }

  // Sports & Fitness
  if (lower.includes('sport') || lower.includes('fitness') || lower.includes('gym') || lower.includes('weight') || lower.includes('mat') || lower.includes('ball') || lower.includes('training')) {
    return CATEGORY_FALLBACK_IMAGES['sports'];
  }

  // Automotive
  if (lower.includes('auto') || lower.includes('car') || lower.includes('oil') || lower.includes('filter') || lower.includes('motor') || lower.includes('tire') || lower.includes('vehicle')) {
    return CATEGORY_FALLBACK_IMAGES['automotive'];
  }

  // Office Supplies
  if (lower.includes('office') || lower.includes('paper') || lower.includes('pen') || lower.includes('desk') || lower.includes('stationery') || lower.includes('stapler')) {
    return CATEGORY_FALLBACK_IMAGES['office supplies'];
  }

  // Pet Supplies
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat') || lower.includes('leash') || lower.includes('pet food') || lower.includes('squeaky')) {
    return CATEGORY_FALLBACK_IMAGES['pet supplies'];
  }

  // Tools & Hardware
  if (lower.includes('tool') || lower.includes('drill') || lower.includes('wrench') || lower.includes('saw') || lower.includes('hammer') || lower.includes('cordless') || lower.includes('hardware')) {
    return CATEGORY_FALLBACK_IMAGES['tools'];
  }

  // Health & Medical
  if (lower.includes('health') || lower.includes('vitamin') || lower.includes('supplement') || lower.includes('medicine') || lower.includes('drops')) {
    return CATEGORY_FALLBACK_IMAGES['health'];
  }

  // Garden & Plants
  if (lower.includes('garden') || lower.includes('plant') || lower.includes('pot') || lower.includes('flower') || lower.includes('hose') || lower.includes('outdoor')) {
    return CATEGORY_FALLBACK_IMAGES['garden'];
  }

  // Jewelry
  if (lower.includes('jewelry') || lower.includes('ring') || lower.includes('necklace') || lower.includes('diamond') || lower.includes('gold') || lower.includes('silver') || lower.includes('bracelet')) {
    return CATEGORY_FALLBACK_IMAGES['jewelry'];
  }

  // Baby Care
  if (lower.includes('baby') || lower.includes('diaper') || lower.includes('wipes') || lower.includes('stroller') || lower.includes('crib')) {
    return 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80';
  }

  // 3. Category Fallback
  const catLower = (categoryName || '').toLowerCase().trim();
  if (catLower && CATEGORY_FALLBACK_IMAGES[catLower]) {
    return CATEGORY_FALLBACK_IMAGES[catLower];
  }

  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
}

import type { ShippingRate } from '../types'

// Shipping rates based on weight (in grams)
export const SHIPPING_RATES: ShippingRate[] = [
  { minWeight: 0, maxWeight: 500, rate: 49 },
  { minWeight: 501, maxWeight: 1000, rate: 69 },
  { minWeight: 1001, maxWeight: 2000, rate: 89 },
  { minWeight: 2001, maxWeight: 3000, rate: 109 },
  { minWeight: 3001, maxWeight: 4000, rate: 129 },
  { minWeight: 4001, maxWeight: 5000, rate: 149 },
  { minWeight: 5001, maxWeight: 10000, rate: 199 },
  { minWeight: 10001, maxWeight: Infinity, rate: 299 } // For very heavy items
]

// COD charge
export const COD_CHARGE = 19

// Default weights for products without weight specified (in grams)
export const DEFAULT_WEIGHTS: Record<string, number> = {
  // Electronics - Light items
  'mobile': 180,
  'phone': 180,
  'earphone': 30,
  'earbuds': 20,
  'headphone': 250,
  'speaker': 300,
  'charger': 80,
  'cable': 30,
  'powerbank': 300,
  'watch': 50,
  'smartwatch': 80,
  'adapter': 100,
  'mouse': 80,
  'keyboard': 400,
  'pendrive': 10,
  'memory card': 5,
  'case': 50,
  'cover': 30,
  'screen guard': 10,
  'tempered glass': 20,
  
  // Fashion - Very light items
  'tshirt': 150,
  'shirt': 200,
  'top': 120,
  'kurti': 180,
  'saree': 400,
  'dupatta': 100,
  'scarf': 80,
  'jeans': 500,
  'trouser': 400,
  'pant': 350,
  'shorts': 200,
  'skirt': 250,
  'dress': 300,
  'frock': 250,
  'leggings': 150,
  'track': 300,
  'pajama': 200,
  'nightwear': 180,
  'innerwear': 50,
  'bra': 80,
  'panty': 30,
  'brief': 40,
  'vest': 80,
  'socks': 50,
  'shoes': 600,
  'sandal': 300,
  'slipper': 200,
  'chappal': 250,
  'sneakers': 500,
  'heels': 400,
  'boots': 700,
  'bag': 200,
  'handbag': 300,
  'backpack': 400,
  'wallet': 100,
  'purse': 150,
  'belt': 150,
  'cap': 80,
  'hat': 100,
  'sunglasses': 50,
  'jewelry': 30,
  'ring': 10,
  'necklace': 50,
  'earrings': 20,
  'bracelet': 30,
  
  // Home & Kitchen - Light to medium
  'bottle': 200,
  'flask': 300,
  'mug': 250,
  'cup': 150,
  'glass': 200,
  'plate': 300,
  'bowl': 200,
  'spoon': 30,
  'fork': 40,
  'knife': 80,
  'spatula': 100,
  'ladle': 150,
  'tiffin': 400,
  'lunchbox': 300,
  'container': 200,
  'jar': 250,
  'pan': 600,
  'pot': 800,
  'kadhai': 700,
  'cooker': 1200,
  'kettle': 800,
  'mixer': 2000,
  'grinder': 1500,
  'blender': 1000,
  'toaster': 1500,
  'iron': 1200,
  'vacuum': 3000,
  'fan': 2000,
  'heater': 1500,
  'cooler': 5000,
  'ac': 15000,
  'fridge': 25000,
  'washing machine': 30000,
  
  // Beauty & Personal Care - Very light
  'cream': 80,
  'lotion': 120,
  'moisturizer': 100,
  'serum': 50,
  'face wash': 150,
  'cleanser': 120,
  'toner': 150,
  'shampoo': 250,
  'conditioner': 250,
  'hair oil': 200,
  'soap': 80,
  'body wash': 300,
  'perfume': 150,
  'deodorant': 200,
  'lipstick': 20,
  'lip balm': 15,
  'kajal': 25,
  'eyeliner': 30,
  'mascara': 40,
  'foundation': 100,
  'powder': 150,
  'blush': 80,
  'nail polish': 50,
  'hair band': 20,
  'hair clip': 10,
  'comb': 50,
  'brush': 100,
  'razor': 50,
  'trimmer': 300,
  'toothbrush': 30,
  'toothpaste': 150,
  'mouthwash': 400,
  
  // Books & Stationery - Light
  'book': 200,
  'notebook': 150,
  'diary': 200,
  'pen': 15,
  'pencil': 8,
  'marker': 20,
  'highlighter': 25,
  'eraser': 10,
  'sharpener': 15,
  'ruler': 30,
  'compass': 50,
  'calculator': 200,
  'stapler': 150,
  'scissors': 100,
  'glue': 80,
  'tape': 100,
  'file': 200,
  'folder': 100,
  
  // Sports & Fitness - Medium weight
  'ball': 300,
  'football': 400,
  'cricket ball': 160,
  'tennis ball': 60,
  'badminton': 80,
  'bat': 600,
  'cricket bat': 1200,
  'racket': 250,
  'tennis racket': 300,
  'badminton racket': 200,
  'gym': 500,
  'dumbbell': 2000,
  'yoga mat': 800,
  'skipping rope': 200,
  'cycle': 12000,
  'helmet': 800,
  'gloves': 150,
  
  // Toys & Games - Light to medium
  'toy': 150,
  'doll': 200,
  'car toy': 100,
  'puzzle': 300,
  'game': 400,
  'board game': 600,
  'cards': 100,
  'lego': 200,
  'teddy': 300,
  'soft toy': 200,
  
  // Accessories - Very light
  'keychain': 20,
  'sticker': 5,
  'magnet': 30,
  'badge': 15,
  'pin': 10,
  'button': 5,
  'thread': 50,
  'needle': 5,
  'zip': 20,
  'velcro': 30,
  
  // Default fallback - reduced
  'default': 150
}

// Packaging weight (in grams) - reduced for lighter items
export const PACKAGING_WEIGHT = 30

/**
 * Estimate product weight based on name and category
 */
export function estimateProductWeight(productName: string, category?: string): number {
  const name = productName.toLowerCase()
  
  // Check for specific keywords in product name
  for (const [keyword, weight] of Object.entries(DEFAULT_WEIGHTS)) {
    if (name.includes(keyword)) {
      return weight
    }
  }
  
  // Check category-based weights with more accurate estimates
  if (category) {
    const cat = category.toLowerCase()
    if (cat.includes('electronic') || cat.includes('mobile') || cat.includes('tech')) {
      return 200 // Reduced from 300
    }
    if (cat.includes('fashion') || cat.includes('clothing') || cat.includes('apparel')) {
      return 180 // Reduced from 250
    }
    if (cat.includes('home') || cat.includes('kitchen')) {
      return 300 // Reduced from 400
    }
    if (cat.includes('beauty') || cat.includes('personal') || cat.includes('cosmetic')) {
      return 120 // Reduced from 150
    }
    if (cat.includes('book') || cat.includes('stationery')) {
      return 150 // Reduced from 200
    }
    if (cat.includes('sports') || cat.includes('fitness')) {
      return 400 // Reduced from 500
    }
    if (cat.includes('toy') || cat.includes('game')) {
      return 200 // Reduced from 300
    }
    if (cat.includes('accessory') || cat.includes('accessories')) {
      return 80 // New category for light accessories
    }
    if (cat.includes('jewelry') || cat.includes('jewellery')) {
      return 50 // New category for jewelry
    }
  }
  
  return DEFAULT_WEIGHTS.default
}

/**
 * Calculate shipping cost based on total weight
 */
export function calculateShippingCost(totalWeightInGrams: number): number {
  const rate = SHIPPING_RATES.find(
    rate => totalWeightInGrams >= rate.minWeight && totalWeightInGrams <= rate.maxWeight
  )
  
  return rate ? rate.rate : SHIPPING_RATES[SHIPPING_RATES.length - 1].rate
}

/**
 * Calculate total weight for cart items
 */
export function calculateTotalWeight(items: Array<{ id: string; qty: number; weight?: number; name: string; category?: string }>): number {
  return items.reduce((total, item) => {
    const itemWeight = item.weight || estimateProductWeight(item.name, item.category)
    return total + (itemWeight * item.qty)
  }, 0) + PACKAGING_WEIGHT
}

/**
 * Get shipping details including weight breakdown
 */
export function getShippingDetails(items: Array<{ id: string; qty: number; weight?: number; name: string; category?: string }>) {
  const totalWeight = calculateTotalWeight(items)
  const shippingCost = calculateShippingCost(totalWeight)
  
  return {
    totalWeight,
    totalWeightKg: (totalWeight / 1000).toFixed(2),
    shippingCost,
    packagingWeight: PACKAGING_WEIGHT,
    breakdown: items.map(item => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      weight: item.weight || estimateProductWeight(item.name, item.category),
      totalWeight: (item.weight || estimateProductWeight(item.name, item.category)) * item.qty
    }))
  }
}
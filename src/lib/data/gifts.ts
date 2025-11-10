export const GIFT_ITEMS = [
  {
    id: "gift_1",
    name: "Premium Mobile Holder",
    image: "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp",
    tier: 399
  },
  {
    id: "gift_2", 
    name: "LED String Lights",
    image: "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/04_light_59099232-79e1-4dec-805f-42dc9208c96b.webp",
    tier: 699
  },
  {
    id: "gift_3",
    name: "Butterfly Wall Stickers",
    image: "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/WhatsAppImage2025-08-26at10.42.57_83dbfe1f.webp", 
    tier: 999
  }
]

export const getGiftTier = (cartTotal: number) => {
  if (cartTotal >= 999) return 3
  if (cartTotal >= 699) return 2  
  if (cartTotal >= 399) return 1
  return 0
}

export const getGiftsForTier = (tier: number) => {
  return GIFT_ITEMS.filter(gift => gift.tier <= (tier === 1 ? 399 : tier === 2 ? 699 : 999)).slice(0, tier)
}
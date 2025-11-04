// Category और Subcategory mapping
export const CATEGORIES = {
  'Home': [
    'Puja-Essentials',
    'Bathroom-Accessories',
    'Kitchenware',
    'Household-Appliances'
  ],
  'Tech': [
    'Best Selling',
    'Accessories',
    'Decor & Lighting',
    'Audio',
    'Computer Accessories',
    'Kitchen Appliances',
    'Kitchen Tools',
    'Outdoor Lighting',
    'Hair'
  ],
  'New Arrivals': [
    'LED Lights',
    'Best Selling',
    'Gifts',
    'Car Accessories',
    'Home Appliances',
    'Kitchen Appliances',
    'Cleaning Tools',
    'Health & Personal Care',
    'Cables & Chargers',
    'Home Organization',
    'Table Lamps',
    'Photo Frames',
    'Showpieces',
    'Kitchen & Dining'
  ],
  'Customizable': [
    'Drinkware',
    'Kitchen',
    'Gift Hampers',
    'Accessories',
    'Jewelry'
  ]
} as const;

export type CategoryType = keyof typeof CATEGORIES;
export type SubcategoryType = typeof CATEGORIES[CategoryType][number];
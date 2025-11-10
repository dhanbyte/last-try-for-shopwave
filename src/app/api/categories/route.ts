import { NextResponse } from 'next/server'

let dbConnect: any
let Product: any
let VendorProduct: any

try {
  dbConnect = require('@/lib/dbConnect').default
  Product = require('@/models/Product').default
  VendorProduct = require('@/models/VendorProduct').default
} catch (error) {
  console.warn('Database modules not available')
}

export async function GET() {
  try {
    if (!dbConnect || !Product) {
      // Return hardcoded categories if database is not available
      return NextResponse.json({
        success: true,
        categories: [
          {
            name: 'Tech',
            subcategories: ['Accessories', 'Audio', 'Computer Accessories', 'Decor & Lighting', 'Outdoor Lighting']
          },
          {
            name: 'Home',
            subcategories: [
              'Puja-Essentials',
              'Bathroom-Accessories', 
              'Kitchenware',
              'Household-Appliances',
              'Food Storage',
              'Drinkware',
              'Storage & Organization',
              'Kitchen Tools',
              'Baking Tools'
            ]
          },
          {
            name: 'New Arrivals',
            subcategories: ['Best Selling', 'Fragrance', 'Diwali Special', 'Gifts']
          },
          {
            name: 'Customizable',
            subcategories: ['Jewelry', 'Drinkware', 'Accessories', 'Kitchen']
          }
        ]
      })
    }

    await dbConnect()

    // Get unique categories and subcategories from both regular and vendor products
    const [regularProducts, vendorProducts] = await Promise.all([
      Product.find({}, { category: 1, subcategory: 1 }).lean(),
      VendorProduct ? VendorProduct.find({ status: 'active' }, { category: 1, subcategory: 1 }).lean() : []
    ])

    const allProducts = [...regularProducts, ...vendorProducts]
    
    // Group products by category and collect unique subcategories
    const categoryMap = new Map<string, Set<string>>()
    
    allProducts.forEach(product => {
      if (product.category && product.category !== 'Fashion') { // Skip fashion category
        const category = product.category
        if (!categoryMap.has(category)) {
          categoryMap.set(category, new Set())
        }
        if (product.subcategory) {
          categoryMap.get(category)?.add(product.subcategory)
        }
      }
    })

    // Convert to array format
    const categories = Array.from(categoryMap.entries()).map(([name, subcategoriesSet]) => ({
      name,
      subcategories: Array.from(subcategoriesSet).sort()
    }))

    // Add default categories if they don't exist in database
    const defaultCategories = [
      {
        name: 'Tech',
        subcategories: ['Wearable Devices', 'Headphones', 'Watches', 'VR Headsets', 'Computer Accessories', 'Laptop Stands', 'Keyboard & Mouse', 'Speakers', 'Mobile Accessories', 'Mobile Chargers', 'Mobile Holder & Mobile Stand', 'Waterproof Mobile Cover', 'Viral Gadget', 'Personal Care Gadgets', 'Kitchen Gadgets', 'Security Cameras']
      },
      {
        name: 'Home', 
        subcategories: [
          'Kitchen Storage & Container', 'Water Jugs', 'Kitchen Basket & Bowl', 'Glassware', 'Spice Rack & Box', 'Lunch Box & Tiffin', 'Ice Cube Trays', 'Storage Baskets', 'Water Bottles', 'Baking Tools', 'Silicone Moulds', 'Oven Accessories', 'Kitchen Appliances', 'Blender', 'Pressure Cooker', 'Mixer/Griender', 'Fry Pan', 'Sandwich Maker', 'Kettle', 'Kitchen Tools', 'Chopping Board', 'Roasting Pans', 'Kitchen Tongs', 'Strainers', 'Whisks', 'Knives', 'Knife Sharpener', 'Choppers & Slicers', 'Spoons', 'Plates', 'Oil Dispenser'
        ]
      },
      {
        name: 'New Arrivals',
        subcategories: ['Shopwave', 'Just Arrived', 'Best Seller', 'Jewellery', 'Garden & Outdoor', 'Latest Gadgets', 'Trending Products', 'Clock', 'Corporate Gift', 'Health & Personal', 'Hair Accessories', 'Car Accessories', 'Gift Items', 'Fragrance', 'Brand Gellery', 'Beauty Products', 'Travel Accessories', 'Office Supplies', 'Shopwave Choice Products', 'Baby Products', 'Outdoor Gear']
      },
      {
        name: 'Customizable',
        subcategories: ['Drinkware', 'Kitchen Items', 'Gift Hampers', 'Accessories', 'Jewelry', 'Personalized Gifts', 'Custom Prints', 'Photo Products', 'Mugs & Bottles', 'T-Shirts', 'Keychains', 'Phone Cases', 'Notebooks', 'Calendars', 'Photo Frames', 'Cushions', 'Bags & Pouches', 'Stickers', 'Magnets', 'Badges']
      }
    ]

    // Merge database categories with defaults
    const finalCategories = defaultCategories.map(defaultCat => {
      const dbCat = categories.find(cat => cat.name === defaultCat.name)
      if (dbCat) {
        // Merge subcategories from both sources
        const allSubcategories = [...new Set([...defaultCat.subcategories, ...dbCat.subcategories])]
        return { ...defaultCat, subcategories: allSubcategories.sort() }
      }
      return defaultCat
    })

    const response = NextResponse.json({
      success: true,
      categories: finalCategories
    })
    
    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response

  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // Return fallback categories on error
    const fallbackResponse = NextResponse.json({
      success: true,
      categories: [
        {
          name: 'Tech',
          subcategories: ['Wearable Devices', 'Headphones', 'Watches', 'Computer Accessories', 'Mobile Accessories']
        },
        {
          name: 'Home',
          subcategories: ['Kitchen Storage & Container', 'Water Jugs', 'Kitchen Tools', 'Glassware']
        },
        {
          name: 'New Arrivals', 
          subcategories: ['Shopwave', 'Just Arrived', 'Best Seller', 'Latest Gadgets']
        },
        {
          name: 'Customizable',
          subcategories: ['Drinkware', 'Kitchen Items', 'Accessories', 'Jewelry']
        }
      ]
    })
    
    fallbackResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    fallbackResponse.headers.set('Pragma', 'no-cache')
    fallbackResponse.headers.set('Expires', '0')
    
    return fallbackResponse
  }
}
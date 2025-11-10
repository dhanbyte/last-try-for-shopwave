const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dhananjayverma2003:dhananjay2003@cluster0.aqhqy.mongodb.net/shopwave?retryWrites=true&w=majority';

// Product schema
const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: String,
  description: { type: String, required: true },
  shortDescription: String,
  price: {
    original: { type: Number, required: true },
    discounted: Number,
    currency: { type: String, default: '₹' }
  },
  image: { type: String, required: true },
  extraImages: [String],
  video: String,
  category: { type: String, required: true },
  subcategory: String,
  tertiaryCategory: String,
  tags: [String],
  features: [String],
  specifications: mongoose.Schema.Types.Mixed,
  quantity: { type: Number, default: 0 },
  weight: { type: Number },
  sku: String,
  shippingCost: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 18 },
  inventory: {
    inStock: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 }
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  status: { type: String, enum: ['active', 'inactive', 'out_of_stock', 'discontinued'], default: 'active' },
  returnPolicy: {
    eligible: { type: Boolean, default: true },
    duration: { type: Number, default: 7 }
  },
  warranty: { type: String, default: '1 Year Warranty' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Product = mongoose.model('Product', productSchema);

// Load product data from JSON files
function loadProductData() {
  const techPath = path.join(__dirname, 'src', 'lib', 'data', 'tech.ts');
  const homePath = path.join(__dirname, 'src', 'lib', 'data', 'home.ts');
  
  let techProducts = [];
  let homeProducts = [];
  
  try {
    // Read and parse tech products
    const techContent = fs.readFileSync(techPath, 'utf8');
    const techMatch = techContent.match(/export const TECH_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
    if (techMatch) {
      // Convert TypeScript to JSON (basic conversion)
      const techJson = techMatch[1]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,(\s*[}\]])/g, '$1');
      techProducts = JSON.parse(techJson);
    }
    
    // Read and parse home products
    const homeContent = fs.readFileSync(homePath, 'utf8');
    const homeMatch = homeContent.match(/export const HOME_PRODUCTS: Product\[\] = (\[[\s\S]*?\]);/);
    if (homeMatch) {
      const homeJson = homeMatch[1]
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,(\s*[}\]])/g, '$1');
      homeProducts = JSON.parse(homeJson);
    }
  } catch (error) {
    console.error('Error loading product data:', error);
    return [];
  }
  
  // Filter out fashion products and return only tech, home, newArrivals, customizable
  const allProducts = [...techProducts, ...homeProducts];
  return allProducts.filter(product => 
    product.category && 
    !product.category.toLowerCase().includes('fashion')
  );
}

async function populateProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Load products from JSON files
    const products = loadProductData();
    console.log(`Loaded ${products.length} products from JSON files`);
    
    if (products.length === 0) {
      console.log('No products to populate');
      return;
    }
    
    // Clear existing products (optional - remove this if you want to keep existing data)
    // await Product.deleteMany({});
    // console.log('Cleared existing products');
    
    // Transform and insert products
    const transformedProducts = products.map(product => ({
      slug: product.slug || product.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || product.id,
      name: product.name,
      brand: product.brand,
      description: product.description || product.shortDescription || 'No description available',
      shortDescription: product.shortDescription,
      price: {
        original: product.price?.original || product.price?.discounted || 0,
        discounted: product.price?.discounted,
        currency: product.price?.currency || '₹'
      },
      image: product.image,
      extraImages: product.extraImages || [],
      category: product.category,
      subcategory: product.subcategory,
      tertiaryCategory: product.tertiaryCategory,
      features: product.features || [],
      specifications: product.specifications || {},
      quantity: product.quantity || 100,
      sku: product.sku,
      taxPercent: product.taxPercent || 18,
      ratings: {
        average: product.ratings?.average || 0,
        count: product.ratings?.count || 0
      },
      status: 'active'
    }));
    
    // Insert products with upsert to avoid duplicates
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const product of transformedProducts) {
      try {
        const result = await Product.findOneAndUpdate(
          { slug: product.slug },
          product,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        if (result.isNew) {
          insertedCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error inserting product ${product.name}:`, error.message);
      }
    }
    
    console.log(`Successfully processed ${transformedProducts.length} products`);
    console.log(`Inserted: ${insertedCount}, Updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('Error populating products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
populateProducts();

import Fuse from 'fuse.js'
import type { Product } from './types'

export const liveSearch = (q: string, products: Product[]) => {
  if (!q.trim()) return []
  // Filter out Ayurvedic products from search
  const filteredProducts = products.filter(p => 
    p.category !== 'Ayurvedic' && 
    p.subcategory !== 'Ayurvedic' &&
    !p.name?.toLowerCase().includes('ayurvedic')
  )
  const fuse = new Fuse(filteredProducts, { keys: ['name','brand','category','tags'], includeScore: true, threshold: 0.4 })
  return fuse.search(q).slice(0, 8).map(r => r.item)
}

export const filterProducts = (products: Product[], opts: { q?: string; category?: string; subcategory?:string; tertiaryCategory?:string; min?: number; max?: number; brand?: string; rating?: number; sort?: 'new'|'priceAsc'|'priceDesc'|'popular' }) => {
  // Remove duplicates based on product ID first
  const uniqueProducts = products.filter((product, index, self) => 
    index === self.findIndex(p => p.id === product.id)
  );
  
  let list = [...uniqueProducts]
  
  // Custom sort to push out-of-stock items to the end first
  list.sort((a, b) => {
    const aInStock = (a.quantity > 0 || a.stock > 0) ? 1 : 0;
    const bInStock = (b.quantity > 0 || b.stock > 0) ? 1 : 0;
    return bInStock - aInStock;
  });

  if (opts.q) {
    const fuse = new Fuse(products, { keys: ['name','brand','category','tags'], threshold: 0.4 });
    list = fuse.search(opts.q).map(result => result.item);
  }

  // Handle category filtering
  if (opts.category && opts.category !== 'All') {
    // Decode URL encoded category names
    const decodedCategory = decodeURIComponent(opts.category);
    
    if (decodedCategory === 'Pooja') {
      // Special case for "Pooja" to include items from both categories
      list = list.filter(p => 
        p.category === 'Pooja' || 
        p.subcategory === 'Puja-Essentials' ||
        (p.category === 'Home' && p.subcategory === 'Puja-Essentials')
      );
    } else if (decodedCategory === 'Food & Drinks') {
      // Handle Food & Drinks category
      list = list.filter(p => p.category === 'Food & Drinks');
    } else if (decodedCategory === 'Groceries') {
      // Handle Groceries - include Food & Drinks and Ayurvedic products
      list = list.filter(p => p.category === 'Food & Drinks' || p.category === 'Ayurvedic');
    } else if (decodedCategory === 'New Arrivals') {
      // Handle New Arrivals - only include products with category 'New Arrivals'
      list = list.filter(p => p.category === 'New Arrivals');
    } else {
      list = list.filter(p => p.category === decodedCategory);
    }
  }
  
  if (opts.subcategory) {
    const subcategory = decodeURIComponent(opts.subcategory);
    // Handle special cases for subcategory searches
    if (subcategory.toLowerCase() === 'fans') {
      // Search for fan-related products in name or subcategory
      list = list.filter(p => 
        p.name?.toLowerCase().includes('fan') ||
        p.name?.toLowerCase().includes('cooling') ||
        p.name?.toLowerCase().includes('cooler') ||
        p.subcategory?.toLowerCase().includes('fan')
      );
    } else if (subcategory === 'Pooja Essentials') {
      // Special case for Pooja Essentials - include from both Pooja category and Home category Puja-Essentials
      list = list.filter(p => 
        p.subcategory === 'Pooja Essentials' || 
        p.subcategory === 'Puja-Essentials' ||
        (p.category === 'Home' && p.subcategory === 'Puja-Essentials')
      );
    } else {
      // Exact subcategory match
      list = list.filter(p => p.subcategory === subcategory);
    }
  }
  if (opts.tertiaryCategory) list = list.filter(p => p.tertiaryCategory === opts.tertiaryCategory)
  if (opts.brand) list = list.filter(p => p.brand === opts.brand)
  if (opts.rating) list = list.filter(p => (p.ratings?.average ?? 0) >= opts.rating!)
  if (typeof opts.min === 'number') list = list.filter(p => (p.price?.discounted ?? p.price_discounted ?? p.price?.original ?? p.price_original ?? 0) >= opts.min!)
  if (typeof opts.max === 'number') list = list.filter(p => (p.price?.discounted ?? p.price_discounted ?? p.price?.original ?? p.price_original ?? 0) <= opts.max!)
  
  // Further sorting on the (now stock-sorted) list
  switch (opts.sort) {
    case 'priceAsc': list.sort((a,b) => (a.price?.discounted ?? a.price_discounted ?? a.price?.original ?? a.price_original ?? 0) - (b.price?.discounted ?? b.price_discounted ?? b.price?.original ?? b.price_original ?? 0)); break
    case 'priceDesc': list.sort((a,b) => (b.price?.discounted ?? b.price_discounted ?? b.price?.original ?? b.price_original ?? 0) - (a.price?.discounted ?? a.price_discounted ?? a.price?.original ?? a.price_original ?? 0)); break
    case 'popular': list.sort((a,b) => (b.ratings?.count ?? 0) - (a.ratings?.count ?? 0)); break;
    // case 'new': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    default: break
  }
  
  // Re-apply stock sorting to preserve it after other sorts
  list.sort((a, b) => {
    const aInStock = (a.quantity > 0 || a.stock > 0) ? 1 : 0;
    const bInStock = (b.quantity > 0 || b.stock > 0) ? 1 : 0;
    return bInStock - aInStock;
  });

  return list
}

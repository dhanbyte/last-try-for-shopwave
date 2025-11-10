
'use client';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import BannerSlider from '../components/BannerSlider';
import SafeProductCard from '../components/SafeProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from '../components/ui/carousel'
import OfferCard from '../components/OfferCard';
import type { Product } from '../lib/types';

import { useProductStore } from '../lib/productStore';
import { NEWARRIVALS_PRODUCTS } from '../lib/data/newarrivals';
import { FASHION_PRODUCTS } from '../lib/data/fashion';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import MixedProductGrid from '../components/MixedProductGrid';
import { useToast } from '../hooks/use-toast';
import BusinessOpportunityBanner from '../components/BusinessOpportunityBanner';
import FashionCatalog from '../components/FashionCatalog';
import ModernFashionCategories from '../components/ModernFashionCategories';
import { MessageCircle, Users } from 'lucide-react';





const filterCategories = ['All', 'Electronics', 'Home', 'Fashion', 'New Arrivals', 'Customizable'];
const PRODUCTS_TO_SHOW = 8;
const VISIBLE_COUNT_KEY = 'home_visible_count';
const SELECTED_CATEGORY_KEY = 'home_selected_category';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { products, isLoading, init } = useProductStore();
  
  // Ensure products are loaded
  useEffect(() => {
    if (!products.length && !isLoading) {
      console.log('Initializing products...');
      init();
    }
  }, [products.length, isLoading, init]);
  
  useEffect(() => {
    console.log('Homepage products loaded:', products.length);
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
  }, [products]);
  const { toast } = useToast();
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_TO_SHOW);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [api, setApi] = useState<CarouselApi>();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const savedVisibleCount = localStorage.getItem(VISIBLE_COUNT_KEY);
    const savedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY);

    if (savedVisibleCount) {
      setVisibleCount(parseInt(savedVisibleCount, 10));
    }
    if (savedCategory) {
      setSelectedCategory(savedCategory);
    }
  }, []);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const refCode = urlParams.get('ref')

    if (refCode) {
      toast({
        title: "Referral Link Detected!",
        description: `Use code ${refCode} at checkout for 5% discount`,
      })

      // Clean URL
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [toast])





  const techDeals = useMemo(() => {
    return products.filter(p => (p.category === 'Tech' || p.category === 'Electronics') && p.quantity > 0);
  }, [products]);

  const homeDeals = useMemo(() => {
    return products.filter(p => p.category === 'Home' && p.quantity > 0);
  }, [products]);

  const newArrivals = useMemo(() => {
    const apiNewArrivals = products.filter(p => p.category === 'New Arrivals' && p.quantity > 0);
    const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
    return [...apiNewArrivals, ...jsonNewArrivals];
  }, [products]);

  const fashionDeals = useMemo(() => {
    const apiFashion = products.filter(
      (p) => p.category === 'Fashion' && ((p.quantity ?? 0) > 0 || (p.stock ?? 0) > 0)
    );
    const jsonFashion = FASHION_PRODUCTS.filter(p => p.quantity > 0);
    return [...apiFashion, ...jsonFashion];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const inStockProducts = products.filter(p => p.quantity > 0);
    if (selectedCategory === 'All') {
      return [...inStockProducts, ...FASHION_PRODUCTS.filter(p => p.quantity > 0)];
    }
    if (selectedCategory === 'Electronics') {
      return inStockProducts.filter(p => p.category === 'Electronics' || p.category === 'Tech');
    }
    if (selectedCategory === 'New Arrivals') {
      const apiNewArrivals = inStockProducts.filter(p => p.category === 'New Arrivals');
      const jsonNewArrivals = NEWARRIVALS_PRODUCTS.filter(p => p.quantity > 0);
      return [...apiNewArrivals, ...jsonNewArrivals];
    }
    if (selectedCategory === 'Fashion') {
      const apiFashion = inStockProducts.filter(p => p.category === 'Fashion');
      const jsonFashion = FASHION_PRODUCTS.filter(p => p.quantity > 0);
      return [...apiFashion, ...jsonFashion];
    }
    if (selectedCategory === 'Customizable') {
      return inStockProducts.filter(p => p.category === 'Customizable');
    }
    return inStockProducts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(PRODUCTS_TO_SHOW);
    localStorage.setItem(SELECTED_CATEGORY_KEY, category);
    localStorage.setItem(VISIBLE_COUNT_KEY, PRODUCTS_TO_SHOW.toString());
  };

  const loadMoreProducts = useCallback(() => {
    if (isLoadingMore || visibleCount >= filteredProducts.length) return;
    
    setIsLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const newCount = visibleCount + PRODUCTS_TO_SHOW;
      setVisibleCount(newCount);
      localStorage.setItem(VISIBLE_COUNT_KEY, newCount.toString());
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, visibleCount, filteredProducts.length]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMoreProducts, visibleCount, filteredProducts.length]);



  if (!mounted) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "ShopWave",
              "alternateName": "Shop Wave",
              "description": "ShopWave - India's #1 online shopping destination! Cheapest prices guaranteed, free delivery, 50% off deals on tech accessories, home essentials & ayurvedic products across India.",
              "url": "/",
              "telephone": "+91-91574-99884",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IN"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "ShopWave Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Tech Accessories",
                      "category": "Electronics"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Home & Kitchen",
                      "category": "Home & Garden"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Ayurvedic Products",
                      "category": "Health & Beauty"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      <div className="space-y-8">
      <BannerSlider />



      <section>
        <div className="grid grid-cols-4 gap-2 md:gap-3">
            <Link href="/search?category=Tech" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/01_0748acd3-4797-400f-997d-6cecf6b22f5a.webp?updatedAt=1756628128432" alt="Tech" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="tech gadgets" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Tech Accessories</h3>
                </div>
            </Link>
            <Link href="/search?category=Home" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp" alt="Home" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="modern living room" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Home & Kitchen</h3>
                </div>
            </Link>
            <Link href="/search?category=Fashion" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400" alt="Fashion" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="fashion clothing" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">Fashion</h3>
                </div>
            </Link>
            <Link href="/search?category=New%20Arrivals" className="relative block h-20 md:h-48 overflow-hidden rounded-lg md:rounded-xl group">
                <Image src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp" alt="New Arrivals" fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="new arrivals shopping" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center p-1 md:p-2">
                    <h3 className="text-xs md:text-md font-bold text-white text-center">New Arrivals</h3>
                </div>
            </Link>
        </div>
      </section>



      <section id="tech-offers">
        <h2 className="text-2xl font-bold mb-4 text-center">Top Offers</h2>
         <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Mobile Accessories" products={techDeals} href="/search?subcategory=Accessories"/></CarouselItem>
            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Kitchen Tools" products={homeDeals} href="/search?subcategory=Kitchen%20Tools"/></CarouselItem>

            <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="LED Lights" products={newArrivals} href="/search?subcategory=LED%20Lights"/></CarouselItem>
          </CarouselContent>

        </Carousel>
      </section>



      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">Shop by Category</h2>

        <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
          {(() => {
            // Count products by subcategory
            const subcategoryCounts = {};
            const subcategoryImages = {
              'Accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
              'Computer Accessories': 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=300&q=80',
              'Audio': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80',
              'LED Lights': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
              'Cables & Chargers': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&q=80',
              'Kitchenware': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
              'Best Selling': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80',
              'Puja-Essentials': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80',
              'Bathroom-Accessories': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300&q=80',
              'Decor & Lighting': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
              'Outdoor Lighting': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
              'Car Accessories': 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=300&q=80',
              'Home Appliances': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
              'Kitchen Appliances': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
              'Household-Appliances': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80',
              'Kitchen Tools': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
              'Storage & Organization': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
              'Baking Tools': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
              'Food Storage': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80',
              'Drinkware': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80',
              'Men': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80',
              'Photo Frames': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=300&q=80',
              'Gifts': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&q=80',
              'Showpieces': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&q=80',
              'Table Lamps': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80'
            };
            
            const subcategoryLabels = {
              'Best Selling': 'Trending',
              'Women': 'Women',
              'Kitchen Storage & Container': 'Storage',
              'Kitchenware': 'Kitchen',
              'Accessories': 'Mobile',
              'Lunch Box & Tiffin': 'Lunch Box',
              'Drinkware': 'Drinks',
              'Shopwave': 'Shopwave',
              'Kitchen Tools': 'Tools',
              'Viral Gadget': 'Viral',
              'Mobile Chargers': 'Chargers',
              'Kitchen Basket & Bowl': 'Bowls',
              'Glassware': 'Glass',
              'Bathroom Accessories': 'Bathroom',
              'Spice Rack & Box': 'Spices',
              'Speakers': 'Speakers',
              'Water Jugs': 'Jugs',
              'Jewelry': 'Jewelry',
              'Water Bottles': 'Bottles',
              'Computer Accessories': 'Computer',
              'Audio': 'Audio',
              'LED Lights': 'LED',
              'Cables & Chargers': 'Cables',
              'Puja-Essentials': 'Puja',
              'Decor & Lighting': 'Decor',
              'Car Accessories': 'Car',
              'Photo Frames': 'Frames',
              'Gifts': 'Gifts'
            };
            
            // Count products from all sources
            [...products, ...NEWARRIVALS_PRODUCTS, ...FASHION_PRODUCTS].forEach(product => {
              if (product.subcategory && product.quantity > 0) {
                subcategoryCounts[product.subcategory] = (subcategoryCounts[product.subcategory] || 0) + 1;
              }
            });
            
            // Sort by count and take top 20
            const topSubcategories = Object.entries(subcategoryCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 20)
              .map(([subcategory]) => subcategory);
            
            return topSubcategories.map((subcategory, index) => {
              // Find a product from this subcategory to use its image
              const productFromCategory = [...products, ...NEWARRIVALS_PRODUCTS, ...FASHION_PRODUCTS]
                .find(p => p.subcategory === subcategory && p.image && p.quantity > 0);
              
              // Special image for Women category
              let image;
              if (subcategory === 'Women') {
                image = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&q=80';
              } else {
                image = productFromCategory?.image || subcategoryImages[subcategory] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300';
              }
              const label = subcategoryLabels[subcategory] || subcategory;
              const isHidden = index >= 10 ? 'hidden md:block' : '';
              
              // Special handling for Women category
              const href = subcategory === 'Women' 
                ? `/search?category=Fashion&subcategory=${encodeURIComponent(subcategory)}`
                : `/search?subcategory=${encodeURIComponent(subcategory)}`;
              
              return (
                <Link key={subcategory} href={href} className={`block text-center ${isHidden}`}>
                  <div className="relative w-full mx-auto mb-2 aspect-square overflow-hidden rounded-lg shadow-sm bg-gray-100">
                    <Image 
                      src={image} 
                      alt={subcategory} 
                      fill 
                      loading="lazy" 
                      className="object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&q=80';
                      }}
                    />
                  </div>
                  <h4 className="text-xs md:text-sm font-bold text-gray-800 leading-tight text-center">{label}</h4>
                </Link>
              );
            });
          })()} 
        </div>
      </section>



      {/* Electronics Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">📱 Electronics</h2>
          <Link href="/search?category=Tech" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {techDeals.map((product, index) => (
              <div key={`tech-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Home Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">🏠 Home & Kitchen</h2>
          <Link href="/search?category=Home" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {homeDeals.map((product, index) => (
              <div key={`home-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fashion Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">👕 Fashion</h2>
          <Link href="/search?category=Fashion" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {fashionDeals.map((product, index) => (
              <div key={`fashion-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">✨ New Arrivals</h2>
          <Link href="/new-arrivals" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {newArrivals.map((product, index) => (
              <div key={`new-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customizable Products Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">🎨 Custom Products</h2>
          <Link href="/search?category=Customizable" className="flex items-center text-sm text-brand hover:underline">
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto px-4">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {products.filter(p => p.category === 'Customizable' && p.quantity > 0).map((product, index) => (
              <div key={`custom-${product.id}-${index}`} className="flex-shrink-0 w-32 md:w-48">
                <SafeProductCard p={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Price Section */}
      {/* <section className="mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 px-4">💰 Explore Our Prices</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3 px-4">
          <Link href="/search?maxPrice=49" className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹49</div>
            <div className="text-xs opacity-90">Under ₹49</div>
          </Link>
          <Link href="/search?maxPrice=99" className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹99</div>
            <div className="text-xs opacity-90">Under ₹99</div>
          </Link>
          <Link href="/search?maxPrice=299" className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹299</div>
            <div className="text-xs opacity-90">Under ₹299</div>
          </Link>
          <Link href="/search?maxPrice=399" className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹399</div>
            <div className="text-xs opacity-90">Under ₹399</div>
          </Link>
          <Link href="/search?maxPrice=499" className="bg-gradient-to-r from-red-400 to-red-500 text-white p-4 rounded-lg text-center hover:shadow-md transition-shadow">
            <div className="text-lg font-bold">₹499</div>
            <div className="text-xs opacity-90">Under ₹499</div>
          </Link>
        </div>
      </section>

      {/* All Products Section */}
 



      <BusinessOpportunityBanner />

    </div>
    </>
  );
}

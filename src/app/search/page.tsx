

'use client'
import { useMemo, Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';
import { filterProducts } from '@/lib/search'
import Filters from '@/components/Filters'
import SortBar from '@/components/SortBar'
import ProductCard from '@/components/ProductCard'
import CategoryPills from '@/components/CategoryPills'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Filter, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CategoryGrid from '@/components/CategoryGrid';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/lib/productStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FASHION_PRODUCTS } from '@/lib/data/fashion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import OfferCard from '@/components/OfferCard';

type CategorySummary = {
  name: string
  href: string
  image: string
  price?: number
  discount?: number
  dataAiHint?: string
}

const techCategories = [
  { name: 'Accessories', href: '/search?category=Tech&subcategory=Accessories', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166', dataAiHint: 'mobile accessories' },
  { name: 'Decor & Lighting', href: '/search?category=Tech&subcategory=Decor%20%26%20Lighting', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441', dataAiHint: 'decor lighting' },
  { name: 'Audio', href: '/search?category=Tech&subcategory=Audio', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606', dataAiHint: 'audio speakers' },
  { name: 'Computer Accessories', href: '/search?category=Tech&subcategory=Computer%20Accessories', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp', dataAiHint: 'computer accessories' },
  { name: 'Outdoor Lighting', href: '/search?category=Tech&subcategory=Outdoor%20Lighting', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/5f7e872992d2b507f33f68da-9-large_0e2c40e8-8e9c-426a-b98c-968cddb10225.avif', dataAiHint: 'outdoor lighting' },
];

const homeCategories = [
    { name: 'Puja-Essentials', href: '/search?category=Home&subcategory=Puja-Essentials', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/Pooja%20Essential%20Pooja%20Essentials/1/1.webp?updatedAt=1756551012208', dataAiHint: 'puja essentials' },
    { name: 'Bathroom-Accessories', href: '/search?category=Home&subcategory=Bathroom-Accessories', image: 'https://Shopwave.b-cdn.net/puja%20photos/e7f464c4-3c4f-4b07-82f4-e4d1eee94930_1.b3569a78f0f854174520dbe2b1ef52d8.webp', dataAiHint: 'bathroom accessories' },
    { name: 'Kitchenware', href: '/search?category=Home&subcategory=Kitchenware', image: 'https://Shopwave.b-cdn.net/Homekichan/01_a4e3c239-73ae-4939-8b28-aa03ed6f760f.webp', dataAiHint: 'kitchenware' },
    { name: 'Household-Appliances', href: '/search?category=Home&subcategory=Household-Appliances', image: 'https://Shopwave.b-cdn.net/Homekichan/02_13a215dc-07e6-4d05-98bc-dd30f55e92dc.webp', dataAiHint: 'household appliances' },
    { name: 'Food Storage', href: '/search?category=Home&subcategory=Food%20Storage', image: 'https://Shopwave.b-cdn.net/Eltronicpart-2/storage-box-02.webp', dataAiHint: 'food storage' },
    { name: 'Drinkware', href: '/search?category=Home&subcategory=Drinkware', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/Tumbler-04_8520f518-fd21-4ca9-98f2-149e361dda36.webp?updatedAt=1757179631247', dataAiHint: 'drinkware' },
    { name: 'Kitchen Tools', href: '/search?category=Home&subcategory=Kitchen%20Tools', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515', dataAiHint: 'kitchen tools' },
    { name: 'Storage & Organization', href: '/search?category=Home&subcategory=Storage%20%26%20Organization', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/06_d748bf1f-ff1c-42fe-9c83-826bd1544147.avif?updatedAt=1757139337543', dataAiHint: 'storage organization' },
    { name: 'Baking Tools', href: '/search?category=Home&subcategory=Baking%20Tools', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/7636fc2e-a31a-4ba5-bd9a-d985e02e1f0f_f44e78eb-ccad-4b77-9eb4-3ef45c19b93d.webp', dataAiHint: 'baking tools' },
];

const newArrivalsSubCategories = [
  { name: 'diwali Special', href: '/search?category=New%20Arrivals&subcategory=diwali%20Special', image: 'https://ik.imagekit.io/b5qewhvhb/WhatsApp%20Image%202025-09-22%20at%2017.55.22_ee418f7e.jpg', dataAiHint: 'diwali special' },
  { name: 'Gifts', href: '/search?category=New%20Arrivals&subcategory=Gifts', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp', dataAiHint: 'gifts' },
  { name: 'Car Accessories', href: '/search?category=New%20Arrivals&subcategory=Car%20Accessories', image: 'https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp', dataAiHint: 'car accessories' },
  { name: 'Kitchen Appliances', href: '/search?category=New%20Arrivals&subcategory=Kitchen%20Appliances', image: 'https://Shopwave.b-cdn.net/new%20arival/17865..1.webp', dataAiHint: 'kitchen appliances' },
  { name: 'Home Appliances', href: '/search?category=New%20Arrivals&subcategory=Home%20Appliances', image: 'https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp', dataAiHint: 'home appliances' },
  { name: 'Cleaning Tools', href: '/search?category=New%20Arrivals&subcategory=Cleaning%20Tools', image: 'https://Shopwave.b-cdn.net/new%20arival/609b820c1ce70f90287cc903-large_1_c7125055-2828-46c0-b762-d19bfcdf24ea.webp', dataAiHint: 'cleaning tools' },
  { name: 'Health & Personal Care', href: '/search?category=New%20Arrivals&subcategory=Health%20%26%20Personal%20Care', image: 'https://Shopwave.b-cdn.net/new%20arival/01_c87acdae-de5c-49b0-80e0-5e1af7ed7fa5.webp', dataAiHint: 'health care' },
  { name: 'Cables & Chargers', href: '/search?category=New%20Arrivals&subcategory=Cables%20%26%20Chargers', image: 'https://Shopwave.b-cdn.net/new%20arival/02_71c68310-5be0-4fac-97e3-de92ea6df361.webp', dataAiHint: 'cables chargers' },
  { name: 'Home Organization', href: '/search?category=New%20Arrivals&subcategory=Home%20Organization', image: 'https://Shopwave.b-cdn.net/new%20arival/07_24b9ce72-1c0c-4c5b-bf59-99fefbaa0619.webp', dataAiHint: 'home organization' },
  { name: 'LED Lights', href: '/search?category=New%20Arrivals&subcategory=LED%20Lights', image: 'https://Shopwave.b-cdn.net/new%20arival/Crystal-Ball-Lamp-01_0069f489-bb55-4c74-b7d9-744a6a42123a.webp', dataAiHint: 'led lights' },
  { name: 'Table Lamps', href: '/search?category=New%20Arrivals&subcategory=Table%20Lamps', image: 'https://Shopwave.b-cdn.net/new%20arival/Crystal-Ball-Lamp-03_7b9c5da7-e695-4ee6-aeae-4ac590929bcf.webp', dataAiHint: 'table lamps' },
  { name: 'Photo Frames', href: '/search?category=New%20Arrivals&subcategory=Photo%20Frames', image: 'https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166', dataAiHint: 'photo frames' },
];

const poojaSubCategories = [
    { name: 'Dhoop', href: '/search?category=Pooja&subcategory=Dhoop', image: 'https://images.unsplash.com/photo-1604543213568-963e6e8a4947?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense dhoop' },
    { name: 'Agarbatti', href: '/search?category=Pooja&subcategory=Agarbatti', image: 'https://images.unsplash.com/photo-1596701878278-2de47143b4eb?q=80&w=800&auto=format&fit=crop', dataAiHint: 'incense sticks' },
    { name: 'Aasan and Mala', href: '/search?category=Pooja&subcategory=Aasan%20and%20Mala', image: 'https://images.unsplash.com/photo-1616836109961-c8a74e5b2e5e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'prayer beads' },
    { name: 'Photo Frame', href: '/search?category=Pooja&subcategory=Photo%20Frame', image: 'https://images.unsplash.com/photo-1579541620958-c6996119565e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'photo frame' },
];

const foodAndDrinksCategories = [
  { name: 'Beverages', href: '/search?category=Food%20%26%20Drinks&subcategory=Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy beverages' },
  { name: 'Dry Fruits', href: '/search?category=Food%20%26%20Drinks&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
  { name: 'Healthy Juice', href: '/search?category=Food%20%26%20Drinks&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1578852632225-17a4c48a472c?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy juices' },
];

const groceriesCategories = [
  { name: 'Beverages', href: '/search?category=Groceries&subcategory=Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy beverages' },
  { name: 'Dry Fruits', href: '/search?category=Groceries&subcategory=Dry%20Fruits', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'premium dry fruits' },
  { name: 'Healthy Juice', href: '/search?category=Groceries&subcategory=Healthy%20Juice', image: 'https://images.unsplash.com/photo-1578852632225-17a4c48a472c?q=80&w=800&auto=format&fit=crop', dataAiHint: 'healthy juices' },
];

const fashionMainCategories = [
  { name: 'Men', href: '/search?category=Fashion&subcategory=Men', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', dataAiHint: 'mens fashion' },
  { name: 'Women', href: '/search?category=Fashion&subcategory=Women', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', dataAiHint: 'womens fashion' },
  { name: 'Kids', href: '/search?category=Fashion&subcategory=Kids', image: 'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400', dataAiHint: 'kids fashion' },
  { name: 'Accessories', href: '/search?category=Fashion&subcategory=Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', dataAiHint: 'accessories' },
];

const fashionCategories = [
  { name: 'T-Shirts', href: '/search?category=Fashion&subcategory=T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', dataAiHint: 't-shirts' },
  { name: 'Jeans', href: '/search?category=Fashion&subcategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', dataAiHint: 'jeans' },
  { name: 'Shirts', href: '/search?category=Fashion&subcategory=Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', dataAiHint: 'shirts' },
  { name: 'Dresses', href: '/search?category=Fashion&subcategory=Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300', dataAiHint: 'dresses' },
  { name: 'Shoes', href: '/search?category=Fashion&subcategory=Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300', dataAiHint: 'shoes' },
  { name: 'Accessories', href: '/search?category=Fashion&subcategory=Accessories', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300', dataAiHint: 'accessories' },
];

function CategoryHeader({
  title,
  description,
  linkText,
  bannerImages,
  categories,
  bannerColor = 'bg-gray-100',
  buttonColor = 'bg-primary',
}: {
  title: string
  description: string
  linkText: string
  bannerImages: string[]
  categories?: CategorySummary[]
  bannerColor?: string
  buttonColor?: string
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (bannerImages.length === 0) return;

        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => {
                // Instead of cycling back to 0, pause at the last image
                if (prevIndex >= bannerImages.length - 1) {
                    return prevIndex; // Stay at last image
                }
                return prevIndex + 1;
            });
        }, 4000); // Increased interval to 4 seconds for better viewing

        return () => clearInterval(timer);
    }, [bannerImages.length]);

    // Only show if we have banner images
    if (bannerImages.length === 0) return null;

    return (
        <div className="space-y-8 mb-8">
            <section>
                <div className={cn("relative overflow-hidden rounded-2xl p-4 md:py-2 md:px-6", bannerColor)}>
                    <div className="grid md:grid-cols-2 gap-6 items-center">
                        <div className="text-center md:text-left z-10">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{title}</h1>
                            <p className="mt-2 text-sm md:text-base text-gray-600 max-w-md mx-auto md:mx-0">{description}</p>
                            <Button asChild className={cn("mt-4 text-white px-6 py-2 rounded-lg font-semibold transition-colors", buttonColor)}>
                                <Link href="#product-grid">
                                    {linkText}
                                </Link>
                            </Button>
                        </div>
                        <div className="relative h-32 md:h-40">
                            <AnimatePresence initial={false} mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                    className="absolute inset-0"
                                >
                                    {bannerImages[currentImageIndex] && (
                                        <Image
                                            src={bannerImages[currentImageIndex]}
                                            alt={`Banner ${currentImageIndex + 1}`}
                                            fill
                                            className="object-cover rounded-lg shadow-lg"
                                            priority={currentImageIndex === 0}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Progress indicators */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {bannerImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            index === currentImageIndex
                                                ? "bg-white shadow-lg scale-125"
                                                : "bg-white/50 hover:bg-white/75"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {categories && <CategoryGrid categories={categories} buttonColor={buttonColor} />}
        </div>
    );
}

function SearchContent() {
  const sp = useSearchParams()
  const router = useRouter()
  const { products, isLoading } = useProductStore();
  const [isFilterOpen, setFilterOpen] = useState(false)
  const [isFilterVisible, setIsFilterVisible] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opts = {
    q: sp.get('query') || undefined,
    category: sp.get('category') || undefined,
    subcategory: sp.get('subcategory') || undefined,
    tertiaryCategory: sp.get('tertiaryCategory') || undefined,
    min: sp.get('min') ? Number(sp.get('min')) : undefined,
    max: sp.get('max') ? Number(sp.get('max')) : sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
    brand: sp.get('brand') || undefined,
    rating: sp.get('rating') ? Number(sp.get('rating')) : undefined,
    sort: (sp.get('sort') as any) || undefined,
  }
  
  const list = useMemo(() => {
    try {
      // Combine API products with Fashion products
      const allProducts = [...products, ...FASHION_PRODUCTS.filter(p => p.quantity > 0)];
      return filterProducts(allProducts, opts);
    } catch (err) {
      console.error('Error filtering products:', err);
      setError('Failed to load products. Please try again.');
      return [];
    }
  }, [products, sp])

  const bestSellers = useMemo(() => {
    try {
      if (!products || products.length === 0) return [];
      
      // Get unique products by creating a Map with id as key
      const uniqueProductsMap = new Map();
      products.forEach(p => {
        if (p && p.id && p.quantity > 0 && !uniqueProductsMap.has(p.id)) {
          uniqueProductsMap.set(p.id, p);
        }
      });
      
      // Convert back to array and get diverse products
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      
      // Sort by ratings and popularity, then shuffle for variety
      const sortedProducts = uniqueProducts
        .sort((a, b) => {
          const aRating = (a.ratings?.average || 0) * (a.ratings?.count || 0);
          const bRating = (b.ratings?.average || 0) * (b.ratings?.count || 0);
          return bRating - aRating;
        })
        .slice(0, 50); // Get top 50 rated products
      
      // Shuffle and return 24 products
      const shuffled = [...sortedProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 24);
    } catch (err) {
      console.error('Error processing best sellers:', err);
      return [];
    }
  }, [products]);
  
  const mobileAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mobile') || p.name.toLowerCase().includes('phone') || p.name.toLowerCase().includes('stand'))).slice(0, 8);
  }, [products]);
  
  const fansAndCooling = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('fan') || p.name.toLowerCase().includes('cooling') || p.name.toLowerCase().includes('cooler'))).slice(0, 8);
  }, [products]);
  
  const audioProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('headphone') || p.name.toLowerCase().includes('audio') || p.name.toLowerCase().includes('speaker'))).slice(0, 8);
  }, [products]);
  
  const lightingProducts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('light') || p.name.toLowerCase().includes('led') || p.name.toLowerCase().includes('bulb'))).slice(0, 8);
  }, [products]);
  
  const computerAccessories = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('mouse') || p.name.toLowerCase().includes('computer') || p.name.toLowerCase().includes('laptop'))).slice(0, 8);
  }, [products]);
  
  const powerAndCables = useMemo(() => {
    return products.filter(p => p.quantity > 0 && (p.name.toLowerCase().includes('cable') || p.name.toLowerCase().includes('adapter') || p.name.toLowerCase().includes('charger') || p.name.toLowerCase().includes('usb'))).slice(0, 8);
  }, [products]);
  
  const allCategoryLinks = [
      { name: 'Tech', href: '/search?category=Tech', image: 'https://images.unsplash.com/photo-1550009158-94ae76552485?q=80&w=400&auto=format&fit=crop', dataAiHint: 'latest gadgets' },
      { name: 'Home', href: '/search?category=Home', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1200&auto=format&fit=crop', dataAiHint: 'stylish apparel' },
      { name: 'New Arrivals', href: '/search?category=New%20Arrivals', image: newArrivalsSubCategories[0].image, dataAiHint: 'new arrivals' },
    
      { name: 'Pooja', href: '/search?category=Pooja', image: poojaSubCategories[0]?.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center', dataAiHint: 'pooja items' },
      { name: 'Groceries', href: '/search?category=Groceries', image: 'https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=800&auto=format&fit=crop', dataAiHint: 'fresh groceries' },
  ];
  
  const renderCategoryHeader = () => {
    if (opts.q || opts.subcategory || opts.tertiaryCategory || showAllCategories) return null;

    switch (opts.category) {
        case 'New Arrivals':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Latest New Arrivals"
                      description="Discover our newest collection with special offers and trending products!"
                      linkText="Shop Now"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/WhatsApp%20Image%202025-09-22%20at%2017.55.22_ee418f7e.jpg",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_6d35b019-089f-4949-9571-7a7bd595fccd.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/01_15d3c786-e22a-4818-8a49-d1c8c6662719.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/17865..1.webp",
                          "https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp"
                      ]}
                      bannerColor="bg-purple-50"
                      buttonColor="bg-purple-600 hover:bg-purple-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top New Arrivals</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {newArrivalsSubCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                </div>
            )
        case 'Tech':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Latest in Tech"
                      description="Explore the newest gadgets and accessories to elevate your lifestyle."
                      linkText="Shop Tech"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441"
                      ]}
                      bannerColor="bg-blue-50"
                      buttonColor="bg-blue-600 hover:bg-blue-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top Tech Categories</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {techCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                  

                </div>
            );
        case 'Home':
             return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Beautiful Home & Kitchen"
                      description="Elevate your living space with our curated collection of home and kitchen accessories."
                      linkText="Shop Home & Kitchen"
                      bannerImages={[
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/7636fc2e-a31a-4ba5-bd9a-d985e02e1f0f_f44e78eb-ccad-4b77-9eb4-3ef45c19b93d.webp",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/06_d748bf1f-ff1c-42fe-9c83-826bd1544147.avif?updatedAt=1757139337543",
                          "https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/Tumbler-04_8520f518-fd21-4ca9-98f2-149e361dda36.webp?updatedAt=1757179631247",
                          "https://Shopwave.b-cdn.net/Homekichan/01_a4e3c239-73ae-4939-8b28-aa03ed6f760f.webp"
                      ]}
                      bannerColor="bg-pink-50"
                      buttonColor="bg-pink-600 hover:bg-pink-700"
                  />
                  <div>
                      <h2 className="text-2xl font-bold mb-4 text-center">Top Home Categories</h2>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {homeCategories.map((category) => (
                          <Link key={category.name} href={category.href} className="group block text-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                            <div className="relative w-16 h-16 mx-auto rounded-lg bg-gray-100 overflow-hidden transition-all duration-300 group-hover:scale-105">
                                <Image
                                  src={category.image}
                                  alt={category.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover transition-transform duration-300"
                                  data-ai-hint={category.dataAiHint}
                                />
                            </div>
                            <h3 className="mt-2 text-xs font-medium text-gray-700 group-hover:text-brand">{category.name}</h3>
                          </Link>
                        ))}
                      </div>
                  </div>
                </div>
             )
        case 'Food & Drinks':
             return null;
        case 'Pooja':
            return null;
        case 'Fashion':
            return (
                <div className="mb-8 space-y-8">
                  <CategoryHeader 
                      title="Fashion & Style"
                      description="Discover the latest trends in fashion with our curated collection of clothing and accessories."
                      linkText="Shop Fashion"
                      bannerImages={[
                          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
                          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
                          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
                          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
                          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
                      ]}
                      bannerColor="bg-rose-50"
                      buttonColor="bg-rose-600 hover:bg-rose-700"
                  />
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-4 text-center">Top Fashion Offers</h2>
                     <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-1 sm:-ml-2 md:-ml-4">
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="T-Shirts" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'T-Shirts').slice(0, 6)} href="/search?category=Fashion&subcategory=T-Shirts"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Jeans" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Jeans').slice(0, 6)} href="/search?category=Fashion&subcategory=Jeans"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Dresses" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Dresses').slice(0, 6)} href="/search?category=Fashion&subcategory=Dresses"/></CarouselItem>
                        <CarouselItem className="pl-1 sm:pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4"><OfferCard title="Shoes" products={FASHION_PRODUCTS.filter(p => p.subcategory === 'Shoes').slice(0, 6)} href="/search?category=Fashion&subcategory=Shoes"/></CarouselItem>
                      </CarouselContent>
                    </Carousel>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-8 text-center">Shop by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <Link href="/search?category=Fashion&subcategory=Men" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                            alt="Men's Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Men's Fashion</h3>
                            <p className="text-white/80 text-sm">Shirts, Jeans, T-Shirts & More</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Women" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400"
                            alt="Women's Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Women's Fashion</h3>
                            <p className="text-white/80 text-sm">Dresses, Sarees, Kurtis & More</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Kids" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400"
                            alt="Kids Fashion"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Kids Fashion</h3>
                            <p className="text-white/80 text-sm">Cute & Comfortable Clothing</p>
                          </div>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Accessories" className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="relative h-48 md:h-56">
                          <Image
                            src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"
                            alt="Fashion Accessories"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 p-4">
                            <h3 className="text-white text-xl font-bold mb-1">Accessories</h3>
                            <p className="text-white/80 text-sm">Bags, Watches, Jewelry & More</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-center">Limited Time Deals</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <Link href="/search?category=Fashion&subcategory=T-Shirts" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400" alt="T-Shirts Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">70% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">T-Shirts Collection</h3>
                          <p className="text-white/80 text-xs">Starting ₹299</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Jeans" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400" alt="Jeans Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">60% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Premium Jeans</h3>
                          <p className="text-white/80 text-xs">Starting ₹799</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Dresses" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400" alt="Dresses Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">65% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Beautiful Dresses</h3>
                          <p className="text-white/80 text-xs">Starting ₹599</p>
                        </div>
                      </Link>

                      <Link href="/search?category=Fashion&subcategory=Shoes" className="relative block overflow-hidden rounded-xl shadow-lg group">
                        <Image src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400" alt="Shoes Deal" width={300} height={200} className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">55% OFF</div>
                        <div className="absolute bottom-0 left-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base">Footwear Collection</h3>
                          <p className="text-white/80 text-xs">Starting ₹999</p>
                        </div>
                      </Link>
                    </div>
                  </section>
                </div>
            )
        case 'Groceries':
            return <CategoryHeader 
                title="Fresh Groceries & Daily Needs"
                description="Get all your daily essentials delivered fresh to your doorstep."
                linkText="Shop Groceries"
                bannerImages={[
                    "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop",
                ]}
                categories={groceriesCategories}
                bannerColor="bg-green-50"
                buttonColor="bg-green-600 hover:bg-green-700"
            />
        default:
             if (!opts.category) {
                return null;
            }
            return null;
    }
  }

  const renderTertiaryCategoryHeader = () => {
      const sub = opts.subcategory;
      const tertiary = opts.tertiaryCategory;
      
      // Handle tertiary category headers (like Dresses, T-Shirts, etc.)
      if (tertiary && opts.category === 'Fashion') {
        const tertiaryData = {
          'Dresses': {
            title: 'Beautiful Dresses Collection',
            description: 'Elegant dresses for every occasion - from casual to formal wear.',
            images: [
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=600',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            offer: { discount: 65, startingPrice: 599 }
          },
          'T-Shirts': {
            title: 'Premium T-Shirts Collection',
            description: 'Comfortable and stylish t-shirts for everyday wear.',
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
              'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600',
              'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=600'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700',
            offer: { discount: 70, startingPrice: 299 }
          },
          'Jeans': {
            title: 'Premium Jeans Collection',
            description: 'High-quality denim jeans in various fits and styles.',
            images: [
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
              'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'
            ],
            color: 'bg-indigo-50',
            button: 'bg-indigo-600 hover:bg-indigo-700',
            offer: { discount: 60, startingPrice: 799 }
          },
          'Formal-Shirts': {
            title: 'Formal Shirts Collection',
            description: 'Professional formal shirts for office and business wear.',
            images: [
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'
            ],
            color: 'bg-gray-50',
            button: 'bg-gray-600 hover:bg-gray-700',
            offer: { discount: 40, startingPrice: 899 }
          },
          'Casual-Shirts': {
            title: 'Casual Shirts Collection',
            description: 'Comfortable casual shirts for everyday style.',
            images: [
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600'
            ],
            color: 'bg-green-50',
            button: 'bg-green-600 hover:bg-green-700',
            offer: { discount: 35, startingPrice: 699 }
          },
          'Watches': {
            title: 'Premium Watches Collection',
            description: 'Stylish watches for every occasion and style.',
            images: [
              'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600',
              'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600',
              'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            offer: { discount: 60, startingPrice: 999 }
          },
          'Kurtis': {
            title: 'Designer Kurtis Collection',
            description: 'Traditional and modern kurtis for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1506629905607-d405d7d3b880?w=600',
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
            ],
            color: 'bg-purple-50',
            button: 'bg-purple-600 hover:bg-purple-700',
            offer: { discount: 45, startingPrice: 799 }
          },
          'Sarees': {
            title: 'Elegant Sarees Collection',
            description: 'Beautiful traditional sarees for special occasions.',
            images: [
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
              'https://images.unsplash.com/photo-1506629905607-d405d7d3b880?w=600',
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600'
            ],
            color: 'bg-rose-50',
            button: 'bg-rose-600 hover:bg-rose-700',
            offer: { discount: 50, startingPrice: 1299 }
          },
          'Polo-T-Shirts': {
            title: 'Polo T-Shirts Collection',
            description: 'Classic polo t-shirts for smart casual look.',
            images: [
              'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600',
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
            ],
            color: 'bg-teal-50',
            button: 'bg-teal-600 hover:bg-teal-700',
            offer: { discount: 45, startingPrice: 599 }
          },
          'Trousers': {
            title: 'Premium Trousers Collection',
            description: 'Formal and casual trousers for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-slate-50',
            button: 'bg-slate-600 hover:bg-slate-700',
            offer: { discount: 35, startingPrice: 999 }
          },
          'Tops': {
            title: 'Stylish Tops Collection',
            description: 'Trendy tops for modern women.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            offer: { discount: 60, startingPrice: 499 }
          },
          'Top & Bottom Wear': {
            title: 'Top & Bottom Wear Collection',
            description: 'Complete sets and coordinated pieces for a perfect look.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600'
            ],
            color: 'bg-fuchsia-50',
            button: 'bg-fuchsia-600 hover:bg-fuchsia-700',
            offer: { discount: 50, startingPrice: 399 }
          },
          'Sunglasses': {
            title: 'Premium Sunglasses Collection',
            description: 'Stylish sunglasses for UV protection and fashion.',
            images: [
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'
            ],
            color: 'bg-yellow-50',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            offer: { discount: 50, startingPrice: 599 }
          },
          'Belts': {
            title: 'Leather Belts Collection',
            description: 'Premium leather belts for formal and casual wear.',
            images: [
              'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            offer: { discount: 45, startingPrice: 399 }
          },
          'Lehengas': {
            title: 'Designer Lehengas Collection',
            description: 'Beautiful traditional lehengas for weddings and special occasions.',
            images: [
              'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600',
              'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
            ],
            color: 'bg-rose-50',
            button: 'bg-rose-600 hover:bg-rose-700',
            offer: { discount: 40, startingPrice: 2499 }
          },
          'Gowns': {
            title: 'Elegant Gowns Collection',
            description: 'Stunning gowns for parties and formal events.',
            images: [
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=600',
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600'
            ],
            color: 'bg-purple-50',
            button: 'bg-purple-600 hover:bg-purple-700',
            offer: { discount: 45, startingPrice: 1899 }
          },
          'Ethnic-wear': {
            title: 'Traditional Ethnic Wear',
            description: 'Authentic ethnic wear for cultural celebrations.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600',
              'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',
              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600'
            ],
            color: 'bg-orange-50',
            button: 'bg-orange-600 hover:bg-orange-700',
            offer: { discount: 50, startingPrice: 1599 }
          },
          'Winterwear': {
            title: 'Cozy Winterwear Collection',
            description: 'Warm and stylish winter clothing for cold weather.',
            images: [
              'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600',
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600',
              'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700',
            offer: { discount: 40, startingPrice: 1299 }
          }
        };
        
        const tertiaryInfo = tertiaryData[tertiary as keyof typeof tertiaryData];
        if (tertiaryInfo) {
          return (
            <div className="mb-8 space-y-6">
              <CategoryHeader 
                title={tertiaryInfo.title}
                description={tertiaryInfo.description}
                linkText="Shop Now"
                bannerImages={tertiaryInfo.images}
                bannerColor={tertiaryInfo.color}
                buttonColor={tertiaryInfo.button}
              />
              
              {/* Enhanced Offer Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Deal */}
                <div className="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white text-red-500 px-3 py-1 rounded-full text-sm font-bold">
                        MEGA SALE
                      </div>
                      <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {tertiaryInfo.offer.discount}% OFF
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold mb-2">
                      {tertiary.replace(/-/g, ' ')} Collection
                    </h3>
                    <p className="text-xl mb-3">
                      Starting ₹{tertiaryInfo.offer.startingPrice}
                    </p>
                    <p className="text-sm opacity-90 mb-4">
                      Premium quality • Fast delivery • Easy returns
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="bg-white/20 px-2 py-1 rounded">⏰ Limited Time</span>
                      <span className="bg-white/20 px-2 py-1 rounded">🚚 Free Shipping</span>
                    </div>
                  </div>
                </div>
                
                {/* Side Offers */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Extra 10% OFF</div>
                      <div className="text-sm">On orders above ₹1999</div>
                      <div className="text-xs mt-1 opacity-90">Use code: SAVE10</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Free Delivery</div>
                      <div className="text-sm">On all orders</div>
                      <div className="text-xs mt-1 opacity-90">No minimum order</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
                    <div className="text-center">
                      <div className="text-lg font-bold">Quality Assured</div>
                      <div className="text-sm">Premium Products</div>
                      <div className="text-xs mt-1 opacity-90">100% Authentic</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Flash Sale Timer */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-500 text-white p-2 rounded-full">
                      ⚡
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">Flash Sale Ends Soon!</h4>
                      <p className="text-sm text-gray-600">Hurry up! Limited stock available</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">23:59:45</div>
                    <div className="text-xs text-gray-500">Hours left</div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Default fallback for any tertiary category not defined above
        return (
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-center">
                <div className="inline-block bg-white text-blue-600 px-4 py-2 rounded-full text-lg font-bold mb-3">
                  SPECIAL OFFER
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {tertiary.replace(/-/g, ' ')} Collection
                </h3>
                <p className="text-xl mb-3">
                  Great Deals Available!
                </p>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="bg-white/20 px-2 py-1 rounded">🚚 Free Shipping</span>
                  <span className="bg-white/20 px-2 py-1 rounded">💯 Quality Assured</span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      if (!sub || tertiary) return null;
      
      // Fashion subcategory headers
      if (opts.category === 'Fashion' && sub) {
        const subcategoryData = {
          'Men': {
            title: 'Men\'s Fashion',
            description: 'Discover stylish and comfortable clothing for men.',
            images: [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700',
            categories: [
              { name: 'Formal Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Formal-Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300', price: 899, discount: 40 },
              { name: 'Casual Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Casual-Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300', price: 699, discount: 35 },
              { name: 'T-Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300', price: 299, discount: 70 },
              { name: 'Polo T-Shirts', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Polo-T-Shirts', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300', price: 599, discount: 45 },
              { name: 'Jeans', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', price: 799, discount: 60 },
              { name: 'Trousers', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Trousers', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300', price: 999, discount: 35 },
              { name: 'Formal Shoes', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Formal-Shoes', image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=300', price: 999, discount: 55 },
              { name: 'Casual Shoes', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Casual-Shoes', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300', price: 999, discount: 55 },
              { name: 'Sneakers', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Sneakers', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=300', price: 999, discount: 55 },
              { name: 'Jackets', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Jackets', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300', price: 2499, discount: 30 },
              { name: 'Hoodies', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Hoodies', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300', price: 1499, discount: 45 },
              { name: 'Watches', href: '/search?category=Fashion&subcategory=Men&tertiaryCategory=Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300', price: 999, discount: 60 }
            ]
          },
          'Women': {
            title: 'Women\'s Fashion',
            description: 'Elegant and trendy fashion for modern women.',
            images: [
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700',
            categories: [
              { name: 'Dresses', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center', price: 599, discount: 65 },
              { name: 'Sarees', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Sarees', image: 'data:image/jpeg;base64,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', price: 1299, discount: 50 },
              { name: 'Kurtis', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Kurtis', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFhUWGBgaGBgYGB0bHRoZFxoYHRgYFxcdHSggGholGxgYITEhJSkrLi4uGB8zODMtNygtLisBCgoKDg0OGxAQGy0mICYuLS0tKy0tLy0tLTAtLS0tLS0tLS0tLy0tLS0tLS0tLi0tLS0tLS0tLS0tLS0tLS0vL//AABEIAQMAwgMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAGAAIDBAUBBwj/xABPEAABAgMFBAYFBwgIBAcAAAABAhEAAyEEBRIxQSJRYXEGE4GRobEycsHR8CMkQlJisuEHFDRTc4LC8RUzNWODkqKzJXSjw0NVZJPS4vL/xAAaAQACAwEBAAAAAAAAAAAAAAACAwABBAUG/8QAMxEAAgIBAgMGBQMEAwEAAAAAAAECEQMhMQQSQRMiMlFhcYGRocHwM0KxFHLR4UNS8SP/2gAMAwEAAhEDEQA/AMO3XdMs0yWVhiyZgYvTMZZFx4QedL0/M5R+rMT4CYIqdMpvzZKDMBWoS1eg3W09IEOEtu7NRGl0jS9hB3LB8Vj2xz/Neh1+ZycJPzLSkxyJiHiMgxxdizNsQ+f/AOD7Y9AsMsuoqSxokK+sgDEnkxWpPYTrAFYh8/8A8H2wb2m2sAEHIB2rplHd4Nrs1Zi4zxL2NGORky78Q7F33N38orWu/CTgQkgnIxssx8yN5SgMyBCChvECNqtM1PpJKhvBeI7RaiB6TK7G5RSlexXMFE+8pafpOdwgemXnMUVYlMipffwHCKsmzIUxxEKIdn8xE8yz4drFQBgNIGUkVbZCbeoAYVsnexAh8mY6TtKCRXFmVb6nIREqzmbQvgGgpluiRFiALhSxkCCxyygXOFUUrIrZPKWw0LUBr36w+ZYwsJM1IcD0Xo5rWLU2Wh8SUJKnfKpPsiJTzKzBgSMtHMRTVWiUZ4KidkKwp3aaU3xbFrUgnDiS9Hzy3xfWsBIHl74gCXq4Db8oD+o12Jykk691rSErS5pQFsXNq9g3wNdMbylyJSZKUBVqKioKZxKDuopUXcgMimRBJygnsighYUGJZgKADjAb02kzUzkWgYThQlKQWILYnS3IuTxzyhGVxU+0e706ae3X6hakVz3cp1iZMRJmnblTsQSoqWBsrlgPgU9XGZPbL0fvaeozkLTMXaAMICQDhz2yGICdpnH1U8Ir3Pcv5xOVPMwJAWVzZqwA+HApZGIMlKXpoAUg5tEEzpHIkWgizAGTLDYl1M4/SUFZpALYWbInWFON1L10fUsJJSJiJgStSZbeilVVkGgJAC8yGzr5dSmTOdCggKSStS5QIlvXCJg1JG4CpZjAzdt7LmFa1Ay8yhZSTQEkDEaLXRq5xoWW3JWlKPouaFTCrMoNrRtPGENxUtV+fnUOkX12Cykk4khzpLU3Zt5Qof1x/Vf6VQoPu+S+TICt/wBmAVLUhRMmYgLlOXwpLugE7i/eIL73D3d/l/3PxgUs21YdoP1M0JRwSorBHLYSecFVqrdf7ss/6kH2xoqnL2OrKV8l9GXrOXQk/ZHkIcREVhPyUv1EfdETRx2R7mZYw14p4yT5n3Rr2mbNOygF+WQ3ncIybN/aKP2J/jhTr8rOkhJDKXtCp9IhwngeMdLHmjiwqT+CMfGq2vYv/nZxABRPrDCYfMtClqwJJBfhTjEFiV1KUid6QyDBhwSrVO56tEqpoU/VlnzIDnvyjdjdxUmjASdVNxUPf7IeLIH2kA0oWHjFqRZyhAAUcs1ZxHa7QhCSVlkpDlTswGcBLLWiC5Ssbs2gQEgP2juziGbZSlRGJ07ia1gGt3TVcya1nVgRtF1BzhSCcjvbxiCw/lDWF4lykKSc2DK5gksfjKHrm5e8X2Z6HZJCgCVqOGrDXPKOJsqwunoa1iewWpM9CJ4mBSCklLDQs77iCGIixaUJLOe41rGWVWSqM+fOwA4SXbL8YrSlzFsywd4bI8IbbVSgSl3ycE5xAeqlsZYJObpUc93CCpUVqb6JQwjHp4mOTZ6S4wuG1NOXOKIvbGwJY5YVavo8V7TYVFD9rA5QKjqF7CE3EtkpAbKsPWnraLSCpPoukFiWFH4xkdeU7LjTnFuyWwJKXUoEdzaPSsFPHaoEsLuGbONFfIoAxJfZUxWtsIqSVEEliajOgjza9bGqUpPWIICyvSrAkejuffuj1v8Ap4pcoKSEoISkfXLus7zlTnvgT6S2CdapkteBVJYTiz2g5OWQej8YCSqKWrZdA/dBmdStTrCWKQKkDLIZajjG3cd1oWUyxMUoYApRw4WUTVIfMCgejsaQRWTo8ESOrLhSgcTGjkNSlNO6L9wXGUSkoAyd1GjuXz1z0jKsLlkqtAkWZUpCUhNSwAc8IUW/6B+2vvhRu5Jko8su4/MZ/CdLP/UmwUy63WobkJ8MECV1VsNp9eSe9az/ABQXWQf8MX6n8KIB7v2Op+1f3L7Fm7z8jL9RH3REzxXus/ISvUT5CJ3jiS3De5nyP7RlcZR/7kZtglpXbp6VYkqxzAhQ4KUavnk/YY0Uf2jIO+WsdwmRbmWRRnKKZdUqVXLM1Y8aGOnhw9rjj6Mw8bvH2/yXrPYlOFLSgkACgo4zZ8hFiZMw5FKeeURyrLMTQh8iK798OTdpLlVSc8QBYcPfGx11Mq2IxiWKO9e3kICenC5gkJkuU9bNSlXqsVEje2F+yD2XM+qWSKMNW3mBTpHeMiZP6mYgqWkO7sA6SDTUMSNM4FPWxuPG5SKvR6VZ0ymRQIG0VJbPUn6XMEwM9LrplsqfKDAemnCUgjIqS4DsWducGF3WWUjElCSMTaGoLk13v7Ip31d6ZNlnlPoqQqjvUhWQ5lvCEKdSs6bx3GmDvQW81IV1BWQhW2GOSgztzTVuEelz5hUn5NTBqqNWG8cY8buSeETZaiaBQD8CAPaY9SkXetwUmiubF6vyjU0mzmzTTtFG8JKklyoVcga9sU0IKTTPdBFKu0LLTMwzjOj7xlENtlyEIBBKQVYUp1JydJIqxJyfKL7RLQRJaiu+yImJeaok6JoAAOOcRybhUZhSiYpKfSAc5Ew+Zdk5ABSM+Rz3iJrtvOaglKgFcXy0Y8YHvXoEoXuUbTcExFVEkDccR8IfZbumKoEdpS3cd8EdhWVLO0sjDoAE9nlEhmiWkgPrUkkl4qWRrctwSMeXc81xRFN9fZWNKXLmgsUgsPSdhyCXjKVey80g55V7YuSrSt3ZgA5pAN3uUVbZaFiYyiAzENlQ5GG23pTMAc9WpP2VHXhrDrShMxQAfUnd3+yM/wDoazoGJYf6rmhqaYRpEUkl3iczWx09NB+q8YUTolywABJSzU+ThRX/AM/+n1L7afmB1wKewWg/8sf9s/xQZWUvdsz9l/An3QFdG/0C0jciQe7qHgxu4vdsz9krwH4QT8XwOj+xf3L+ES3N+jyvUEW2ilcankSvV8iYumOLNd5jZbszVFrfZuImfdXBMhScW1OSHJAQCHpoTv4QMzP06y/4n3TEM79JnJIKpa1F04mZQS4UncX8jG/FkcMUaV26MnFJuUa8vuwjvOXOUSJeFKA1Qpj2xCi1FCcJWVnw/GKky0qXmctNIq9akqYqYOAos5D7gNY08992CtldjGC5pukWpltySA25KR7BnAr0x6uUpM5bomJISQoEYgcm3kEg0fWDWx2iUgHDR22ncqfVQ4H+Qjz/APKLYVWucnApsIVUilSAMLGqtkk0HM6NhgyOSckxb4vHTUf9lzo9bLPOAmiZhKg5D4S4zFDv9sVfyhXon83EpJUAtaEqXkyXqz50DPxhXLcfUy0kVKaNkXyNcq5xY6SXEqcnBNwoQGfN3Fc2YZb4W8M4ZdYul9jR/VY8mLxK6AWWkDEkF2JHB0nQ6jOutDHqP5Or3UqQqWU4lS1AAk/RIcDnHkt32OckLCwzJYauXYM0Gf5KrzSFTErO04IG9g3byg8yq2uglPuI9Sl2czMiQFVUORqMVKMGeH2y8US1HZqwzrXRuAaEbSoSyrUBwCwBYZjhq1chGfOsyZzgKLkUJwuQGrntcYzdonJJiGrFZbcVuwJqXHA5cYZdl2oBOIsXc9ubaxyzSV4urScaUuCobOEu1WPw8bBsoQQAtRyoo0ZjUaqOQz1h3NWwaVEiZJSPkywf45xUviUooUpKcSmoBSLcxJO/TMZNo2kcORGreUSTLdAPKTanBKVAk5aAbwe/ujflzikHbYsGKgK8j36Q6deAllIWFOcgG41bNqPESr2lrcJNRvDkFt1e+FuTkIbLAtCiyXNc8KSw3131jDvR0sAMTOXdixI948Yhts+bjwKeiiWdgvPMDJxFXrgt8GaXCHAwj63E6QXLTBZD11o+1/mMKIupH6zuVTsrChtsEpdGz8ha0j9UG/d6mC+4w93zB/dTP+4PZAb0ZpLtQ/8ATr/09SPZBj0YL2JYbOWvxVNgf3fA6z8HxR3o9+jS/wB77yo0GjP6Ofo6H+195UXiY5E/ExsvEzNtA+fWQ/tPu/jEF9XZaF2hc0LGx6CHZ059hO0H+yBpE9qV88snOZ5CJbzvYm0dSw2SUjR8SUkAuN7ZRpbisCbda6GfK6nF+n3Zm2a9kTQUg4VZENtA8UmoPAiJpctMtJUkFROYepLZcDn38Yo3reGNCVj5NZLZOGauMUNNOcSXekrQSzskYiDm7AFncnLTWOjweTBFc3Ok35uqOdxmeWSo1ovLqclqcgu4CkABtFlJcvUNXui4bEAcZJLOeVMvjfGPYyFTTXJMtSQNFArDgcvKCCwBRBKjs6E55kb23fhlHUhyqT9dd/qYZW4+2hlzpqlKSEkpIWguAzoKiKgjj5RbBmFawpWJILFRepYZE6VJeL82QFAlLA5vxHx4iILNNTNSU8N+h1ccoHk7y1b+v16Bc9xar89jIvK6pZdQArmQ2WRHL44RhXxcqZMo2mWtlSiKjNyoAOc9Rnv7ziyWQpJ3aDQe7c2VIodK7q6yzrlAtjKTnqCCHfTZFIVkhGSUnpv6fP8A9+aG4ssovlT6ofZLVNVKCylagnbSEp1FQl3oHIoxpExtyzLPWzmWDsjqlJrVLYsi+faKRH0Stc3qp0ueBjk4UFY+knA6STvwlPhBJZZonSXI0ZTDItmd3vEciWG21ep0nOMuhh2O95o2JywlynaSjQllZFydMs2zeN+3IBdQUT1bFCcWQDApOpzfWrboHpVzjCVTyslRKcSWFQ5GZZRoXi3YFMFI60lVBVGGgLnAAc34lvGFRctpFSab0GJttsK/k5cspUaEqIYEPUku/BvfFS9ektps80pVLlFOHEFAL2g1drL0mjZkTVAmWAcQxKIKdCnQtoQSw9sWrCtKwygFHIEjTOtABmA32S8OjK6tl8/oBtr6TkYJi0IAmYRRywJAVpnVwKZcYnkJQDsgllnacOHSKEZE8N0a/Se6papBCUpQUMRhAFEl2pTRxxHGM5MtOKa4DVLvuGE60yHe8SdxfKMjDG1dFSzXn1yVFSRsFDErDHGwybRxEqZmyqYCUpwhRGJBG0mgajUOcVbFfapYAlypIQopd0A0DAOXqzDNoILFeAIHWSZRQtQGykAtQAkVDBt+XKGdnLzE8+F/tMZN0gh+uNeCffCg6N2y/wBUO6FB8mXzXyJWHy+v+zyXo5UWr/l5/wB7/wCsGHQ8PZVeofvTPfAd0TTS0j+4tH35vugx6FH5uvkr2++K/ca5fpv3QzozWzp5q+8Y04zejCfm6eavMxoqjkz8TGz8TMu1j53ZD9pfkmIbwtS5duOwkpJSwUGKtkAFKuZUMw5DRNbv0myH7ZH3YLL5s6ZlkSlSXBWnm2OrHMUeNUcPa8Pp01MvEq5RS/NTAFlROlJQqUEOsPniC3ZVDkGbeGVwBjSu+5kSsVNlSSnCRSvpdhYHvjkwB0n+8l/fTFmbbcL4iClqtmOYiuGwQpOStoVOCjVgPe0sItxw5HCznTqx3nESe2NWzzkzEHJQrTQkaHhwjGtT9cX+qln5qEaFyA7TnOrbvildWfWPQQTUElSVa+ey2/PI5c0uZ3venzLlh2Qol6hgCqg0BqHiVRTLToBv56k7ohQsKCgC7HQ/G6OWWZjSxSWp6QY5Ploa574KDuKp3puDJattV6Et3z+tQquJuYz2gO5oglTMZVLV9Fancgk4GGIAZAkO3OLCV9ViIqSkkE6qALOYF+j81YWZc041kEzFJcJKycRA1IGJnpkBAcmnLv7/AB3dF82vNt7BKhQQmYhIJOJKiPrBUtVVUyeWR2AACN/okhYRNKqpUQUsXcMe7dXdA/apaaKABOFj44edafvGNy5ET8ClS0gJmBCgFFiDUKADEDPFXdlWnLyXHiv8exrxSuAOWi0BcyalQUl1UCzhUkMDspfUvrWG3fMdaZmMDDML5hRSHLZUoQH3iO9ILPitxmMp2BWEuQKJAJpQF25kaxYs9lxyytJSSkqBDD0QcxSu4/jGJ25teRqrumnPnHGpaFGlQWzZyEsa+iWAiG751cacacRAUk1D0qGyBZoo2C8RjxbLAkEMPRLhkpdwM2PAxoSJbkoSfkysUzzwluArDI6tMrY2uliXs0xacwAC1fpAHugRVKxy1pLbQWeD4ks/xvg26SJ+bTQNw+8mBeSjMHeoM3Ee4Ro4l1miMxa4n8f4BqRIXMUtAZikHE2EApZw7VD6awyalipEwBCkpYAmhZy7vXzrG9PvXq1ErlJAxeklJGNSgWcnMuDpSBa+7RKUtXVhQCUpoTi2slFxvzeNKVmR6I9okSk4U7IyGg3QofZ/QTyHlCjRRDxLo1L+VtCRrKngdvXGCboOfkJn7/3Ue+BzowlrUtO9E3xRNMEPQMtLUPW8pcYFujpy8Evh9yTo2fm6eavONFRjO6L/AKMnmr3+2NBStI5OTxMbPxMy72pOsp3TU+JTBpaUFVmSBnjGRAbaLlzoICb8Uy7Of75HmIMrePmiuBfuU8dLhNcLXuZs+8PzqULQoHCR+sl8P/ES9Iy7tny5hImSlKmORqAQCWPKNC0nZHry/vpiZCZQUcCVOC5oqpPFqxXDvusDLHYG+ldnKCjClKNnJ3ArTLVzuOUcsatpgakebt2Uixfc3FNUPqpSKhqti9oighBTOScRbNm0Ib0ueGlfd1sTcILmap1Xxs5OXvSdbotyZCkkklwQzENk+j8W7IsSk4EMASX8TEluDg4Sx3/HxWI7um4hm/HJ3APPWDlGmqXR0+iATu235aEdJyKVwkZiho9RyOXKBuzJMm0zEKBUXooD6JqipIrhIfjBhOUEB6VZ3o7e1hFO12MrUlaADRjyzSfE+ELyZMkMfNFa+T1G4MWKeXlnt8iexShMquiaOCnESzu7Gg1fONix24SZqkuMJSkAAegEhTFaiWCaEdgOUQXbYTgIJNQSSGHYHqWidd1yOrmy1BSkqCErOIApBUPRNNkYcR9WOT33JSVL4e9myaSbUdjNvazJXaZk1KSSAkjN9pKchqzBxEC7vxIxDEFAnIE7PWKJFNa+EWVWTqXQkqACUpKVM7EAlVCxIMdlSgqUkksCVMEu5VjWzkZJrCY+OT69fmMlfZ2YCUGUQkJSl2qXGoxA6guxHKNSRaq12XWkUGdad54DMRDabOJZWk1eu0fRJZGIEihqD2GKEm6p8xcky8SkJWMQqAMKgrUuRqGhmKKcqsCXhs9Hv8fN5vq+0QM2tAfLUmpYZa8IKL8/qJvqGBe3IJAABJOIMA59E6Q/iv1YjsOsH8f4MexrImqkLCSJjYVBYISseiQHyft2jnFBd1qmBa1rVUksnZBHq6aaQRpss0FJ6tTISSBgNVAEJHeR3QLWnr/zhK1vUsU4WYH6w0bjGiL7vkJcUmewSvRHIQoUvIchCjQKPFuihe2nilQ/6S/fG9+T2qVcj5Igc6ITPnyaNtEd8uWG/wBcEP5PKFadzeP/AOYwreJ0peCfw/lk3RX9H5KPkI1CIyujH9Wsbpqh4JjXjlzXeY2fiZh9IUACS365PkYM7d+iTOD+yA7pP6Es7pqfJUGNsHzOdwCvIR0OE/TkZ8+8DMtfonmnwUI0ZEoAqUBUkgkk6PochGbbfQUdwfurGmvNmGZzUka8TCcV8orPelAVek7EuZmrGpQDahNM9KDPhD0F5SSWCgn48orXWsTEl6hyKjlocolt6VFgAHqyjvrQDUue5477hyd6KV6LU4ylzd2XqWrKhquWwhudST5cvK4gASxk+86kB3MVJBCpZlvUaZ08IbdVoTNSUnRncahiHHJqRdaOK3XVfm5V6pstSl9ZL+iSCH1GhLdhz/lFmyTglaUvoOwGgPxuiHB1YdKanNtTqYXVgqSoAbwdwMIaSTjbbpX1/wBe/oMtvXRLU37VaRRmBehZzUHIn0cs+UK5rH1iT16AWIIS7gVU1aOW14xmTFpSorHWOakU4NrQUjb6OzAtBWNSzbsJUN5jkYKnl119De8ckraM695CzOWoJOEhLHfhBxd0VbBOCZYSoAbSgBl9NTZ8Xht/2MKtC3UsEBNQojNyzCjBgBTxijKVhSihU61pNdTMOEk5io03wqX6sjQ4yljSL9us4UFFIBURV60D0yYEuR2xDcNtUkgSzicuQaBiWJL1GRqN0aEiapBOENiZ3IPhhjIsdjPXjCyCXwpzYqBKQaME7JGWsHDxJxeotQaWoY3sXs8x/qK4wL3mvCgqFCkE+EE95IIs8wEucBc7y2dIFb8U0lZ3JV5Ro4r9SIzB4WW7tmgy0EkEkCpaufDhFC/JYSFqSU4jU1bT2RbuOyES0ETApOENskO+RrlQ+MRz54MzqsYxOWGEFyA59IdkLyScVUkA05ukGkn0RyHlCjHlW5QSA+QA7oUdJSVCKPIuiR+ey+Kx4iRWCfoNSfOH2h4dZ7oFejv6bKY0MxJ/1yfZBP0PPzqd66vOZGPrE6X/ABy/OpbuAMq0J3Tle0eyNYxk3bS0Wsf3j95XGq8czLpNoOW9mJ0s/qkftE+SoNLQl7JPHBf3RAX0tLSR+0T5Kjft99dVM/N1gYJyFMrJl1FTkxYDtjbws1HG3L8sz8Q6UPd/Y5ayDLmAEOElxuprF21SUHGSMnL+MDNyy/61c60IQ5KcJBUopNMbg0D8C1I259uxJnSwElSBtMqhlrQSJiCzEM7h9OIif07VL1QMs0VswXkS1JlgJqTm5ahzrpTWNC7FlSFYm9KlXpRq6/HOKksspUtRBIGm54fMSUpDFITntPWvCtBiPMDs7MZVFSSqNdbTOM1b5XrK+mwpaSLQ1GI3VNah9KA98ctCxIUCTQlqntqdwHlE+0nq1qNcieJ7BEV9Alw9QCoU+juO/XugnGPMpRVt3Veq+9b+wFunFvb/AD9i6oCakZFjvyIzqN3jE8tISUpq2XY0ULunhKUjeSacWxHvPjF2bZsS0KctSj0o7Hjme/WKdtaNp6flfQtVfoWlElFEklg7Alu2NDoyky8YXTElKwnUDaq3dThFCz26TLUFTFLSpKlsB6K0sKLBoc3HOLhvyzplFYQrAogswNVKAcOSKE5ZRycfDQx5edSOv2kp40uUoW+2BdomUIokMaZYuEULRKJTJSFEPMWpxu+UUl3FKsdC4jetnScSiECUolgwKt5bcYit3SRAmCX1KFEtmXbPOlGDwM8EXJy5t/QZGclWhEJjh/gHXxiK8SEGSTiC0rSWBIdJUHDNnlrR4daL5GMhMmVgSdtTUTqpyNYHLZbBNXOnAhkqBSQ70pQHRxrwio4+RNthpOeiR6Te4+RmeqYALXaJi5M8LSEgBWA7xoT2N3xcndK5k4CWkJGL0i2lXFeANYZbp0vCsBQLpIZwYLNkhOSaJDDPGqkV7kv5MqSiWp1FAwuGYtkzto3dF6654WXUgYg5xcTmRSkDEpJJwpBVXSNi5UJJWFTRJIA9MGru7ORk3jASUsmhElDU2zO4xyB+fb8KlJGJQBIxBJYscxwMKNaloI5QT6PzE/nclScsctuRmS/YIJ+iYa2TR9tfgVj2wKXIB+dIZmCpZfkVq09WCno3S8J4+3N8Jh98Je6Ni8EvYvWdLWy1DeQfjvjTEZyT8+tA4JPgj3xoPHMz/qsN7L2X8GV0rHyB4KB8x7Yr9O5rTJNCQpB73HvifpUfm6uafOJ+kstEzqkGUFLKCpKzMw4EoKDM2clApzJyFYfji5YJJGXi1cI/H7AkLO5xBRYpIbSooY0rju6YjBjQEhJANa/KbTeXJ+MXhcs5U3BKwGYkAnbGEF/rasS2WcW5Fz2hNpxTwnEQFbKlGgdIJGLC7BstDE4Lhskpp5LpNV8DnvGlFtitssSyo8PD2nzpFS7JhVQglNFAnWpdvMbwYsXzaB1mA6sGbmX3EM/dFW17CNkE1FAaknR/Dh2R6OUE1zJXV7/nXzMfM0+Vvei7facUnECwFcnfcCN0PUXsyVqLnAHV56O0KxDY2gMKn5NVj3RIgtLDh0jEkgB3BPPlA03q+qWi3+DL02+pgXarrAkUUzh6hswSPGCmWsbI4fAgXlES55S2bud53nnBDLkglKzoCSX3ZBt2vOI3yvdvZPrWnw36sGPeWyS1r5k9lsUsrPWLSgek6gDUUDPkWbujVUqUmTMRKXi+SWkYEHMpLKJSGHOKN2qefLZRS+MUz9En2CNq9VqRJmK6xZZCvocN7QnLFXZt4eb5a9Tz3ozYrQqyrmSkrUVLIajnCBXaGVYppl2qUUrmSJlCpS9lyWY4SBRjWrZ6wZfk9Uv8zSymAWsVSN/N435k+YMlyj6xA8iYyLh4vvI2TzO2jz+x3ksoQhUrCHxFQFTn/WMSBnwyEZ9pl4hPX9p2HrYQ3YI9Im26czNIP75/+MC11Kw2+eWSVH6IcioBJApvg549EisOTkfMuhm9D5bzFFZ6sBBAKkKNTTZZqs8Fsu6rKfTmdZ6zjd2NTV8zE8wKVknD6ssH7xMRLu+ar6Uz/wBuUP4IkcCXQvLxEsjstWe7JQUMKJakvU9Y5ArVmZ3aMm8ek9ikKKRZp616hFnX4qYCL8u5ln0go814fuNEkq4iPxmzT4YmhqjWwnm8wTV+USX/AOW2nu/CFBkLnV9fxV74UXUvMq15Hid1sJyGFMSB3CYfbBbcq2vKf68z/dTAZdS/lElmGP8AhmQX3YWvSd+0X4zExil0OnHaXsaix/xCf+zT5S4vqihPpeMzjJB+4PZFucY5nE/qMJeFeyMu85M+elcpEtDOlldZXfVJTwOsR37Yp89Mofm5BlpKXExBfFgf6Q+qRXQxt3OPT/d9sWrTiwqwh1MWbN2oBxeOlixReKq3MOeTk+V7AXdl+rslomCdhWUlScCWaigpLKbQgHsgylXp1i1TswsJCaMyUpfs2iYCLHf0m0S1y5sgddPwy1TXYpIGw4IYglKQVOKEvlBTYrKQlABIThTQEhvjKNHBxai1DRaev509Ec+ctVeo2+kEzEqdgAacd8ZUuYpRUkpLVNRTRm1qDkWqDGjftr20AkVJGdXIpTtHfFKYlgpY9I79A8bo6eFaW7vTpuvP+BMtfE+mhcmzMUlgH0zZjo53Oz8Hh11JPVqQtg5oxPAAg56CKt1LWk1DAs20FaDUZ1LdkaNsNEqQBmH5DXs+N8XLHGVypaqvx+RSk13fJg70lsrWhJORZjxG48wIJbHMBRh3CMDpZaAZcqY4JTOSlX734gB40rnQUoKlFRYZZ5szDPQdpMSUm8aey635V9AIqsjW/l8ybEJeAChxBhU50PFmi8q0ILhUxmLOASOekZ9vlYlSmD/KI1y2hWCeTcctaEqeigCGDHaG94RN3St/Hr6+pswaWYAlqIdJKhvAo1fra0yAiPrSDUHu9kFEvo5KGquxh5B4s/0VL1KzzWfZAcrH2CPXF9mvBi7nRn+K5xl2CXPlWxU4EhKipy+E4SKBiGzbM0aPQ03VJd+rBP2iVeZMTosksZS0D90e6LcbIpUD8m/JvBXAjyaL0i+VnOQs8UgnwIjXAbKOwQJXRaAQ5Ssc0n2ROkv+P4x2ORCHYUcjsQh85WROEvkxy/cXBjZ1gXrMpnM8ykwGWfNQ3+0kfxQWY2vVXrD/AG0mOfLY6sOvs/sbdq/tFX7EeaYtz1UipbkteBO+QPvfhE1oyjm8V+owo+FexauX0VniB3fzh97WxUmTMnJAKpaFLSC7OkOHbR48kvK0qRPm4SQ61uxI+kd0VrNbVBW1iUguCnrFJdJoQDVqE1jswjWO/Q5uV6s37ytSF2mWerYT8M3HiJUStRUx0ABBDAOC9TnHotlWEpCdwA7BqYHLqvSyTJKQE7clHVyyUFwFpcBxmSEqqwqDvrtTZIKmIcF6kmgbnTP4aGcPywUnF3daLX0/ncxTjbV7eZFe1nSVBVMx4ZN58WG6MibaXWUvRmoC2T1O/wB0al5WkY8PJu3cNRxjNtaQlJKdxoN5qW5mN8oKSX5+IzqTTZbWPkhgYMGrlQZZvXJxURPd004BiIYEtuw8+UULqmukAuxpXOmv8ot25AKAAWD11fQAjUQGse80lGvl9qQWku7u7G9I7KPzWaBkkJWBu6tQUW7AYfdq+skUJzGrfDiJ1ThSWqoIwF9X2S/45vGb0cRglqfPGU/5SRTcMzF2kq6fQFp3fU0rScCAkPQUO7DUeUGXR9byE8CsdgWoDwaAm1WcKNS4I7mara5Dugt6IH5sl9FL+8YGadNt9fz3G4Gual5GzHCY7ChJrGJmAlgQTwMPhQohBQoUKIQ5ChQohBQoUKIQ+b5UohWIsHwOOakVbsMFFpU15q5p8ZKTAwkEEcVIJYfbTmYIrzmteBO/q/GUge2OfLwnWx7tejCe9P05J3yf4le6HWlVIgv20pTapS1Fh1ZD9qooW+/pKdVK4BJ9rRg4iEpZNEFBd1AHeh+Wmeuv7xjt2y8UxIwhWdDkaHNmpEVrXiWpW8k95eNHovJxWhAO5Xgkx2Uu5XocyXiCC7CtIUkAAKLlkpTvYAgOweg0jfssyaQAMJ5uMzVj35w5FlbSHIWHYEFtHBbsi8UpQVJismOMt0Pm2VaynZT/AJk5vnzinaLsnlVJYKX0WjJsyCp3ejRsyFbn7osYgdKxojOtV7ipYU9wSmpWhARgWC7US7Vb8XypWNWykqQl0kE5gjzcRpz5DvvzEXbBPCxhPpDxG+Ltc3NWuxOx7vLZRmWNZXspLO+4F865ZkxnquhYUtHVqqsqd2AxVJBfifGCuUrQx2dkTwMB51pda+wTxK030+4OG71nNQA3AOW4AsPERq3LeEuQlUoTMRKioBYKCHAcAOcQcEuN8cCxwB4+wx1Yfj2QyUnLcCGOMNjckW1JFZiOWXmYfOtqE5qHZXxFIHFSjp3NESidR26QHKMsLJM4KDpBI+OMPJ4eUCCZgeh7nixLt8xOSldtfOJyk5gohQPSb2mg7VRwp5CLcu9UsXJfQNp3kRVF2a0cJiulQWApJU3As8JBTqewlPsiiyw/GFEWGX9nwhRCHgAC0jYloSaOXKiWDF3AFRpG6oSlLE4YyvDL2WASFIQE1LkmoDUA3vHerD5AcYaiezhmA1yz1dso5zfQ6KbRtzbYlQTjkBSgkM9acyMoqrtUxJdCJKAG0yPEhnjPTbEihUCTm0ZV6XgpQ1oSWB1O9s2gUnZG9AfnrJUonUk+OkanRX9IFSNlTNyjHMavRmaUT0qYsQdNHAJ4jONsn3TGlcg7ky0nQeEThNXS4O8e3eOcdwPUhJ4w6UtI+k3IRaKZblTVaiu/fEoKjp4/zhiZyTr4fhHTN5+EGATyCcQcjdm8KdJPpJopJpyOnnEIJ4Dtr5Res0wLYguFJcHuI8INFonsNsEymSxmnXmN4izavQVyMY02Uygpu7zjVmAqkqcPQ56xGQyuuw6tzh0u0g5EHlXyiJMkCoSkchEqYpNgkv50Bn7vEtEhL6ePuitjHAxxII9EkHiCR3Gg7Gg0wWiSZZQcqcj7NYqLs85JJQsKH1FpdqaKd+8ngIvoUpqgd8NKdfY8WUVk2wZKBSfD3+AiYLSciDyLw6ZISobQcbiB+MQKu1LuglJ35+0Ed7RCaE6Jik1TiB4U82ieVay7rQhXMAHvAjLUufLBJR1gH1WxH8e/nDbPfcknComWv6swYfHI98VoWEX57K/Ujw90cjPDb4USiWeW41GmIkcvfyhBBOhJ0cxtJRyiZFnG4Rh7I19qYSJOToqfPnCnylN6JHZBF+Zp3R0oDsz7jn3xfZ0V2lnnYsqiohjnuJ0Gkb9wXfMMxKi4CUFNQ1HdqHN/OCqVKFGQG+N8XZUkg0Yd3uhqTYDaQpSgAxQB3H2e+JcD6ODo3uh+F8z4e+I5yUpDmZhqKqIA5EUhqiLsdLs6dKHcSPfDwMP0ge73w+XKTm1eb+OsSkRaRVlC87SES1zHqlJIIzfQcnaM65r4mSJUhBQFAJFXL4XUPBPlE/SCegIZamAdRAAdQRVgCRq0D5mngASGqkmrMGFciYy55yjLum3h8cZQbkegLnqNGT3k+6MOXfs4zJkhRSkJUU7IZwapJJJzS2UX5Vul0dSX7PKB3pJPCLRLmJ+knCuhHol0mvBRrwhme+S0xOCuemgqkoBDl35n+ULqWLhuIPsOY8eyKt2z3SwIJzDlnHYD8GLzHePP3QeJ80UxeWPLJo6lQyZjuh4iJjvPh7oaZb5+MNFE5UBmRDTNH8gT5QwdkPBiyjnWN9E+HkK+EPSp6084a8JohDqjxNN0R2iyIWGWkKHGvnHStuPn+McE58kl+TecQhnno1Zf1Z/zr98KNIzvsnvHvjkVSJbA1HKJkCIUc4nQDxjPQ4lSIelPGGJQd0TyJZ1PhFpFWPTE0oxGqXziWU26DSKGJcYtsqcuE7NB9VLAeLx2SvElyhQO5THycRZBhBUFRVjAguS5q1CWA5MH8YldbadgPtOcdELFBFWUbddqZrY8RKcmLNvYpY+MVU3RKSXCXO8kqPeokxrlUQrVANLcJSexWRshg4EZHSU4ky65L8wdeyNwk7j5ecUrdYDMFDhUCCklixGTpyI4PASVxaChLlkmV7ntTKSgHa0DPQM7nShHfBUlTwHC6rQ4/qw30kqUNAPooScgNTBNYrMEpAJJOtSz8soDh4yjaY3iZxnTTLhVCTDEpSMgOyHYo1GQQJfLtp738IaSoHIM28k9zc4fCeIQiQt9TyYg9tHHKH0+Kx1Zhr6s/IV7ohCTKEo/DQxKxpXlWFiO7vLeQMQhLCiMA/H8oUQgMSxErQoUJGEktMSyoUKCKJYjnqIYjPEB2GFCi3sUidJjohQoshx4YlRK20hQoplos4RECAxIGTe2FCiMpDyI6BHIUQhJJjsyYXHMwoUWiEqvYPbDjChQQJzWOkMDChRCHIkEKFERGNkqeJRChRZQzD8PHYUKLKP/2Q==', price: 799, discount: 45 },
              { name: 'Tops', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Tops', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center', price: 499, discount: 60 },
              { name: 'Jeans', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center', price: 899, discount: 55 },
              { name: 'Top & Bottom Wear', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Top%20%26%20Bottom%20Wear', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center', price: 399, discount: 50 },
              { name: 'Lehengas', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Lehengas', image: 'data:image/jpeg;base64,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', price: 2499, discount: 40 },
              { name: 'Gowns', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Gowns', image: 'data:image/jpeg;base64,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', price: 1899, discount: 45 },
              { name: 'Ethnic wear', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Ethnic-wear', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center', price: 1599, discount: 50 },
              { name: 'Winterwear', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Winterwear', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 40 },
              { name: 'Handbags', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Handbags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 1599, discount: 35 },
              { name: 'Jewelry', href: '/search?category=Fashion&subcategory=Women&tertiaryCategory=Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 699, discount: 55 }
            ]
          },
          'Kids': {
            title: 'Kids Fashion',
            description: 'Cute and comfortable clothing for children.',
            images: [
              'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400',
              'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400'
            ],
            color: 'bg-yellow-50',
            button: 'bg-yellow-600 hover:bg-yellow-700',
            categories: [
              { name: 'Boys T-Shirts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Boys-T-Shirts', image: 'https://images.unsplash.com/photo-1503944168849-4d4b47e4b1b6?w=400&h=400&fit=crop&crop=center', price: 299, discount: 50 },
              { name: 'Girls Dresses', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Girls-Dresses', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop&crop=center', price: 499, discount: 45 },
              { name: 'Boys Shirts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Boys-Shirts', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 399, discount: 40 },
              { name: 'Girls Tops', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Girls-Tops', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 349, discount: 45 },
              { name: 'Kids Jeans', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Jeans', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 599, discount: 50 },
              { name: 'Kids Shorts', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Shorts', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Kids Shoes', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Kids-Shoes', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 799, discount: 35 },
              { name: 'School Uniforms', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=School-Uniforms', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 699, discount: 30 },
              { name: 'Party Wear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Party-Wear', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 999, discount: 40 },
              { name: 'Sleepwear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Sleepwear', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 399, discount: 35 },
              { name: 'Winter Wear', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Winter-Wear', image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 45 },
              { name: 'Accessories', href: '/search?category=Fashion&subcategory=Kids&tertiaryCategory=Accessories', image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=400&fit=crop&crop=center', price: 199, discount: 30 }
            ]
          },
          'T-Shirts': {
            title: 'T-Shirts Collection',
            description: 'Comfortable and stylish t-shirts for every occasion.',
            images: [
              'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
              'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400'
            ],
            color: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700'
          },
          'Jeans': {
            title: 'Premium Jeans',
            description: 'High-quality denim jeans in various fits and styles.',
            images: [
              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
              'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
              'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
            ],
            color: 'bg-indigo-50',
            button: 'bg-indigo-600 hover:bg-indigo-700'
          },
          'Shirts': {
            title: 'Stylish Shirts',
            description: 'Professional and casual shirts for every wardrobe.',
            images: [
              'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
              'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
              'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400'
            ],
            color: 'bg-green-50',
            button: 'bg-green-600 hover:bg-green-700'
          },
          'Dresses': {
            title: 'Beautiful Dresses',
            description: 'Elegant dresses for every special occasion.',
            images: [
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
              'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400',
              'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'
            ],
            color: 'bg-pink-50',
            button: 'bg-pink-600 hover:bg-pink-700'
          },
          'Shoes': {
            title: 'Footwear Collection',
            description: 'Comfortable and stylish shoes for every step.',
            images: [
              'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
              'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400',
              'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400'
            ],
            color: 'bg-purple-50',
            button: 'bg-purple-600 hover:bg-purple-700'
          },
          'Accessories': {
            title: 'Fashion Accessories',
            description: 'Complete your look with our stylish accessories.',
            images: [
              'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
              'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400',
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'
            ],
            color: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700',
            categories: [
              { name: 'Watches', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Watches', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center', price: 999, discount: 60 },
              { name: 'Sunglasses', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Sunglasses', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&crop=center', price: 599, discount: 50 },
              { name: 'Belts', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Belts', image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop&crop=center', price: 399, discount: 45 },
              { name: 'Wallets', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Wallets', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop&crop=center', price: 699, discount: 40 },
              { name: 'Bags', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Bags', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 1299, discount: 35 },
              { name: 'Jewelry', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 799, discount: 55 },
              { name: 'Caps & Hats', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Caps-Hats', image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Scarves', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Scarves', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center', price: 499, discount: 45 },
              { name: 'Ties', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Ties', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center', price: 399, discount: 35 },
              { name: 'Hair Accessories', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Hair-Accessories', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center', price: 199, discount: 50 },
              { name: 'Phone Cases', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Phone-Cases', image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=400&fit=crop&crop=center', price: 299, discount: 40 },
              { name: 'Perfumes', href: '/search?category=Fashion&subcategory=Accessories&tertiaryCategory=Perfumes', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&crop=center', price: 899, discount: 45 }
            ]
          }
        };
        
        const subData = subcategoryData[sub as keyof typeof subcategoryData];
        if (subData) {
          const categoryList = ('categories' in subData ? subData.categories : undefined) as CategorySummary[] | undefined
          return (
            <div className="mb-8 space-y-8">
              <CategoryHeader 
                title={subData.title}
                description={subData.description}
                linkText="Shop Now"
                bannerImages={subData.images}
                bannerColor={subData.color}
                buttonColor={subData.button}
              />
              {Array.isArray(categoryList) && categoryList.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-8 text-center">{sub === 'Men' ? 'Men Categories' : sub === 'Women' ? 'Women Categories' : sub === 'Kids' ? 'Kids Categories' : sub === 'Accessories' ? 'Fashion Accessories' : sub + ' Categories'}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                    {categoryList.map((category) => (
                      <Link key={category.name} href={category.href} className="group block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                        <div className="relative aspect-square overflow-hidden">
                          <Image 
                            src={category.image} 
                            alt={category.name} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          {category.discount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                              {category.discount}% OFF
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <h4 className="text-sm font-bold mb-1">{category.name}</h4>
                            {category.price && (
                              <p className="text-xs opacity-90">Starting ₹{category.price}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          );
        }
      }
      
      // Handle other subcategories (non-fashion)
      const subcategoryTertiary = [...new Set(products
          .filter(p => p.subcategory === sub && p.tertiaryCategory)
          .map(p => p.tertiaryCategory!)
      )].map(tc => ({
          name: (tc as string).replace(/-/g, ' '),
          href: `/search?category=${opts.category}&subcategory=${sub}&tertiaryCategory=${tc}`,
          image: products.find(p => p.tertiaryCategory === tc)?.image || 'https://images.unsplash.com/photo-1617470732899-736c4f3a743b?q=80&w=800&auto=format&fit=crop',
          dataAiHint: (tc as string).toLowerCase()
      }));

      if(subcategoryTertiary.length === 0) return null;

      return <CategoryHeader 
            title={(sub as string).replace(/-/g, ' ')}
            description="Traditional and effective remedies for your health and well-being."
            linkText="Explore Now"
            bannerImages={[
                'https://images.unsplash.com/photo-1594495894542-a46cc73e081a?q=80&w=1200&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1704650312022-ed1a76dbed1b?q=80&w=1200&auto=format&fit=crop'
            ]}
            categories={subcategoryTertiary}
            bannerColor="bg-emerald-50"
            buttonColor="bg-emerald-700 hover:bg-emerald-800"
        />
  }
  
  const PageTitle = () => {
    if (opts.q) {
      return <h1 className="text-2xl font-bold mb-4">Search results for &quot;{opts.q}&quot;</h1>
    }
    
    if (opts.max && !opts.category) {
      return (
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Products Under ₹{opts.max}</h1>
          <p className="text-gray-600 mt-1">Great deals within your budget</p>
        </div>
      )
    }
    
    if (!opts.category && !showAllCategories) {
        return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Our Best Sellers</h1>
                <p className="text-gray-600 mt-1">Handpicked for you from our most popular items.</p>
            </div>
        )
    }

    if (!opts.category && showAllCategories) {
         return (
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Shop by Category</h1>
                <p className="text-gray-600 mt-1">Find what you're looking for from our wide selection of categories.</p>
            </div>
        )
    }

    const Breadcrumb = () => (
      <nav className="flex items-center text-sm text-gray-500 mb-4">
        <Link href="/search" className="hover:text-brand">Home</Link>
        {opts.category && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}`} className="hover:text-brand">
              {opts.category?.replace(/%20/g, ' ')}
            </Link>
          </>
        )}
        {opts.subcategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <Link href={`/search?category=${opts.category}&subcategory=${opts.subcategory}`} className="hover:text-brand">
              {opts.subcategory?.replace(/-/g, ' ')}
            </Link>
          </>
        )}
        {opts.tertiaryCategory && (
          <>
            <ChevronRight size={16} className="mx-1" />
            <span className="font-semibold text-gray-700">
                {opts.tertiaryCategory?.replace(/-/g, ' ')}
            </span>
          </>
        )}
      </nav>
    );

    return (
        <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="md:hidden flex items-center justify-center p-2 rounded-full hover:bg-gray-100">
                <ChevronLeft size={20} />
            </button>
            <Breadcrumb />
        </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
          <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => {
              setError(null);
              window.location.reload();
            }}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (!opts.q && !opts.category && !opts.subcategory && !opts.tertiaryCategory && !showAllCategories) {
      // Best Seller View
      return (
        <>
          <PageTitle />
          <div className="text-center mb-8 space-x-4">
            <Button onClick={() => router.push('/')} variant="outline">
              &larr; Back to Home
            </Button>
            <Button onClick={() => setShowAllCategories(true)} variant="outline">
              Or, Shop All Categories &rarr;
            </Button>
          </div>

          {/* Popular Categories Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Popular Categories</h2>
              <p className="text-gray-600">Shop from our most loved categories</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {/* Mobile Accessories */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0294.webp?updatedAt=1756627296166"
                    alt="Mobile Accessories"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-blue-600">Mobile Accessories</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Computer Accessories */}
              <Link href="/search?category=Tech&subcategory=Computer%20Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-50 to-green-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/e352de8b-cbde-4b0c-84d9-e7cefc7086fc.webp"
                    alt="Computer Accessories"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-green-600">Computer Accessories</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Audio */}
              <Link href="/search?category=Tech&subcategory=Audio" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_413ce869-b6ef-477c-8be8-b78545b87afb.webp?updatedAt=1757152313606"
                    alt="Audio"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-purple-600">Audio</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Lighting */}
              <Link href="/search?category=Tech&subcategory=Decor%20%26%20Lighting" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20itams%20part%202/02_5ba5639c-603e-428a-afe3-eefdc5f0f696.webp?updatedAt=1757157493441"
                    alt="Lighting"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-yellow-600">Lighting</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Power & Cables */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-50 to-orange-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/0260_otg_1.webp?updatedAt=1756627844923"
                    alt="Power & Cables"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-orange-600">Power & Cables</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>

              {/* Fans & Cooling */}
              <Link href="/search?category=Tech&subcategory=Accessories" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-50 to-cyan-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/12249d16-5521-4931-b03a-e672fc47fb87.webp?updatedAt=1757057794638"
                    alt="Fans & Cooling"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-cyan-600">Fans & Cooling</h3>
                <p className="text-xs text-gray-500">Tech</p>
              </Link>
            </div>
          </section>

          {/* Trending Products Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Top Products</h2>
              <p className="text-gray-600">Our most popular items this season</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
              {/* Kitchen Tools */}
              <Link href="/search?category=Home&subcategory=Kitchen%20Tools" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-red-50 to-red-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://ik.imagekit.io/b5qewhvhb/e%20commers/tach/electronics%20aaitams/05_af19803f-0274-4f7b-829b-3974c9c6365d.avif?updatedAt=1757139103515"
                    alt="Kitchen Tools"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-red-600">Kitchen Tools</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Kitchen Appliances */}
              <Link href="/search?category=New%20Arrivals&subcategory=Kitchen%20Appliances" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/17865..1.webp"
                    alt="Kitchen Appliances"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-emerald-600">Kitchen Appliances</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Home Appliances */}
              <Link href="/search?category=New%20Arrivals&subcategory=Home%20Appliances" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/4ce6bdd6-4139-4645-8183-d71554df6b88_38f14c77-c503-46cd-be19-4ae0e0c88eb0.webp"
                    alt="Home Appliances"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600">Home Appliances</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Cleaning Tools */}
              <Link href="/search?category=New%20Arrivals&subcategory=Cleaning%20Tools" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-50 to-teal-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/609b820c1ce70f90287cc903-large_1_c7125055-2828-46c0-b762-d19bfcdf24ea.webp"
                    alt="Cleaning Tools"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-teal-600">Cleaning Tools</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Health & Personal Care */}
              <Link href="/search?category=New%20Arrivals&subcategory=Health%20%26%20Personal%20Care" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-pink-50 to-pink-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/01_c87acdae-de5c-49b0-80e0-5e1af7ed7fa5.webp"
                    alt="Health & Personal Care"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-pink-600">Health & Personal Care</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>

              {/* Home Organization */}
              <Link href="/search?category=New%20Arrivals&subcategory=Home%20Organization" className="group block text-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden mb-4 transition-all duration-300 group-hover:scale-110">
                  <Image
                    src="https://Shopwave.b-cdn.net/new%20arival/07_24b9ce72-1c0c-4c5b-bf59-99fefbaa0619.webp"
                    alt="Home Organization"
                    fill
                    sizes="96px"
                    className="object-cover p-3"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-amber-600">Home Organization</h3>
                <p className="text-xs text-gray-500">Home</p>
              </Link>
            </div>
          </section>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bestSellers.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </>
      );
    }

    if (showAllCategories) {
      // All Categories View
       return (
        <>
            <PageTitle />
             <div className="text-center mb-8">
                <Button onClick={() => setShowAllCategories(false)} variant="outline">
                  &larr; Back to Best Sellers
                </Button>
            </div>
            <CategoryGrid categories={allCategoryLinks} />
        </>
       )
    }

    // Default Filtered View
    return (
      <div id="product-grid" className="scroll-mt-20">
        <div className="md:hidden">
          <CategoryPills />
        </div>
        <div className="grid md:grid-cols-[auto_1fr] gap-6">
          <AnimatePresence>
            {isFilterVisible && (
              <motion.aside 
                className="hidden md:block w-[240px]"
                initial={{ width: 0, opacity: 0, x: -100 }}
                animate={{ width: 240, opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="sticky top-24">
                  <Filters />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <section>
            <PageTitle />
            <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="md:hidden">
                        <Sheet open={isFilterOpen} onOpenChange={setFilterOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                <div className="p-4 overflow-y-auto">
                                    <h3 className="text-lg font-semibold mb-4">Filters</h3>
                                    <Filters />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setIsFilterVisible(!isFilterVisible)}
                      className="hidden md:inline-flex"
                    >
                      {isFilterVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                    </Button>
                    <div className="hidden sm:block">
                      <div className="text-sm text-gray-600">Showing {list.length} result{list.length === 1 ? '' : 's'}</div>
                      {opts.q && !opts.subcategory && <div className="text-xs text-gray-500">for &quot;{opts.q}&quot;</div>}
                    </div>
                </div>
              <SortBar />
            </div>
            {list.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {list.map((p, index) => (
                  <ProductCard key={`${p.id}-${index}`} p={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-10 rounded-xl border bg-white">
                    <p className="text-gray-600">No products found in this category.</p>
                    <p className="text-sm text-gray-500">But here are some related products you might like:</p>
                </div>
                
                {/* Show related products when category is empty */}
                {(() => {
                  let relatedProducts = [];
                  
                  // If searching in Tech category, show all tech products
                  if (opts.category === 'Tech') {
                    relatedProducts = products.filter(p => p.category === 'Tech' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Home category, show home products
                  else if (opts.category === 'Home') {
                    relatedProducts = products.filter(p => p.category === 'Home' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in New Arrivals category, show new arrivals products
                  else if (opts.category === 'New Arrivals') {
                    relatedProducts = products.filter(p => {
                      if (!p || !p.quantity || p.quantity <= 0) return false;
                      
                      return (p.category === 'New Arrivals' || 
                       p.subcategory === 'Diwali Special' ||
                       p.subcategory === 'Best Selling' ||
                       p.subcategory === 'Gifts' ||
                       p.category === 'Customizable' ||
                       p.subcategory === 'Pooja Essentials' ||
                       p.subcategory === 'LED Lights' ||
                       p.subcategory === 'Fragrance');
                    }).slice(0, 12);
                  }
                  // If searching in Customizable category, show customizable products
                  else if (opts.category === 'Customizable') {
                    relatedProducts = products.filter(p => p.category === 'Customizable' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Pooja category, show pooja products including dhoop and agarbatti from Home category
                  else if (opts.category === 'Pooja') {
                    relatedProducts = products.filter(p => 
                      (p.category === 'Pooja' || 
                       (p.category === 'Home' && p.subcategory === 'Puja-Essentials')) && p.quantity > 0
                    ).slice(0, 12);
                  }
                  // If searching in Fashion category, show fashion products
                  else if (opts.category === 'Fashion') {
                    relatedProducts = [...products.filter(p => p.category === 'Fashion' && p.quantity > 0), ...FASHION_PRODUCTS.filter(p => p.quantity > 0)].slice(0, 12);
                  }
                  // If searching in Food & Drinks category
                  else if (opts.category === 'Food & Drinks') {
                    relatedProducts = products.filter(p => p.category === 'Food & Drinks' && p.quantity > 0).slice(0, 12);
                  }
                  // If searching in Pooja category
                  else if (opts.category === 'Pooja') {
                    relatedProducts = products.filter(p => p.category === 'Pooja' && p.quantity > 0).slice(0, 12);
                  }
                  // Default: show popular products from all categories
                  else {
                    relatedProducts = products.filter(p => p.quantity > 0 && p.price.discounted).slice(0, 12);
                  }
                  
                  if (relatedProducts.length === 0) {
                    relatedProducts = products.filter(p => p.quantity > 0).slice(0, 12);
                  }
                  
                  return relatedProducts.length > 0 ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-center">Related Products</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {relatedProducts.map(p => (
                          <ProductCard key={p.id} p={p} />
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }
  
  return (
    <>
      {renderCategoryHeader()}
      {renderTertiaryCategoryHeader()}
      {renderContent()}
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><LoadingSpinner /></div>}>
      <SearchContent />
    </Suspense>
  )
}

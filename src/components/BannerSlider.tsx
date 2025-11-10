
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

const BANNERS = [
  { 
    id: 1, 
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center', 
    title: 'TRAVEL ACCESSORIES',
    subtitle: 'For Every Journey',
    discount: 'UP TO 85% OFF',
    link: '/search?category=Tech' 
  },
  { 
    id: 2, 
    img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop&crop=center', 
    title: 'CAR ACCESSORIES',
    subtitle: 'FOR EVERY VEHICLE',
    discount: 'From Rs. 10',
    link: '/search?category=Home' 
  },
  { 
    id: 3, 
    img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=200&fit=crop&crop=center', 
    title: 'HOME DECOR',
    subtitle: 'FOR EVERY ONE',
    discount: 'UP TO 80% OFF',
    link: '/search?category=Home' 
  }
]

export default function BannerSlider(){
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => { 
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % BANNERS.length)
    }, 5000)
    return () => clearInterval(timer) 
  }, [])
  
  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        <div 
          className="flex gap-4 transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 2.2)}%)` }}
        >
          {BANNERS.map((banner) => (
            <a
              key={banner.id}
              href={banner.link}
              className="flex-shrink-0 w-[45%] md:w-[48%] relative rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-blue-600 to-purple-700 h-28 md:h-36"
            >
              <div className="absolute inset-0">
                <Image 
                  src={banner.img} 
                  alt={banner.title} 
                  fill 
                  sizes="(max-width: 768px) 45vw, 48vw" 
                  className="object-cover opacity-75"
                  priority={banner.id === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
              </div>
              
              <div className="relative z-10 p-2 md:p-4 h-full flex flex-col justify-between text-white">
                <div>
                  <h3 className="text-xs md:text-sm font-bold leading-tight mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-[10px] md:text-xs opacity-90">
                    {banner.subtitle}
                  </p>
                </div>
                
                <div>
                  <div className="bg-red-500 text-white text-[10px] md:text-xs px-2 py-1 rounded-full mb-2 inline-block">
                    {banner.discount}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-3 gap-2">
        {BANNERS.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentIndex(i)} 
            className={`h-2 rounded-full transition-all duration-200 ${
              i === currentIndex 
                ? 'bg-blue-600 w-6' 
                : 'bg-gray-300 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

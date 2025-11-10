declare module '@/lib/types' {
  interface Product {
    price_original?: number;
    price_currency?: string;
    ratings_average?: number;
    ratings_count?: number;
    extraImages?: string[];
    features?: string[];
    [key: string]: any;
  }
}

export {};
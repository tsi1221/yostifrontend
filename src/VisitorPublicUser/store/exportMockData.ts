// ================================
// TYPES
// ================================
export interface Country {
  country_id: string;
  country_name: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  country_id: string;
}

export interface Product {
  product_id: string;
  product_name: string;
  category_id: string;
  product_description: string;
  hs_code?: string;
  images: string[];
  rating: number;
  producer: string;
  country_id: string;
}

// ================================
// MOCK DATA
// ================================
export const countries: Country[] = [
  { country_id: "c1", country_name: "USA" },
  { country_id: "c2", country_name: "Germany" },
  { country_id: "c3", country_name: "China" },
];

export const categories: Category[] = [
  { category_id: "cat1", category_name: "Electronics", country_id: "c1" },
  { category_id: "cat2", category_name: "Apparel", country_id: "c2" },
  { category_id: "cat3", category_name: "Toys", country_id: "c3" },
];

export const products: Product[] = [
  {
    product_id: "p1",
    product_name: "iPhone 14",
    category_id: "cat1",
    product_description: "Latest Apple smartphone with iOS.",
    hs_code: "8517",
    images: ["https://via.placeholder.com/400x300?text=iPhone+14"],
    rating: 5,
    producer: "Apple",
    country_id: "c1",
  },
  {
    product_id: "p2",
    product_name: "Samsung Galaxy S23",
    category_id: "cat1",
    product_description: "Flagship Samsung phone.",
    hs_code: "8517",
    images: ["https://via.placeholder.com/400x300?text=Galaxy+S23"],
    rating: 4,
    producer: "Samsung",
    country_id: "c3",
  },
  {
    product_id: "p3",
    product_name: "Nike Air Max",
    category_id: "cat2",
    product_description: "Comfortable sports shoes.",
    hs_code: "6404",
    images: ["https://via.placeholder.com/400x300?text=Nike+Air+Max"],
    rating: 4,
    producer: "Nike",
    country_id: "c2",
  },
];

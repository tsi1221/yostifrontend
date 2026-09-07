import { useState } from "react";
import {
  Search,
  Globe,
  MoreVertical,
  Coffee,
  Leaf,
  Truck,
  Zap,
  ShoppingBag,
  Box,
  Droplet,
  Factory,
  Diamond,
  Shield,
  Home,
  Car,
} from "lucide-react";

interface Category {
  name: string;
  icon: React.ElementType;
}

interface CountryData {
  country: string;
  region: string;
  subRegion: string;
  categories: Category[];
}

const mockCountryData: CountryData[] = [
  {
    country: "Ethiopia",
    region: "Africa",
    subRegion: "East Africa",
    categories: [
      { name: "Coffee, Tea & Spices", icon: Coffee },
      { name: "Oilseeds", icon: Leaf },
      { name: "Cut Flowers", icon: Droplet },
      { name: "Meat", icon: Shield },
      { name: "Vegetables", icon: Leaf },
      { name: "Industrial Equip.", icon: Factory },
      { name: "Apparel", icon: ShoppingBag },
      { name: "Leather", icon: Home },
    ],
  },
  {
    country: "China",
    region: "Asia",
    subRegion: "East Asia",
    categories: [
      { name: "Electronics", icon: Zap },
      { name: "Machinery", icon: Truck },
      { name: "Auto Parts", icon: Car },
      { name: "Plastics", icon: Box },
      { name: "Furniture", icon: Home },
      { name: "Iron & Steel", icon: Factory },
      { name: "Apparel", icon: ShoppingBag },
      { name: "Chemicals", icon: Droplet },
      { name: "Toys", icon: Diamond },
    ],
  },
  {
    country: "South Sudan",
    region: "Africa",
    subRegion: "East Africa",
    categories: [
      { name: "Crude Oil", icon: Droplet },
      { name: "Gold", icon: Diamond },
      { name: "Sesame Seeds", icon: Leaf },
      { name: "Livestock", icon: Shield },
      { name: "Gum Arabic", icon: Leaf },
      { name: "Wood Products", icon: Home },
    ],
  },
  {
    country: "Uganda",
    region: "Africa",
    subRegion: "East Africa",
    categories: [
      { name: "Gold", icon: Diamond },
      { name: "Coffee & Tea", icon: Coffee },
      { name: "Cereals", icon: Leaf },
      { name: "Petroleum", icon: Droplet },
      { name: "Ceramic", icon: Box },
      { name: "Cocoa", icon: Coffee },
      { name: "Fish & Seafood", icon: Droplet },
      { name: "Wood", icon: Home },
    ],
  },
];

const CategoryPill: React.FC<{ category: Category }> = ({ category }) => {
  const Icon = category.icon;

  return (
    <span className="flex items-center gap-1 px-3 py-1 bg-yellow-900/50 rounded-full text-xs font-medium text-yellow-300 transition hover:bg-yellow-800">
      <Icon className="w-3 h-3 text-yellow-400" />
      {category.name}
    </span>
  );
};

const RegionFilter: React.FC = () => {
  const regions = ["All Regions", "Africa", "Asia", "Europe", "Americas"];
  const [active, setActive] = useState("All Regions");

  return (
    <div className="flex flex-wrap gap-2">
      {regions.map((region) => (
        <button
          key={region}
          onClick={() => setActive(region)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
            active === region
              ? "bg-yellow-600 text-white shadow-lg shadow-yellow-600/40"
              : "bg-[#0f3952] text-gray-200 hover:bg-[#124465]"
          }`}
        >
          {region}
        </button>
      ))}
    </div>
  );
};

const CountryCard: React.FC<{ data: CountryData }> = ({ data }) => {
  return (
    <div className="p-6 rounded-xl shadow-xl transition hover:shadow-yellow-700/20"
         style={{ backgroundColor: "#0f3952" }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-700/50 rounded-full">
            <Globe className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{data.country}</h3>
            <p className="text-sm text-yellow-400">{data.subRegion}</p>
          </div>
        </div>

        <MoreVertical className="w-5 h-5 text-gray-300 hover:text-yellow-500 cursor-pointer" />
      </div>

      <h4 className="text-gray-300 text-sm font-semibold tracking-wider mb-3">
        Top Categories
      </h4>

      <div className="flex flex-wrap gap-2">
        {data.categories.map((cat, idx) => (
          <CategoryPill key={idx} category={cat} />
        ))}
      </div>
    </div>
  );
};

const Productt: React.FC = () => {
  return (
    <div className="min-h-screen p-8 md:p-12 font-sans" style={{ backgroundColor: "#0f3952" }}>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
          Country Export Product Categories
        </h1>
        <p className="text-lg text-gray-200 max-w-2xl mb-6">
          Browse top export products by country to guide your global sourcing
          strategy and identify reliable suppliers.
        </p>

        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />

            <input
              type="text"
              placeholder="Search countries or products..."
              className="w-full bg-yellow-900/60 border border-yellow-700/50 text-white placeholder-yellow-300/80 rounded-xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <RegionFilter />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-10">
        {mockCountryData.map((item) => (
          <CountryCard key={item.country} data={item} />
        ))}
      </div>
    </div>
  );
};

export default Productt;

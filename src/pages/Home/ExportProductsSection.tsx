import React, { useMemo, useState, useEffect } from "react";
import { Modal, ConfigProvider, theme, Pagination, Skeleton, Tag } from "antd";
import {
  EnvironmentOutlined,
  QuestionCircleOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

// ===================== IMPORT IMAGES =====================
import AsphaltMixing from "../../assets/aspalt.png";
import ConcreteBatching from "../../assets/aspalt.png";
import AsphaltPaver from "../../assets/cat.png";
import RoadRoller from "../../assets/aspalt.png";
import MotorGrader from "../../assets/aspalt.png";
import WheelLoader from "../../assets/77edf1778ed72567c0a663032debcc39.jpg";
import Excavator from "../../assets/cat.png";
import Bulldozer from "../../assets/cat.png";
import BackhoeLoader from "../../assets/cat.png";
import CrushingPlant from "../../assets/aspalt.png";
import MobileCrusher from "../../assets/cat.png";
import StoneCrusher from "../../assets/aspalt.png";
import SemiTrailer from "../../assets/cat.png";
import LowbedTrailer from "../../assets/aspalt.png";
import FlatbedTrailer from "../../assets/cat.png";
import DumpTrailer from "../../assets/aspalt.png";
import FuelTanker from "../../assets/cat.png";
import CementTrailer from "../../assets/aspalt.png";

// ===================== TYPES & DATA =====================
interface ProductItem {
  id: string;
  name: string;
  category: string;
  images: string[];
  condition: "New" | "Refurbished" | "Used";
  location: string;
  year: number;
  price: string;
  status: "Export-Ready" | "In Transit";
  description: string;
}

const INVENTORY: ProductItem[] = [
  { id: "DEBO-8800", name: "Asphalt Mixing Plants XCMG", category: "Asphalt Mixing Plants", images: [AsphaltMixing, AsphaltPaver], condition: "New", location: "Shanghai, CN", year: 2024, price: "45,000", status: "Export-Ready", description: "Premium asphalt mixing plant ready for export." },
  { id: "DEBO-8801", name: "Concrete Batching Plants SANY", category: "Concrete Batching Plants", images: [ConcreteBatching, CrushingPlant], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "46,200", status: "Export-Ready", description: "High-quality concrete batching plant." },
  { id: "DEBO-8802", name: "Asphalt Pavers XCMG", category: "Asphalt Pavers", images: [AsphaltPaver, Excavator], condition: "New", location: "Shanghai, CN", year: 2022, price: "47,400", status: "Export-Ready", description: "Reliable asphalt paver." },
  { id: "DEBO-8803", name: "Road Rollers XCMG", category: "Road Rollers", images: [RoadRoller, MotorGrader], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "40,000", status: "Export-Ready", description: "Durable road roller for projects." },
  { id: "DEBO-8804", name: "Motor Graders SANY", category: "Motor Graders", images: [MotorGrader, Bulldozer], condition: "New", location: "Shanghai, CN", year: 2024, price: "55,000", status: "Export-Ready", description: "Motor grader for heavy-duty projects." },
  { id: "DEBO-8805", name: "Wheel Loaders XCMG", category: "Wheel Loaders", images: [WheelLoader, BackhoeLoader], condition: "Refurbished", location: "Qingdao, CN", year: 2022, price: "50,500", status: "Export-Ready", description: "Efficient wheel loader for handling." },
  { id: "DEBO-8806", name: "Excavators SANY", category: "Excavators", images: [Excavator, Bulldozer], condition: "New", location: "Shanghai, CN", year: 2024, price: "60,000", status: "Export-Ready", description: "Powerful excavator." },
  { id: "DEBO-8807", name: "Bulldozers XCMG", category: "Bulldozers", images: [Bulldozer, RoadRoller], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "58,000", status: "Export-Ready", description: "Bulldozer for heavy construction." },
  { id: "DEBO-8808", name: "Backhoe Loaders SANY", category: "Backhoe Loaders", images: [BackhoeLoader, MobileCrusher], condition: "New", location: "Shanghai, CN", year: 2024, price: "42,000", status: "Export-Ready", description: "Versatile backhoe loader." },
  { id: "DEBO-8809", name: "Crushing & Screening Plants XCMG", category: "Crushing & Screening Plants", images: [CrushingPlant, StoneCrusher], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "70,000", status: "Export-Ready", description: "High-capacity crushing plant." },
  { id: "DEBO-8810", name: "Mobile Crushers SANY", category: "Mobile Crushers", images: [MobileCrusher, WheelLoader], condition: "New", location: "Shanghai, CN", year: 2024, price: "65,000", status: "Export-Ready", description: "Mobile crusher for flexible operations." },
  { id: "DEBO-8811", name: "Stone Crushers XCMG", category: "Stone Crushers", images: [StoneCrusher, ConcreteBatching], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "62,000", status: "Export-Ready", description: "Durable stone crusher." },
  { id: "DEBO-8812", name: "Semi-Trailers SANY", category: "Semi-Trailers", images: [SemiTrailer, FlatbedTrailer], condition: "New", location: "Shanghai, CN", year: 2024, price: "35,000", status: "Export-Ready", description: "Heavy-duty semi-trailer." },
  { id: "DEBO-8813", name: "Lowbed / Lowboy Trailers XCMG", category: "Lowbed / Lowboy Trailers", images: [LowbedTrailer, DumpTrailer], condition: "Refurbished", location: "Qingdao, CN", year: 2022, price: "38,000", status: "Export-Ready", description: "Lowbed trailer for heavy equipment." },
  { id: "DEBO-8814", name: "Flatbed Trailers SANY", category: "Flatbed Trailers", images: [FlatbedTrailer, FuelTanker], condition: "New", location: "Shanghai, CN", year: 2024, price: "33,000", status: "Export-Ready", description: "Flatbed trailer for cargo." },
  { id: "DEBO-8815", name: "Dump Trailers XCMG", category: "Dump Trailers", images: [DumpTrailer, CementTrailer], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "36,000", status: "Export-Ready", description: "Reliable dump trailer." },
  { id: "DEBO-8816", name: "Fuel Tanker Trailers SANY", category: "Fuel Tanker Trailers", images: [FuelTanker, SemiTrailer], condition: "New", location: "Shanghai, CN", year: 2024, price: "50,000", status: "Export-Ready", description: "Safe fuel tanker trailer." },
  { id: "DEBO-8817", name: "Cement Bulk Trailers XCMG", category: "Cement Bulk Trailers", images: [CementTrailer, LowbedTrailer], condition: "Refurbished", location: "Qingdao, CN", year: 2023, price: "48,000", status: "Export-Ready", description: "Bulk cement trailer." },
];

// ===================== COMPONENT =====================
const ProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredList = useMemo(() => {
    if (activeFilters.length === 0) return INVENTORY;
    return INVENTORY.filter(p => activeFilters.includes(p.category));
  }, [activeFilters]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (!selected) return;
    const total = selected.images.length;
    setCarouselIndex(prev => direction === "left" ? (prev - 1 + total) % total : (prev + 1) % total);
  };

  const CATEGORIES = Array.from(new Set(INVENTORY.map(p => p.category)));

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="min-h-screen bg-[#0A0A0B] text-white font-sans antialiased p-4 md:p-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-8">
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Inventory Categories</h3>
              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(cat)}
                      onChange={() => setActiveFilters(prev => prev.includes(cat) ? prev.filter(f => f !== cat) : [...prev, cat])}
                      className="w-4 h-4 accent-yellow-500"
                    />
                    <span className="text-[13px]">{cat}</span>
                  </label>
                ))}
              </div>
              {activeFilters.length > 0 && (
                <button onClick={() => setActiveFilters([])} className="mt-2 text-[10px] text-yellow-500 hover:text-white">Clear All</button>
              )}
            </section>

            <section className="bg-[#1C1C1F] border border-white/5 p-6 rounded-2xl">
              <QuestionCircleOutlined className="text-yellow-500 text-xl mb-4" />
              <h4 className="text-sm font-bold mb-2">Can't find a specific model?</h4>
              <p className="text-[12px] text-gray-400 mb-5">
                Our agents can locate any machinery or trailer from China within 48 hours.
              </p>
              <button onClick={() => navigate("/login")} className="w-full py-3 bg-yellow-500 text-black text-[11px] font-black uppercase rounded-xl">
                Request Sourcing
              </button>
            </section>
          </aside>

          {/* Main Grid */}
          <main className="lg:col-span-9">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-4xl font-black tracking-tighter">Live Inventory</h1>
                <p className="text-gray-500 text-sm">Direct export pricing from logistics hubs in China.</p>
              </div>
              <div className="bg-[#151518] px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filteredList.length} Units</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? [...Array(9)].map((_, i) => <Skeleton key={i} active paragraph={{ rows: 6 }} />) :
                paginatedList.map(item => (
                  <div key={item.id} className="group bg-[#151518] rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500 transition-all cursor-pointer" onClick={() => { setSelected(item); setCarouselIndex(0); }}>
                    <div className="relative h-52">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      <Tag color="gold" className="absolute top-2 left-2 border-0 font-bold px-2 py-0.5">{item.condition}</Tag>
                      <Tag icon={<EnvironmentOutlined />} className="absolute bottom-2 left-2 border-0 font-bold px-2 py-0.5 bg-black/50">{item.location}</Tag>
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-bold mb-2">{item.name}</h2>
                      <p className="text-xs text-gray-400 mb-2">{item.year} Model</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-white">${item.price}</span>
                        <button className="px-3 py-1 bg-yellow-500 text-black text-[11px] font-black rounded-lg">View</button>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>

            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={ITEMS_PER_PAGE}
                total={filteredList.length}
                onChange={page => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </main>
        </div>

        {/* Detail Modal */}
        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          footer={null}
          width={1000}
          centered
          styles={{ body: { padding: 0, backgroundColor: '#0D0D0E' } }}
        >
          {selected && (
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 relative">
                <img src={selected.images[carouselIndex]} alt={selected.name} className="w-full h-96 object-cover rounded-xl" />
                <button onClick={() => scrollCarousel("left")} className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white bg-black/30 p-3 rounded-full"><LeftOutlined /></button>
                <button onClick={() => scrollCarousel("right")} className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white bg-black/30 p-3 rounded-full"><RightOutlined /></button>

                <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                  {selected.images.map((img, i) => (
                    <div key={i} className={`w-20 h-20 rounded-lg border-2 ${i === carouselIndex ? 'border-yellow-500' : 'border-white/10'} cursor-pointer`}>
                      <img src={img} className="w-full h-full object-cover rounded-lg" onClick={() => setCarouselIndex(i)} />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-black">{selected.name}</h2>
                  <p className="text-gray-400 mb-4">{selected.description}</p>
                  <p className="text-sm text-gray-500">Location: {selected.location}</p>
                  <p className="text-sm text-gray-500">Status: {selected.status}</p>
                </div>
              </div>

              <div className="w-full lg:w-80 p-6 bg-[#121214] flex flex-col gap-4">
                <span className="text-yellow-500 text-2xl font-black">${selected.price}</span>
                <button onClick={() => navigate("/login")} className="w-full py-3 bg-yellow-500 text-black font-black uppercase rounded-xl">Request Quote</button>
                <button className="w-full py-3 bg-[#1C1C1F] text-white font-black uppercase rounded-xl border border-white/5">Chat With Agent</button>
              </div>
            </div>
          )}
        </Modal>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProductsSection;
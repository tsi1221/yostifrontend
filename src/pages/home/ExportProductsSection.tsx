
import React, { useMemo, useState, useEffect } from "react";
import { Modal, ConfigProvider, theme, Pagination, Skeleton, Tag } from "antd";
import {
  EnvironmentOutlined,
  QuestionCircleOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// ===================== IMPORT IMAGES =====================
import AsphaltMixing from "../../../public/assets/aspaltmix plant/Asphalt-Batch-Mix-Plant-Operation-and-Components.jpg";
import AsphaltPaver from "../../../public/assets/aspaltmix plant/Daswell-mobile-asphalt-mixing-plant.png";
import AsphaltPaver3 from "../../../public/assets/aspaltmix plant/IMG_4988-2-1024x731.jpg";

import aspaltpav from "../../../public/assets/apaltpav/CM20211208-4f233-813e2.jpg";
import aspaltpav1 from "../../../public/assets/apaltpav/CM20211220-167aa-6fcb5.jpg";

import ConcreteBatching from "../../../public/assets/concirute/1_belegrade-accumulative-concrete-batch-plants.jpg";
import CrushingPlant from "../../../public/assets/concirute/Concrete_plant.jpg";
import CrushingPlant2 from "../../../public/assets/concirute/Types-of-Concrete-Batching-Plant-01-0404030009.jpg";

import RoadRoller from "../../../public/assets/Road Rollers/360_F_1618550585_oDExgdOO2c8qWqnR1IHfQBbHaxw4X4pa.jpg";
import MotorGrader from "../../../public/assets/Road Rollers/360_F_207292361_oQEus3J0p3lqaZPfcGg0OIGIoEBBu0VY.jpg";

import CrushingPlant1 from "../../../public/assets/crushingScreen/metso-nordplant-modular-stationary-plants-881x586-web-1.jpg";
import CrushingPlant3 from "../../../public/assets/crushingScreen/screeningplants_vibratingscreens.jpg";

import MotorGraders from "../../../public/assets/motergar/DJI_20251216104737_0018_D.jpg";
import MotorGraders1 from "../../../public/assets/motergar/DJI_20251216104743_0019_D.jpg";
import MotorGraders2 from "../../../public/assets/motergar/DJI_20251216104912_0022_D.jpg";
import MotorGraders3 from "../../../public/assets/motergar/DJI_20251216104912_0022_D.jpg";
import MotorGraders4 from "../../../public/assets/motergar/DJI_20251216104934_0024_D.jpg";

import WheelLoader from "../../../public/assets/Wheel/3afa2d76dfe866583530b19abc635cbe.jpg";
import WheelLoader1 from "../../../public/assets/Wheel/IMG_7072.jpg";
import WheelLoader2 from "../../../public/assets/Wheel/IMG_7073.jpg";
import WheelLoader3 from "../../../public/assets/Wheel/IMG_7077.jpg";
import WheelLoader4 from "../../../public/assets/Wheel/IMG_7078.jpg";
import WheelLoader5 from "../../../public/assets/Wheel/IMG_7079.jpg";
import WheelLoader6 from "../../../public/assets/Wheel/IMG_7080.jpg";

import extravator from "../../../public/assets/Extravator/80f0b7c0f6134facbc26f539c189be0d.png";
import extravator1 from "../../../public/assets/Extravator/600x0_d0es3-44763-Screenshot-2022-11-15-at-11_59_03-AM.jpg";
import extravator2 from "../../../public/assets/Extravator/Hyundai-HX300A_HX-A-Series-Color-Scheme-copy-1024x640.jpg";
import extravator3 from "../../../public/assets/Extravator/IMG_0840.jpg";
import extravator4 from "../../../public/assets/Extravator/PC350_8M0_OG.jpg";
import extravator5 from "../../../public/assets/Extravator/ZX350LC-Front3qtrs-4612-with-trees_900x580.jpg";
import extravator6 from "../../../public/assets/Extravator/crawler-excavators-hx220al-hyundai.jpg";

import Bulldozer1 from "../../../public/assets/Bulldozer/C811296.jpg";
import Bulldozer2 from "../../../public/assets/Bulldozer/D360-Bulldozer.png";

import BackhoeLoader1 from "../../../public/assets/backhoe/02_203431.jpg";
import BackhoeLoader from "../../../public/assets/backhoe/6f5137e9-5c40-4b76-89c6-6e6275b6a5bc.jpg";
import BackhoeLoader2 from "../../../public/assets/backhoe/CM20220531-1cf35-89ea9.jpg";

import MobileCrusher from "../../../public/assets/mobilecrash/IROCK-TJ-2440-Render3.png";
import MobileCrusher1 from "../../../public/assets/mobilecrash/csm_RM_V550GO__crushing_gravel_2_2df1f3f77c.jpg";

import StoneCrusher from "../../../public/assets/stonecrash/stone-crusher-0002.jpg";

import SemiTrailer from "../../../public/assets/cat.png";

import LowbedTrailer1 from "../../../public/assets/LowbedTrailer/e7e5d61daabcd7b02fea619a7172f2bc.jpg";
import LowbedTrailer from "../../../public/assets/LowbedTrailer/Excavator-Transporter-Lowboy-Trailer-Trucks-Lowbed-Trailers-for-Sale.jpg";
import LowbedTrailer2 from "../../../public/assets/LowbedTrailer/53df1b4855fc1f5937beea3bed94bfaa.jpg";

import DumpTrailer from "../../../public/assets/DumpTrailer/IMG_7888.jpg";
import DumpTrailer1 from "../../../public/assets/DumpTrailer/IMG_7896.jpg";
import DumpTrailer2 from "../../../public/assets/DumpTrailer/IMG_7898.jpg";

import FlatbedTrailer from "../../../public/assets/cat.png";

import FuelTanker from "../../../public/assets/Fuel Tanker/1300-202410171400158620.jpg";
import FuelTanker1 from "../../../public/assets/Fuel Tanker/3-axles-45000liters-4-compartments-fuel-tanker-semi-trailers.jpg";
import FuelTanker2 from "../../../public/assets/Fuel Tanker/Petroleum Tanker Trailer.jpg";

import CementTrailer from "../../../public/assets/Cement Bulk/-cement-tanker-trailer--1-.jpg";
import CementTrailer1 from "../../../public/assets/Cement Bulk/Cement-Tanker-Trailer3.jpg";
import CementTrailer2 from "../../../public/assets/Cement Bulk/bulk_cement_trailer.jpg";

// ===================== TYPES & DATA =====================
interface ProductItem {
  id: string;
  name: string;
  category: string;
  images: string[];
  condition: "New" | "Refurbished" | "Used";
  location: string;
  year: number;
  status: "Export-Ready" | "In Transit";
  description: string;
}

const INVENTORY: ProductItem[] = [
  {
    id: "DEBO-8800",
    name: "Asphalt Mixing Plants XCMG",
    category: "Asphalt Mixing Plants",
    images: [AsphaltPaver3, AsphaltMixing, AsphaltPaver],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Premium asphalt mixing plant ready for export.",
  },
  {
    id: "DEBO-8801",
    name: "Concrete Batching Plants SANY",
    category: "Concrete Batching Plants",
    images: [CrushingPlant, ConcreteBatching, CrushingPlant2],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "High-quality concrete batching plant.",
  },
  {
    id: "DEBO-8802",
    name: "Asphalt Pavers XCMG",
    category: "Asphalt Pavers",
    images: [aspaltpav, aspaltpav1],
    condition: "New",
    location: "Shanghai, CN",
    year: 2022,
    status: "Export-Ready",
    description: "Reliable asphalt paver.",
  },
  {
    id: "DEBO-8803",
    name: "Road Rollers XCMG",
    category: "Road Rollers",
    images: [RoadRoller, MotorGrader],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "Durable road roller for projects.",
  },
  {
    id: "DEBO-8804",
    name: "Motor Graders SANY",
    category: "Motor Graders",
    images: [
      MotorGraders,
      MotorGraders4,
      MotorGraders1,
      MotorGraders2,
      MotorGraders3,
    ],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Motor grader for heavy-duty projects.",
  },
  {
    id: "DEBO-8805",
    name: "Wheel Loaders XCMG",
    category: "Wheel Loaders",
    images: [
      WheelLoader,
      WheelLoader6,
      WheelLoader1,
      WheelLoader2,
      WheelLoader3,
      WheelLoader4,
      WheelLoader5,
    ],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2022,
    status: "Export-Ready",
    description: "Efficient wheel loader for handling.",
  },
  {
    id: "DEBO-8813",
    name: "Excavators SANY",
    category: "Excavators",
    images: [
      extravator,
      extravator1,
      extravator2,
      extravator3,
      extravator4,
      extravator5,
      extravator6,
    ],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Powerful excavator.",
  },
  {
    id: "DEBO-8817",
    name: "Bulldozers XCMG",
    category: "Bulldozers",
    images: [Bulldozer2, Bulldozer1],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "Bulldozer for heavy construction.",
  },
  {
    id: "DEBO-8808",
    name: "Backhoe Loaders SANY",
    category: "Backhoe Loaders",
    images: [BackhoeLoader, BackhoeLoader1, BackhoeLoader2],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Versatile backhoe loader.",
  },
  {
    id: "DEBO-8809",
    name: "Crushing & Screening Plants XCMG",
    category: "Crushing & Screening Plants",
    images: [CrushingPlant3, CrushingPlant1],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "High-capacity crushing plant.",
  },
  {
    id: "DEBO-8810",
    name: "Mobile Crushers SANY",
    category: "Mobile Crushers",
    images: [MobileCrusher, MobileCrusher1],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Mobile crusher for flexible operations.",
  },
  {
    id: "DEBO-8811",
    name: "Stone Crushers XCMG",
    category: "Stone Crushers",
    images: [StoneCrusher],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "Durable stone crusher.",
  },
  {
    id: "DEBO-8812",
    name: "Semi-Trailers SANY",
    category: "Semi-Trailers",
    images: [SemiTrailer, FlatbedTrailer],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Heavy-duty semi-trailer.",
  },
  {
    id: "DEBO-8806",
    name: "Lowbed / Lowboy Trailers XCMG",
    category: "Lowbed / Lowboy Trailers",
    images: [LowbedTrailer, LowbedTrailer1, LowbedTrailer2],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2022,
    status: "Export-Ready",
    description: "Lowbed trailer for heavy equipment.",
  },
  {
    id: "DEBO-8815",
    name: "Dump Trailers XCMG",
    category: "Dump Trailers",
    images: [DumpTrailer, DumpTrailer1, DumpTrailer2],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "Reliable dump trailer.",
  },
  {
    id: "DEBO-8816",
    name: "Fuel Tanker Trailers SANY",
    category: "Fuel Tanker Trailers",
    images: [FuelTanker, FuelTanker1, FuelTanker2],
    condition: "New",
    location: "Shanghai, CN",
    year: 2024,
    status: "Export-Ready",
    description: "Safe fuel tanker trailer.",
  },
  {
    id: "DEBO-8807",
    name: "Cement Bulk Trailers XCMG",
    category: "Cement Bulk Trailers",
    images: [CementTrailer, CementTrailer1, CementTrailer2],
    condition: "Refurbished",
    location: "Qingdao, CN",
    year: 2023,
    status: "Export-Ready",
    description: "Bulk cement trailer.",
  },
];

// ===================== COMPONENT =====================
const ProductsSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selected, setSelected] = useState<ProductItem | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const ITEMS_PER_PAGE = 9;

  // ===================== SCROLL TO TOP =====================
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  // ===================== LOADING =====================
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);

    return () => clearTimeout(timer);
  }, []);

  // ===================== FILTER =====================
  const filteredList = useMemo(() => {
    if (activeFilters.length === 0) {
      return INVENTORY;
    }

    return INVENTORY.filter((product) =>
      activeFilters.includes(product.category)
    );
  }, [activeFilters]);

  // ===================== PAGINATION =====================
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;

    return filteredList.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  // ===================== CAROUSEL =====================
  const scrollCarousel = (direction: "left" | "right") => {
    if (!selected) return;

    const total = selected.images.length;

    setCarouselIndex((prev) =>
      direction === "left"
        ? (prev - 1 + total) % total
        : (prev + 1) % total
    );
  };

  // ===================== CATEGORIES =====================
  const CATEGORIES = Array.from(
    new Set(INVENTORY.map((product) => product.category))
  );

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="min-h-screen bg-[#0A0A0B] text-white font-sans antialiased p-4 md:p-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ===================== SIDEBAR ===================== */}
          <aside className="lg:col-span-3 space-y-8">
            <section>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
                {t("inventory.categoriesTitle")}
              </h3>

              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(category)}
                      onChange={() =>
                        setActiveFilters((prev) =>
                          prev.includes(category)
                            ? prev.filter((filter) => filter !== category)
                            : [...prev, category]
                        )
                      }
                      className="w-4 h-4 accent-yellow-500"
                    />

                    <span className="text-[13px]">
                      {t(`inventory.categories.${category}`, {
                        defaultValue: category,
                      })}
                    </span>
                  </label>
                ))}
              </div>

              {activeFilters.length > 0 && (
                <button
                  onClick={() => {
                    setActiveFilters([]);
                    setCurrentPage(1);
                  }}
                  className="mt-2 text-[10px] text-yellow-500 hover:text-white"
                >
                  {t("inventory.clearAll")}
                </button>
              )}
            </section>

            <section className="bg-[#1C1C1F] border border-white/5 p-6 rounded-2xl">
              <QuestionCircleOutlined className="text-yellow-500 text-xl mb-4" />

              <h4 className="text-sm font-bold mb-2">
                {t("inventory.helpTitle")}
              </h4>

              <p className="text-[12px] text-gray-400 mb-5">
                {t("inventory.helpBody")}
              </p>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-yellow-500 text-black text-[11px] font-black uppercase rounded-xl"
              >
                {t("inventory.requestSourcing")}
              </button>
            </section>
          </aside>

          {/* ===================== MAIN GRID ===================== */}
          <main className="lg:col-span-9">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-balance">
                  {t("inventory.title")}
                </h1>

                <p className="text-gray-500 text-sm">
                  {t("inventory.subtitle")}
                </p>
              </div>

              <div className="bg-[#151518] px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {t("inventory.units", { count: filteredList.length })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading
                ? [...Array(9)].map((_, index) => (
                    <Skeleton
                      key={index}
                      active
                      paragraph={{ rows: 6 }}
                    />
                  ))
                : paginatedList.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-[#151518] rounded-2xl overflow-hidden border border-white/5 hover:border-yellow-500 transition-all cursor-pointer"
                      onClick={() => {
                        setSelected(item);
                        setCarouselIndex(0);
                      }}
                    >
                      <div className="relative h-52">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />

                        <Tag
                          color="gold"
                          className="absolute top-2 left-2 border-0 font-bold px-2 py-0.5"
                        >
                          {t(`inventory.condition.${item.condition}`)}
                        </Tag>

                        <Tag
                          icon={<EnvironmentOutlined />}
                          className="absolute bottom-2 left-2 border-0 font-bold px-2 py-0.5 bg-black/50"
                        >
                          {item.location}
                        </Tag>
                      </div>

                      <div className="p-4">
                        <h2 className="text-lg font-bold mb-2">
                          {item.name}
                        </h2>

                        <p className="text-xs text-gray-400 mb-2">
                          {t("inventory.modelYear", { year: item.year })}
                        </p>

                        <button className="px-3 py-1 bg-yellow-500 text-black text-[11px] font-black rounded-lg">
                          {t("inventory.view")}
                        </button>
                      </div>
                    </div>
                  ))}
            </div>

            {/* ===================== PAGINATION ===================== */}
            <div className="flex justify-center mt-8">
              <Pagination
                current={currentPage}
                pageSize={ITEMS_PER_PAGE}
                total={filteredList.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
              />
            </div>
          </main>
        </div>

        {/* ===================== DETAIL MODAL ===================== */}
        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          footer={null}
          width={1000}
          centered
          styles={{
            body: {
              padding: 0,
              backgroundColor: "#0D0D0E",
            },
          }}
        >
          {selected && (
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-6 relative">
                <img
                  src={selected.images[carouselIndex]}
                  alt={selected.name}
                  className="w-full h-96 object-cover rounded-xl"
                />

                <button
                  onClick={() => scrollCarousel("left")}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 text-white bg-black/30 p-3 rounded-full"
                >
                  <LeftOutlined />
                </button>

                <button
                  onClick={() => scrollCarousel("right")}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-white bg-black/30 p-3 rounded-full"
                >
                  <RightOutlined />
                </button>

                <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                  {selected.images.map((image, index) => (
                    <div
                      key={index}
                      className={`w-20 h-20 rounded-lg border-2 ${
                        index === carouselIndex
                          ? "border-yellow-500"
                          : "border-white/10"
                      } cursor-pointer`}
                    >
                      <img
                        src={image}
                        alt={`${selected.name} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                        onClick={() => setCarouselIndex(index)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-black">
                    {selected.name}
                  </h2>

                  <p className="text-gray-400 mb-4">
                    {selected.description}
                  </p>

                  <p className="text-sm text-gray-500">
                    {t("inventory.location")}: {selected.location}
                  </p>

                  <p className="text-sm text-gray-500">
                    {t("inventory.status")}:{" "}
                    {t(`inventory.statusLabel.${selected.status}`)}
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-80 p-6 bg-[#121214] flex flex-col gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 bg-yellow-500 text-black font-black uppercase rounded-xl"
                >
                  {t("inventory.requestQuote")}
                </button>

                <button
                  onClick={() => navigate("/contact")}
                  className="w-full py-3 bg-[#1C1C1F] text-white font-black uppercase rounded-xl border border-white/5"
                >
                  {t("inventory.chatWithAgent")}
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ===================== CUSTOM SCROLLBAR ===================== */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 10px;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ProductsSection;

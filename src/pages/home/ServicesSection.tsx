import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  UserSwitchOutlined,
  ClusterOutlined,
  GlobalOutlined,
  DollarCircleOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface IService {
  icon: ReactElement;
  title: string;
  desc: string[];
}

const serviceIcons = [
  <UserSwitchOutlined />,
  <ClusterOutlined />,
  <GlobalOutlined />,
  <DollarCircleOutlined />,
  <SafetyCertificateOutlined />,
  <RocketOutlined />,
  <BarChartOutlined />,
];

const ServicesSection: React.FC = () => {
  const { t } = useTranslation();
  const translatedItems = t("services.items", {
    returnObjects: true,
  }) as Array<{ title: string; desc: string[] }>;

  const servicesData: IService[] = translatedItems.map((item, index) => ({
    icon: serviceIcons[index],
    title: item.title,
    desc: item.desc,
  }));
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    Array(servicesData.length).fill(false)
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const refs = cardRefs.current.filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = refs.indexOf(entry.target as HTMLDivElement);
            if (index !== -1 && !visibleCards[index]) {
              setVisibleCards((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    refs.forEach((ref) => observer.observe(ref));
    return () => refs.forEach((ref) => observer.unobserve(ref));
  }, [visibleCards]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 w-full" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-500 mb-32"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {t("services.title")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {servicesData.map((service, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                if (el) cardRefs.current[index] = el;
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: visibleCards[index] ? 1 : 0,
                y: visibleCards[index] ? 0 : 30,
                scale: activeIndex === index ? 1.05 : 1,
              }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center
                shadow-xl bg-white border border-gray-200 transition-all duration-700 transform`}
            >
              {/* ICON */}
              <div className="mb-4 sm:mb-6 flex justify-center items-center w-16 sm:w-20 h-16 sm:h-20 rounded-full 
                bg-[#0F3952] text-[#FFD700] text-2xl sm:text-3xl shadow-xl 
                backdrop-blur-xl bg-opacity-90 border border-yellow-300">
                {service.icon}
              </div>

              {/* TITLE */}
              <h3 className="text-xl sm:text-2xl font-semibold text-[#0F3952] mb-3 sm:mb-4">
                {service.title}
              </h3>

              {/* + / - BUTTON */}
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className={`w-10 h-10 flex items-center justify-center rounded-full
                  bg-[#FFD700] text-white text-2xl font-bold shadow-lg 
                  hover:bg-[#F2C700] transition-all transform ${
                    activeIndex === index ? "rotate-45" : ""
                  }`}
              >
                {activeIndex === index ? "−" : "+"}
              </button>

              {/* EXPAND PANEL */}
              <div
                className={`overflow-hidden transition-all duration-500 w-full ${
                  activeIndex === index ? "max-h-96 mt-4 sm:mt-6" : "max-h-0"
                }`}
              >
                <ul className="text-gray-700 text-sm sm:text-base text-left space-y-1 mt-2">
                  {service.desc.map((item, idx) => (
                    <li key={idx} className="ml-2 opacity-0 animate-fadeIn" style={{ animationDelay: `${idx * 150}ms` }}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation-name: fadeIn;
            animation-duration: 0.5s;
            animation-fill-mode: forwards;
          }
        `}
      </style>
    </section>
  );
};

export default ServicesSection;

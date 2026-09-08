import { useState } from 'react';
import { PlusOutlined, MinusOutlined, CheckCircleFilled } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const PRIMARY_BLUE = '#0F3952';
const ACCENT_YELLOW = '#FFC300';

interface Feature {
  id: number;
  title: string;
  description: string;
}

const WhyChoose: React.FC = () => {
  const { t } = useTranslation();
  const features: Feature[] = (
    t("whyChoose.items", { returnObjects: true }) as Array<{
      title: string;
      description: string;
    }>
  ).map((feature, index) => ({
    id: index + 1,
    ...feature,
  }));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const toggleAccordion = (id: number) =>
    setExpandedId(expandedId === id ? null : id);

  const firstColumn = features.slice(0, 4);
  const secondColumn = features.slice(4, 8);

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.6 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const accordionVariants = {
    collapsed: { opacity: 0, height: 0 },
    expanded: { opacity: 1, height: 'auto' },
  };

  return (
    <section className="relative bg-white overflow-hidden py-12 sm:py-20 lg:py-28">

      {/* Decorative Background */}
      <div
        className="absolute top-0 left-0 w-full h-[130px] sm:h-[260px] lg:h-[320px] rounded-b-[80px] sm:rounded-b-full opacity-90"
        style={{ backgroundColor: PRIMARY_BLUE }}
      />

      <motion.div
        className="relative max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >

        {/* Section Header (FIXED) */}
        <motion.div
          className="text-center mb-10 sm:mb-14 lg:mb-20 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          <h2
            className="font-extrabold text-2xl sm:text-4xl lg:text-5xl"
            style={{ color: ACCENT_YELLOW }}
          >
            {t("whyChoose.title")}
          </h2>

          <p
            className="mt-3 sm:mt-5 text-sm sm:text-lg lg:text-xl leading-relaxed px-2"
            style={{ color: ACCENT_YELLOW }}
          >
            {t("whyChoose.subtitle")}
          </p>
        </motion.div>

        {/* Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-12">
          {[firstColumn, secondColumn].map((column, colIndex) => (
            <motion.div
              key={colIndex}
              className="space-y-5 md:space-y-6 lg:space-y-8"
              variants={itemVariants}
            >
              {column.map((feature) => (
                <motion.div
                  key={feature.id}
                  className="border border-gray-200 rounded-xl shadow-md overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    className="flex w-full justify-between items-start sm:items-center gap-3 p-4 sm:p-6 lg:p-7 text-left bg-gray-50 hover:bg-gray-100"
                    onClick={() => toggleAccordion(feature.id)}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="bg-white p-2 sm:p-3 rounded-full shadow flex items-center justify-center shrink-0">
                        <CheckCircleFilled
                          style={{ fontSize: 20, color: ACCENT_YELLOW }}
                        />
                      </div>
                      <span
                        className="font-semibold text-sm sm:text-lg lg:text-xl leading-snug"
                        style={{ color: PRIMARY_BLUE }}
                      >
                        {feature.title}
                      </span>
                    </div>

                    <span className="text-gray-500 mt-1 sm:mt-0">
                      {expandedId === feature.id ? <MinusOutlined /> : <PlusOutlined />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedId === feature.id && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={accordionVariants}
                        transition={{ duration: 0.35 }}
                        className="bg-white px-4 sm:px-6 lg:px-7 pb-4 sm:pb-6"
                      >
                        <p
                          className="text-sm sm:text-base lg:text-lg leading-relaxed border-t border-dashed border-gray-200 pt-3 sm:pt-4"
                          style={{ color: PRIMARY_BLUE }}
                        >
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>

      </motion.div>
    </section>
  );
};

export default WhyChoose;

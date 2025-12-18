import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

// Assets
import Image1 from "../../assets/2c358e037651289d52005ff089be88cf.png";
import Image2 from "../../assets/2a6aa339b7e7245fdabe708b9c991e47.jpeg";
// ... other imports

const slides = [
  { id: 1, image: Image1 },
  { id: 2, image: Image2 },
  // Add other images here
];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate data/image loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [current, isLoading]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) return <HeroSkeleton />;

  return (
    <section className="relative w-full h-[80vh] min-h-[500px] lg:h-screen overflow-hidden bg-neutral-900">
      {/* Background Images with Zoom Effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${slides[current].image})` }}
        >
          {/* Dark Overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Container */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col justify-center">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-yellow-400 font-black text-3xl sm:text-5xl lg:text-7xl leading-tight uppercase tracking-tight"
          >
            Bridging Business <br /> 
            <span className="text-white">Between Africa & China</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 space-y-4 text-gray-200 text-base sm:text-lg lg:text-xl max-w-2xl"
          >
            <p>
              Yosti Import & Export Trading Co., Ltd. provides seamless sourcing 
              and logistics solutions for clients across the African continent.
            </p>
            <p className="font-medium text-yellow-400">
              Ensuring your goods arrive safely and on time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 bg-yellow-400 text-blue-950 font-bold rounded-sm hover:bg-yellow-300 transition-colors uppercase tracking-wider text-sm"
            >
              Start Now
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-10 py-4 border-2 border-white text-white font-bold rounded-sm hover:bg-white hover:text-black transition-all uppercase tracking-wider text-sm"
            >
              Contact Us
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Controls - Hidden on very small screens for better UX */}
      <div className="absolute bottom-10 right-10 hidden sm:flex gap-4 z-20">
        <button
          onClick={prevSlide}
          className="p-4 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all"
          aria-label="Previous slide"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={nextSlide}
          className="p-4 rounded-full border border-white/30 text-white hover:bg-white hover:text-black transition-all"
          aria-label="Next slide"
        >
          <RightOutlined />
        </button>
      </div>
    </section>
  );
};

/**
 * Skeleton Loader Component
 * Matches the layout of the Hero Section
 */
const HeroSkeleton = () => (
  <div className="relative w-full h-screen bg-neutral-800 animate-pulse flex flex-col justify-center px-6 sm:px-12 lg:px-20">
    <div className="max-w-4xl space-y-6">
      {/* Title Skeletons */}
      <div className="h-12 sm:h-20 bg-neutral-700 rounded-md w-3/4" />
      <div className="h-12 sm:h-20 bg-neutral-700 rounded-md w-1/2" />
      
      {/* Description Skeletons */}
      <div className="space-y-3 pt-4">
        <div className="h-4 bg-neutral-700 rounded w-full max-w-xl" />
        <div className="h-4 bg-neutral-700 rounded w-5/6 max-w-xl" />
      </div>

      {/* Button Skeletons */}
      <div className="flex gap-4 pt-8">
        <div className="h-14 w-40 bg-neutral-700 rounded-sm" />
        <div className="h-14 w-40 bg-neutral-700 rounded-sm" />
      </div>
    </div>
    
    {/* Navigation Skeletons */}
    <div className="absolute bottom-10 right-10 flex gap-4">
      <div className="h-12 w-12 rounded-full bg-neutral-700" />
      <div className="h-12 w-12 rounded-full bg-neutral-700" />
    </div>
  </div>
);

export default HeroSection;
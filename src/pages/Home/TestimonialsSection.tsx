import { useState } from "react";
import { Rate } from "antd";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

// Define TypeScript type for a testimonial
interface Testimonial {
  name: string;
  country: string;
  flag: string;
  photo: string;
  position: string;
  rating: number;
  text: string;
}

// Array of testimonials
const clientTestimonials = [
  {
    name: "Dawit G.",
    country: "Ethiopia",
    flag: "🇪🇹",
    photo:
      "https://img.freepik.com/premium-photo/professional-photo-linkedin-profile-picture-beautiful-looking-woman-light-color_1078199-10840.jpg?w=2000",
    rating: 5,
  },
  {
    name: "Samuel K.",
    country: "South Sudan",
    flag: "🇸🇸",
    photo:
      "https://www.bing.com/th/id/OIP.O-72BrZHTK1UNjhCIgxhPQHaHa?w=216&h=211&c=8&rs=1&qlt=90&o=6&cb=ucfimg1&dpr=1.5&pid=3.1&rm=2&ucfimg=1",
    rating: 5,
  },
  {
    name: "Mulu B.",
    country: "Ethiopia",
    flag: "🇪🇹",
    photo:
      "https://img.freepik.com/premium-photo/professional-photo-linkedin-profile-picture-beautiful-looking-woman-light-color_1078199-10840.jpg?w=2000",
    rating: 5,
  },
  {
    name: "Jane D.",
    country: "Kenya",
    flag: "🇰🇪",
    photo:
      "https://www.bing.com/th/id/OIP.O-72BrZHTK1UNjhCIgxhPQHaHa?w=216&h=211&c=8&rs=1&qlt=90&o=6&cb=ucfimg1&dpr=1.5&pid=3.1&rm=2&ucfimg=1",
    rating: 4,
  },
  {
    name: "Ahmed R.",
    country: "Egypt",
    flag: "🇪🇬",
    photo:
      "https://img.freepik.com/premium-photo/professional-photo-linkedin-profile-picture-beautiful-looking-woman-light-color_1078199-10840.jpg?w=2000",
    rating: 5,
  },
];

// Testimonial Card component with TypeScript props
interface TestimonialCardProps {
  testimonial: Testimonial;
  isCenter: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, isCenter }) => {
  const { name, photo, position, rating, text } = testimonial;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: isCenter ? 1.05 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className={`flex-shrink-0 w-80 rounded-xl p-6 text-gray-900 h-full cursor-pointer ${
        isCenter
          ? "bg-white border border-gray-300 shadow-2xl"
          : "bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
      }`}
    >
      <div className="flex flex-col items-start h-full">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={photo}
            alt={name}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-lg text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{position}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4 flex-grow">{text}</p>
        <Rate disabled defaultValue={rating} className="text-yellow-400 text-base" />
      </div>
    </motion.div>
  );
};

// Testimonials Page
const TestimonialsPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const visibleCount = 3;
  const translatedItems = t("testimonials.items", {
    returnObjects: true,
  }) as Array<{ position: string; text: string }>;

  const testimonials: Testimonial[] = clientTestimonials.map((item, index) => ({
    ...item,
    position: translatedItems[index]?.position ?? "",
    text: translatedItems[index]?.text ?? "",
  }));

  const total = testimonials.length;
  const indices = Array.from({ length: visibleCount }, (_, i) => (currentIndex + i) % total);
  const visibleTestimonials = indices.map((i) => testimonials[i]);
  const [direction, setDirection] = useState<number>(0);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section className="py-20 bg-white overflow-hidden relative min-h-[500px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-5xl font-bold text-yellow-500 mb-2 tracking-wider"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {t("testimonials.title")}
          </motion.h2>
        </div>

        <div className="relative">
          <div className="flex justify-center items-center">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex gap-6 justify-center"
            >
              {visibleTestimonials.map((t, idx) => (
                <TestimonialCard key={idx} testimonial={t} isCenter={idx === 1} />
              ))}
            </motion.div>
          </div>

          {/* Navigation */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-gray-100 text-gray-900 border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors duration-300"
          >
            &lt;
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-gray-100 text-gray-900 border border-gray-300 rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors duration-300"
          >
            &gt;
          </button>

          {/* Pagination */}
          <div className="flex justify-center mt-12 space-x-2">
            {clientTestimonials.map((_, i) => {
              const centerIndex = (currentIndex + 1) % total;
              return (
                <span
                  key={i}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                    i === centerIndex ? "bg-gray-900" : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => {
                    const newIndex = (i - 1 + total) % total;
                    if (newIndex !== currentIndex) {
                      setDirection(newIndex > currentIndex ? 1 : -1);
                      setCurrentIndex(newIndex);
                    }
                  }}
                ></span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPage;

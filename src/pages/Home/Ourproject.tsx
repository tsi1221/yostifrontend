import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LeftOutlined, RightOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

// --- Import your local assets here ---
import project1 from "../../../public/assets/construction.png";
import project2 from "../../../public/assets/fac.png";
import project3 from "../../../public/assets/agrin.png";
import project4 from "../../../public/assets/package.png";
import project5 from "../../../public/assets/toy.png";
import project6 from "../../../public/assets/87cb5f0c32788f098e4e22ae7d792af1.jpeg";
import project7 from "../../../public/assets/goverment.png";
import newhero from "../../../public/assets/heroman.png";

const projects = [
  { title: "Construction Machinery", category: "Heavy Equipment", img: project1, desc: "Container shipments of construction machinery and spare parts to Ethiopia." },
  { title: "Factory Sourcing", category: "Startup Support", img: project2, desc: "Factory sourcing and product development for startups in Ethiopia." },
  { title: "Agricultural Systems", category: "Agri-Tech", img: project3, desc: "Supply of agricultural tools and irrigation systems to rural farming cooperatives." },
  { title: "Packaging Solutions", category: "Logistics", img: project4, desc: "Food & Beverage packaging solutions delivered to clients in Kenya." },
  { title: "Educational Logistics", category: "Retail", img: project5, desc: "Toy sourcing and logistics for early childhood centers in Nigeria." },
  { title: "Door-to-Door Shipping", category: "Shipping", img: project6, desc: "Seamless door-to-door coordination from Yiwu to Addis Ababa." },
  { title: "Government Contracts", category: "Public Sector", img: project7, desc: "Repeat shipments and long-term contracts with government institutions." },
];

interface Project {
  title: string;
  category: string;
  img: string;
  desc: string;
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex-shrink-0 w-[300px] sm:w-[350px] h-[450px] rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100"
    >
      {/* Image Container */}
      <div className="absolute inset-0">
        <img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F3952] via-[#0F3952]/40 to-transparent opacity-90" />
      </div>

      {/* Card Content */}
      <div className="absolute bottom-0 left-0 p-6 w-full text-white">
        <span className="inline-block px-3 py-1 bg-yellow-400 text-[#0F3952] text-[10px] font-bold rounded-full uppercase tracking-widest mb-3">
          {project.category}
        </span>
        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {project.desc}
        </p>
        <div className="mt-4 flex items-center text-yellow-400 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all cursor-pointer">
          Learn More <ArrowRightOutlined className="ml-1" />
        </div>
      </div>
    </motion.div>
  );
};

const OURPROJECT: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);

  // Parallax effect for the header background
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* --- Professional Hero Section with Background Image --- */}
      <header ref={headerRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-black/70 z-10" /> {/* Blue Overlay */}
          <img 
            src={newhero} // High-end logistics/port image
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="relative z-20 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
              Our <span className="text-yellow-400">Projects</span>
            </h1>
            <div className="w-24 h-2 bg-yellow-400 mx-auto mb-8 rounded-full" />
            <p className="text-white text-lg md:text-xl leading-relaxed font-light opacity-90">
              Over the years, <span className="font-bold text-yellow-400">Yosti Import & Export Trading Co., Ltd.</span> has successfully
              completed a wide range of sourcing and shipping projects for clients across Africa.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- Carousel Section --- */}
      <section className="py-20 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#0F3952]">Proven Success</h2>
              <p className="text-gray-500 mt-2">Swipe to explore our international operations</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => scroll("left")}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-[#0F3952] hover:bg-yellow-400 hover:border-yellow-400 transition-all shadow-sm"
              >
                <LeftOutlined />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0F3952] text-white hover:bg-[#1a4a66] transition-all shadow-md"
              >
                <RightOutlined />
              </button>
            </div>
          </div>

          {/* Scrolling Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-10 no-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {projects.map((project, i) => (
              <div key={i} className="snap-center">
                <ProjectCard project={project} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Professional Conclusion Section --- */}
      <section className="py-20 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-[#0F3952] mb-6">Ready to expand your business?</h2>
          <p className="text-gray-600 mb-10 text-lg">
            Whether you need heavy machinery or retail consumer goods, our team handles 
            the complexity so you can focus on growth.
          </p>
         <Link
  to="/login"
  className="bg-[#0F3952] text-white px-12 py-4 rounded-full font-bold hover:bg-yellow-400 hover:text-[#0F3952] transition-all shadow-xl inline-block text-center"
>
  Discuss Your Project
</Link>
        </motion.div>
      </section>
    </div>
  );
};

export default OURPROJECT;
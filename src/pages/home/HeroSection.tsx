
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

/* =========================================================
   HERO IMAGES
========================================================= */

import HeroImage1 from "../../../public/assets/Hero.png";
import HeroImage2 from "../../../public/assets/87cb5f0c32788f098e4e22ae7d792af1.jpeg";
import HeroImage3 from "../../../public/assets/image7.png";

/* =========================================================
   HERO SLIDES
========================================================= */

const slides = [
  {
    id: 1,
    image: HeroImage1,
  },
  {
    id: 2,
    image: HeroImage2,
  },
  {
    id: 3,
    image: HeroImage3,
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  /* =======================================================
     LOADING
  ======================================================= */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* =======================================================
     NEXT SLIDE
  ======================================================= */

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  /* =======================================================
     PREVIOUS SLIDE
  ======================================================= */

  const prevSlide = () => {
    setCurrent(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  /* =======================================================
     AUTO PLAY
  ======================================================= */

  useEffect(() => {
    if (isLoading) return;

    const interval = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLoading]);

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (isLoading) {
    return (
      <div
        className="
          h-[520px]
          w-full
          animate-pulse
          bg-slate-950
        "
      />
    );
  }

  /* =======================================================
     HERO
  ======================================================= */

  return (
    <section
      className="
        relative
        h-[520px]
        w-full
        overflow-hidden
        bg-slate-950
        sm:h-[560px]
        lg:h-[620px]
      "
    >
      {/* ===================================================
          FULL BACKGROUND IMAGE
      ==================================================== */}

      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{
            opacity: 0,
            scale: 1.03,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.01,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="
            absolute
            inset-0
            bg-cover
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundImage: `url("${slides[current].image}")`,
          }}
        >
          {/* Dark overlay */}

          <div
            className="
              absolute
              inset-0
              bg-slate-950/35
            "
          />

          {/* Left readability gradient */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-slate-950/80
              via-slate-950/35
              to-transparent
            "
          />
        </motion.div>
      </AnimatePresence>

      {/* ===================================================
          MAIN CONTENT
      ==================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          max-w-[1440px]
          items-center
          px-5
          sm:px-10
          lg:px-16
        "
      >
        <div className="max-w-3xl">

          {/* =================================================
              TITLE
          ================================================== */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            className="
              text-4xl
              font-extrabold
              leading-[1.15]
              tracking-tight
              text-amber-400
              text-balance
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
          "
          >
            {t("hero.title")}
          </motion.h1>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.6,
            }}
            className="
              mt-7
              max-w-3xl
              text-base
              font-medium
              leading-7
              text-slate-100
              sm:text-lg
              sm:leading-8
              lg:text-xl
              lg:leading-9
            "
          >
            {t("hero.description")}
          </motion.p>

          {/* =================================================
              ACTION BUTTONS
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
              duration: 0.6,
            }}
            className="
              mt-9
              flex
              flex-wrap
              items-center
              gap-5
            "
          >
            {/* Start Now */}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="
                rounded-md
                bg-amber-400
                px-9
                py-4
                text-base
                font-bold
                tracking-wide
                text-black
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-amber-300
                hover:shadow-xl
              "
            >
              {t("hero.startNow")}
            </button>

            {/* Contact Us */}

            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="
                rounded-md
                border
                border-white
                bg-white
                px-9
                py-4
                text-base
                font-bold
                tracking-wide
                text-black
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-white
                hover:text-black
                hover:shadow-xl
              "
            >
              {t("hero.contactUs")}
            </button>
          </motion.div>
        </div>
      </div>

      {/* ===================================================
          SLIDE INDICATORS
      ==================================================== */}

      <div
        className="
          absolute
          bottom-7
          left-5
          z-20
          flex
          items-center
          gap-2
          sm:left-10
          lg:left-16
        "
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={t("hero.goToSlide", { number: index + 1 })}
            className={`
              h-1.5
              rounded-full
              transition-all
              duration-300
              ${
                current === index
                  ? "w-10 bg-amber-400"
                  : "w-5 bg-white/50 hover:bg-white"
              }
            `}
          />
        ))}
      </div>

      {/* ===================================================
          CAROUSEL CONTROLS
      ==================================================== */}

      <div
        className="
          absolute
          bottom-6
          right-5
          z-20
          flex
          gap-3
          sm:right-10
          lg:right-16
        "
      >
        {/* Previous */}

        <button
          type="button"
          onClick={prevSlide}
          aria-label={t("hero.prevSlide")}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/40
            bg-slate-900/50
            text-white
            backdrop-blur-sm
            transition-all
            duration-300
            hover:scale-110
            hover:border-amber-400
            hover:bg-amber-400
            hover:text-black
          "
        >
          <LeftOutlined className="text-xs" />
        </button>

        {/* Next */}

        <button
          type="button"
          onClick={nextSlide}
          aria-label={t("hero.nextSlide")}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/40
            bg-slate-900/50
            text-white
            backdrop-blur-sm
            transition-all
            duration-300
            hover:scale-110
            hover:border-amber-400
            hover:bg-amber-400
            hover:text-black
          "
        >
          <RightOutlined className="text-xs" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;

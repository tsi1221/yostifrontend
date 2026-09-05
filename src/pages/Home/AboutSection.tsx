
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  GlobalOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ShopOutlined,
} from "@ant-design/icons";

/* =========================================================
   IMAGES
========================================================= */

import heroImg from "../../../public/assets/downloaded-image (3).png";
import tradeImg1 from "../../../public/assets/cf520a97bd96593db79388b276303191.jpeg";
const founderImg = "/assets/mulu.png";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/* =========================================================
   COMPONENT
========================================================= */

const AboutPage: React.FC = () => {
  const [accordionOpen, setAccordionOpen] = useState<number | null>(
    null
  );

  const [readMore, setReadMore] = useState(false);

  /* =======================================================
     ALWAYS START PAGE FROM TOP
  ======================================================= */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  /* =======================================================
     WORKFLOW STEPS
  ======================================================= */

  const workflowSteps = [
    "Supplier verification & factory background checks",
    "Price negotiation based on real factory rates",
    "Quality inspection and product tests",
    "Secure international shipping & customs clearance",
    "After-sales support and dispute handling",
  ];

  /* =======================================================
     CORE VALUES
  ======================================================= */

  const coreValues = [
    {
      icon: SafetyCertificateOutlined,
      title: "Integrity",
      desc: "We do what is right—even when no one is watching. Trust is our foundation.",
    },
    {
      icon: GlobalOutlined,
      title: "Transparency",
      desc: "Clear communication and honest pricing are guaranteed. No hidden fees.",
    },
    {
      icon: ThunderboltOutlined,
      title: "Efficiency",
      desc: "We value your time. Our processes reduce delays and remove trade friction.",
    },
    {
      icon: ShopOutlined,
      title: "Growth",
      desc: "We succeed when our clients succeed. We build long-term relationships.",
    },
  ];

  /* =======================================================
     MISSION & VISION
  ======================================================= */

  const missionVision = [
    {
      title: "Mission",
      desc: "Our mission is to connect global markets with China through efficient, secure, and cost-effective trade solutions. We simplify international sourcing by delivering transparent processes, reliable partnerships, and full operational support at every stage.",
    },
    {
      title: "Vision",
      desc: "Our vision is to become a globally trusted trade partner, connecting businesses worldwide with Asia through strategic international sourcing and reliable logistics solutions. We strive to set the benchmark for professionalism, transparency, and customer satisfaction in global trade.",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full bg-white font-sans text-[#0F3952]">

      {/* ===================================================
          HERO
      ==================================================== */}

      <section className="relative h-[70vh] w-full overflow-hidden">

        <img
          src={heroImg}
          alt="Global Trade"
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            bg-black/60
            px-6
            text-center
          "
        >
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="
              max-w-5xl
              text-4xl
              font-extrabold
              leading-tight
              text-yellow-400
              drop-shadow-lg
              md:text-6xl
            "
          >
            Connecting the World Through Global Trade
          </motion.h1>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="
              mt-6
              max-w-3xl
              text-base
              leading-7
              text-yellow-400
              md:text-xl
              md:leading-8
            "
          >
            Yosti Import & Export provides secure, transparent,
            and efficient sourcing solutions between China and
            businesses worldwide, empowering companies to grow
            and trade across borders.
          </motion.p>
        </div>
      </section>

      {/* ===================================================
          ABOUT & MISSION
      ==================================================== */}

      <section
        className="
          container
          mx-auto
          grid
          items-center
          gap-16
          px-6
          py-20
          md:grid-cols-2
        "
      >
        {/* TEXT */}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
        >
          <h2 className="mb-6 text-3xl font-bold">
            About Yosti
          </h2>

          <p className="mb-4 text-base leading-7 text-gray-700">
            Yosti Import & Export Trading Co., Ltd. is a licensed
            global trading company based in China, dedicated to
            connecting businesses worldwide. With offices in
            Shanghai and Yiwu, we provide comprehensive trade
            solutions from sourcing, supplier verification, and
            factory tours to logistics, visa support, and
            after-sales service.
          </p>

          {/* READ MORE */}

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={
              readMore
                ? {
                    opacity: 1,
                    height: "auto",
                  }
                : {
                    opacity: 0,
                    height: 0,
                  }
            }
            transition={{
              duration: 0.6,
            }}
            className="overflow-hidden"
          >
            <p className="mt-2 text-base leading-7 text-gray-700">
              We specialize in supporting African entrepreneurs,
              businesses, and organizations that want to import
              from China safely, efficiently, and in a structured
              manner.
            </p>
          </motion.div>

          <button
            type="button"
            className="
              mt-3
              font-semibold
              text-yellow-400
              transition-colors
              hover:text-yellow-500
              hover:underline
            "
            onClick={() => setReadMore(!readMore)}
          >
            {readMore ? "Read Less" : "Read More"}
          </button>
        </motion.div>

        {/* IMAGE */}

        <motion.img
          src={tradeImg1}
          alt="About Yosti"
          className="
            w-full
            rounded-3xl
            border-4
            border-yellow-400
            object-cover
            shadow-xl
            transition-transform
            duration-500
            hover:scale-[1.03]
          "
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          whileInView={{
            opacity: 1,
            scale: 1,
          }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
          }}
        />
      </section>

      {/* ===================================================
          MISSION & VISION
      ==================================================== */}

      <section className="bg-gray-50 py-20">

        <div
          className="
            container
            mx-auto
            grid
            gap-10
            px-6
            md:grid-cols-2
          "
        >
          {missionVision.map((item, index) => (
            <motion.div
              key={item.title}
              className="
                rounded-3xl
                border-2
                border-yellow-400
                bg-white
                p-10
                shadow-lg
                transition-all
                duration-500
                hover:scale-[1.02]
                hover:shadow-2xl
              "
              initial={{
                opacity: 0,
                y: 50,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{ once: true }}
              transition={{
                delay: index * 0.2,
              }}
            >
              <h3 className="mb-4 text-2xl font-bold text-[#0F3952]">
                {item.title}
              </h3>

              <p className="leading-7 text-gray-700">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===================================================
          CORE VALUES
      ==================================================== */}

      <section className="py-20">

        <div className="container mx-auto px-6">

          <h2
            className="
              mb-12
              text-center
              text-3xl
              font-bold
              text-[#0F3952]
            "
          >
            Our Core Values
          </h2>

          <div className="grid gap-8 md:grid-cols-4">

            {coreValues.map((value, index) => {
              const Icon = value.icon;

              return (
                <motion.div
                  key={value.title}
                  className="
                    rounded-3xl
                    border-2
                    border-yellow-400
                    bg-white
                    p-8
                    text-center
                    shadow-lg
                    transition-all
                    duration-500
                    hover:scale-[1.03]
                    hover:shadow-2xl
                  "
                  initial={{
                    opacity: 0,
                    y: 50,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{ once: true }}
                  transition={{
                    delay: index * 0.2,
                  }}
                >
                  <Icon
                    className="
                      mx-auto
                      mb-4
                      text-5xl
                      text-yellow-400
                    "
                  />

                  <h4 className="mb-2 text-xl font-semibold">
                    {value.title}
                  </h4>

                  <p className="leading-7 text-gray-600">
                    {value.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================
          WORKFLOW
      ==================================================== */}

      <section className="bg-gray-50 px-6 py-24">

        <h2
          className="
            mb-16
            text-center
            text-3xl
            font-bold
            text-[#0F3952]
            md:text-4xl
          "
        >
          How We Work
        </h2>

        <div
          className="
            mx-auto
            grid
            max-w-7xl
            grid-cols-1
            gap-8
            md:grid-cols-2
          "
        >
          {workflowSteps.map((step, index) => {

            const isOpen = accordionOpen === index;

            return (
              <motion.div
                key={step}
                initial={{
                  opacity: 0,
                  x: -50,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1,
                }}
                className="
                  w-full
                  cursor-pointer
                  rounded-xl
                  border-l-4
                  border-yellow-400
                  bg-white
                  py-8
                  pl-8
                  pr-6
                  shadow-lg
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                  hover:bg-gray-100
                  md:pl-12
                "
                onClick={() =>
                  setAccordionOpen(
                    isOpen ? null : index
                  )
                }
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    text-lg
                    font-semibold
                    text-gray-800
                    md:text-xl
                  "
                >
                  <span>
                    Step {index + 1}
                  </span>

                  <span className="text-yellow-400">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>

                {isOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="
                      mt-6
                      flex
                      flex-col
                      gap-4
                      text-gray-700
                    "
                  >
                    <span
                      className="
                        text-3xl
                        font-bold
                        text-yellow-400
                      "
                    >
                      ✔
                    </span>

                    <span className="text-lg md:text-xl">
                      {step}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ===================================================
          FOUNDER
      ==================================================== */}

      <section
        className="
          mt-12
          border-t-2
          border-gray-200
          bg-white
          px-6
          py-20
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-4xl
            flex-col
            items-center
            gap-10
            md:flex-row
          "
        >
          {/* FOUNDER IMAGE */}

          <motion.img
            src={founderImg}
            alt="Mulubrhan Ayalew"
            className="
              h-44
              w-44
              rounded-full
              border-4
              border-yellow-400
              object-cover
              shadow-2xl
              transition-transform
              duration-500
              hover:scale-105
              md:h-56
              md:w-56
            "
            style={{
              boxShadow:
                "0 0 25px rgba(255, 223, 77, 0.7)",
              filter:
                "brightness(1.1) contrast(1.05)",
            }}
            initial={{
              opacity: 0,
              scale: 0.8,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
            }}
          />

          {/* FOUNDER CONTENT */}

          <motion.div
            className="flex-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h3
              variants={fadeUp}
              className="
                mb-2
                text-2xl
                font-bold
                text-[#0F3952]
                md:text-3xl
              "
            >
              Mulubrhan Ayalew, Founder & CEO
            </motion.h3>

            <motion.p
              variants={fadeUp}
              className="
                mb-4
                leading-relaxed
                text-gray-700
                md:text-lg
              "
            >
              “As an African entrepreneur living in China,
              I saw firsthand how hard it was for fellow
              African businesses to find reliable sourcing
              partners. Yosti was born to close that gap—with
              a promise of honesty, transparency, and total
              customer focus.”
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="
                font-semibold
                text-gray-600
                md:text-lg
              "
            >
              License Number: 91310000MADP0E2M4D
            </motion.p>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;

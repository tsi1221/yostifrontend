import { useState } from "react";
import { motion } from "framer-motion";
import {
  GlobalOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ShopOutlined,
} from "@ant-design/icons";

import heroImg from "../../assets/downloaded-image (3).png";
import tradeImg1 from "../../assets/cf520a97bd96593db79388b276303191.jpeg";
import founderImg from "../../assets/mulu.png";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const AboutPage: React.FC = () => {
  const [accordionOpen, setAccordionOpen] = useState<number | null>(null);
  const [readMore, setReadMore] = useState(false);

  const workflowSteps = [
    "Supplier verification & factory background checks",
    "Price negotiation based on real factory rates",
    "Quality inspection and product tests",
    "Secure international shipping & customs clearance",
    "After-sales support and dispute handling",
  ];

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

  return (
    <div className="w-full bg-white text-[#0F3952] font-sans">

      {/* HERO */}
      <section className="relative w-full h-[70vh]">
        <img
          src={heroImg}
          alt="Global Trade"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center px-6 text-center">
          <motion.h1
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-lg"
          >
            Connecting Africa With Global Trade
          </motion.h1>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-4 text-lg md:text-xl text-yellow-400 max-w-3xl mx-auto"
          >
            Yosti Import & Export provides secure, transparent, and efficient sourcing solutions between Africa and China — empowering businesses to scale across borders.
          </motion.p>
        </div>
      </section>

      {/* ABOUT & MISSION */}
      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-6">About Yosti</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Yosti Import & Export Trading Co., Ltd. is a licensed global trading company based in China, dedicated to bridging business between Africa and China. With offices in Shanghai and Yiwu, we provide comprehensive trade services—from sourcing, supplier verification, and factory tours to logistics, visa support, and after-sales service.
          </p>

          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={readMore ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden"
          >
            <p className="text-gray-700 leading-relaxed mt-2">
              We specialize in supporting African entrepreneurs, businesses, and organizations that want to import from China safely, efficiently, and in a structured manner.
            </p>
          </motion.div>

          <button
            className="mt-2 text-yellow-400 font-semibold hover:underline"
            onClick={() => setReadMore(!readMore)}
          >
            {readMore ? "Read Less" : "Read More"}
          </button>
        </motion.div>

        <motion.img
          src={tradeImg1}
          alt="About Yosti"
          className="rounded-3xl shadow-xl w-full object-cover border-4 border-yellow-400 hover:scale-105 transition-transform duration-500"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />
      </section>

      {/* MISSION & VISION */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10">
          {[
            {
              title: "Mission",
              desc: "Our mission is to connect Africa and the world with China through efficient, secure, and affordable trade solutions. We simplify global sourcing by offering transparent services and full operational support.",
            },
            {
              title: "Vision",
              desc: "Our vision is to become the most trusted and reliable trade bridge between Africa and Asia, enabling businesses to grow through strategic international sourcing and logistics. We aim to set the benchmark in professionalism and customer satisfaction.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="p-10 bg-white rounded-3xl shadow-lg border-2 border-yellow-400 hover:shadow-2xl hover:scale-105 transition-transform duration-500"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-[#0F3952]">{item.title}</h3>
              <p className="text-gray-700">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-[#0F3952]">Our Core Values</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {coreValues.map((val, i) => (
              <motion.div
                key={i}
                className="p-8 bg-white rounded-3xl shadow-lg border-2 border-yellow-400 hover:shadow-2xl hover:scale-105 transition-transform duration-500 text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <val.icon className="text-5xl text-yellow-400 mb-4 mx-auto" />
                <h4 className="text-xl font-semibold mb-2">{val.title}</h4>
                <p className="text-gray-600">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section className="bg-gray-50 py-24 px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3952] mb-16 text-center">How We Work</h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="w-full border-l-4 border-yellow-400 pl-10 md:pl-14 py-10 cursor-pointer hover:bg-gray-100 rounded-xl shadow-lg transition-all transform hover:scale-[1.03]"
              onClick={() => setAccordionOpen(accordionOpen === index ? null : index)}
            >
              <div className="flex justify-between items-center font-semibold text-gray-800 text-lg md:text-xl">
                <span>Step {index + 1}</span>
                <span className="text-yellow-400">{accordionOpen === index ? "▲" : "▼"}</span>
              </div>
              {accordionOpen === index && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                  className="mt-6 flex flex-col gap-4 text-gray-700"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-yellow-400 font-bold text-3xl"
                  >
                    ✔
                  </motion.span>
                  <span className="text-lg md:text-xl">{step}</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOUNDER */}
      <section className="bg-white py-20 px-6 mt-12 border-t-2 border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <motion.img
            src={founderImg}
            alt="Mulubrhan Ayalew"
            className="w-44 h-44 md:w-56 md:h-56 rounded-full border-4 border-yellow-400 object-cover shadow-2xl hover:scale-105 transition-transform duration-500"
            style={{
              boxShadow: "0 0 25px rgba(255, 223, 77, 0.7)",
              filter: "brightness(1.1) contrast(1.05)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="flex-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h3
              variants={fadeUp}
              className="text-2xl md:text-3xl font-bold text-[#0F3952] mb-2"
            >
              Mulubrhan Ayalew, Founder & CEO
            </motion.h3>
            <motion.p
              variants={fadeUp}
              className="text-gray-700 leading-relaxed mb-4 md:text-lg"
            >
              “As an African entrepreneur living in China, I saw firsthand how hard it was for fellow African businesses to find reliable sourcing partners. Yosti was born to close that gap—with a promise of honesty, transparency, and total customer focus.”
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-gray-600 font-semibold md:text-lg"
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

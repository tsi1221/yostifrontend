
import { motion, type Variants } from 'framer-motion';

// Import your images from your assets folder
import staff1 from '../../../public/assets/mulubrhan.png';
import staff2 from '../../../public/assets/fentanesh.png';
import staff3 from '../../../public/assets/Diana.png';
import staff4 from '../../../public/assets/chhina.png';

const staffMembers = [
  { name: "Mulubrhan Ayalew", role: "CEO", image: staff1 },
  { name: "Fantanesh Desalegn", role: "General Manager", image: staff2 },
  { name: "Diana Asgele", role: "Lawyer", image: staff3 },
  { name: "李飞红", role: "Operations", image: staff4 },
];

/**
 * Professional Container Variants
 * Uses staggerChildren to coordinate the "Wave" entrance effect
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

/**
 * Professional Card Variants
 * Combines Slide (x), Fade (opacity), and Zoom (scale) 
 * with a subtle Bounce (spring damping)
 */
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50, 
    scale: 0.9,
    filter: "blur(10px)" // Adds a high-end lens focus effect on entrance
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.8
    } 
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { delay: 0.3, duration: 0.5 } 
  }
};

const Staff = () => {
  return (
    <section className="bg-white py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight uppercase">
            <span className="text-yellow-500"> Experience & Our Professionals Team</span>
          </h2>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "48px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-yellow-400 mx-auto mt-3 rounded-full" 
          />
        </motion.div>

        {/* Staff Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {staffMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10 }} // Subtle bounce up on hover
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-50"
            >
              {/* Image Container with Zoom & Permanent Overlay */}
              <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                <motion.img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Permanent Professional Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
              </div>

              {/* Text Content with Slide-up Animation */}
              <motion.div 
                variants={textVariants}
                className="p-6 text-center relative bg-white"
              >
                <h3 className="text-lg font-extrabold text-slate-800 group-hover:text-yellow-600 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-slate-400 text-[10px] font-black mt-2 tracking-[0.25em] uppercase">
                  {member.role}
                </p>
                
                {/* Expandable Yellow Underline */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-yellow-400 group-hover:w-full transition-all duration-700 ease-in-out" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Staff;
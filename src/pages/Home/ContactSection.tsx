import React from "react";
import { Form, Input, Button, Select, message } from "antd";
import { EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { FaTelegramPlane, FaEnvelope, FaPhoneAlt, FaDirections } from "react-icons/fa";
import { SiTiktok, SiWechat } from "react-icons/si";
import headerImg from "../../assets/5823ec57d1038d4c4f62805e3151d728.jpeg";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const { Option } = Select;
const PRIMARY_COLOR = "#0F3952";
const ACCENT_COLOR = "#FACC15";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom map pin
const customPin = new L.DivIcon({
  html: `<div style="background:${PRIMARY_COLOR};color:white;padding:4px 8px;border-radius:6px;font-size:13px;text-align:center;margin-bottom:4px;">Office</div>
         <div style="width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:14px solid ${PRIMARY_COLOR};"></div>`,
  className: "",
  iconSize: [50, 50],
  iconAnchor: [25, 50],
});

// Office locations
interface Office {
  name: string;
  position: [number, number];
  address: string;
}
const offices: Office[] = [
  { name: "Shanghai Office", position: [31.2304, 121.4737], address: "Room A13, 10th Floor, No.1 Lane 1136, Xinzha Road, Jing’an District, Shanghai, China" },
  { name: "Yiwu Office", position: [29.3061, 120.0728], address: "Room 2106, Building 3, Zhongfu Plaza, Futian Street, Yiwu, Zhejiang Province, China" },
];

// Social links
interface SocialLink {
  icon: React.ReactNode;
  link: string;
}
const socialLinks: SocialLink[] = [
  { icon: <SiWechat />, link: "weixin://dl/chat?username=Yosti-Trade" },
  { icon: <FaTelegramPlane />, link: "https://t.me/Yostil0ve" },
  { icon: <SiTiktok />, link: "https://www.tiktok.com/@yosti.import.expo" },
  { icon: <FaEnvelope />, link: "mailto:info@yostiimportexport.com" },
  { icon: <FaPhoneAlt />, link: "tel:+8618621980391" },
];

// Fit map bounds
const FitBounds: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  React.useEffect(() => {
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, positions]);
  return null;
};

// Contact card component
interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}
const ContactCard: React.FC<ContactCardProps> = ({ icon, title, text }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-lg"
  >
    <div className="text-3xl mb-2" style={{ color: ACCENT_COLOR }}>{icon}</div>
    <h3 className="font-bold text-gray-800">{title}</h3>
    <p className="text-gray-500 text-sm break-words">{text}</p>
  </motion.div>
);

const ContactSection: React.FC = () => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    message.success("Your message has been sent successfully!");
    form.resetFields();
  };

  const contactInfo: ContactCardProps[] = [
    { icon: <EnvironmentOutlined />, title: "Shanghai Office", text: offices[0].address },
    { icon: <EnvironmentOutlined />, title: "Yiwu Office", text: offices[1].address },
    { icon: <PhoneOutlined />, title: "Phone / WhatsApp", text: "+86 186 2198 0391" },
    { icon: <MailOutlined />, title: "Email", text: "info@yostiimportexport.com" },
  ];

  return (
    <section className="w-full bg-gray-50" id="contact">
      {/* Header */}
      <motion.div className="w-full h-64 md:h-72 relative">
        <div style={{ backgroundImage: `url(${headerImg})` }} className="absolute inset-0 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#0F395280] flex items-center justify-center">
          <motion.h1
            className="text-3xl md:text-5xl font-extrabold text-yellow-400 text-center px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Contact Us
          </motion.h1>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">
        {/* Contact Form */}
        <motion.div
          className="flex-1 bg-white p-6 md:p-8 rounded-xl shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-[#0F3952] mb-6">General Contact Form</h2>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="Full Name" size="large" className="rounded-md border-gray-300" />
            </Form.Item>
            <Form.Item name="phone" label="Phone / WhatsApp" rules={[{ required: true }]}>
              <Input placeholder="Phone / WhatsApp" size="large" className="rounded-md border-gray-300" />
            </Form.Item>
            <Form.Item name="email" label="Email Address" rules={[{ required: true }, { type: "email" }]}>
              <Input placeholder="Email Address" size="large" className="rounded-md border-gray-300" />
            </Form.Item>
            <Form.Item name="topic" label="Message Topic" rules={[{ required: true }]}>
              <Select placeholder="Select Topic" size="large" className="rounded-md">
                <Option value="inquiry">Inquiry</Option>
                <Option value="complaint">Complaint</Option>
                <Option value="partnership">Partnership</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
            <Form.Item name="message" label="Message" rules={[{ required: true }]}>
              <Input.TextArea placeholder="Your Message" rows={6} className="rounded-md border-gray-300" />
            </Form.Item>
            <Form.Item>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full !bg-[#0F3952] text-white font-bold hover:bg-[#0d2f42] transition-all"
                  size="large"
                >
                  Send Message
                </Button>
              </motion.div>
            </Form.Item>
          </Form>
        </motion.div>

        {/* Contact Info & Social */}
        <motion.div
          className="flex-1 flex flex-col gap-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-[#0F3952]">Get In Touch</h2>
            <p className="text-gray-600">Our Shanghai and Yiwu teams assist with sourcing, logistics, and support.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {contactInfo.map((item, idx) => (
              <ContactCard key={idx} {...item} />
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0F3952] mb-3">Follow Us On</h3>
            <div className="flex gap-4 flex-wrap">
              {socialLinks.map((btn, idx) => (
                <motion.a
                  key={idx}
                  href={btn.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#0F3952] text-white text-lg shadow-md"
                  whileHover={{ scale: 1.2, rotate: 5, backgroundColor: "#0a2b46" }}
                >
                  {btn.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Map Section */}
      <motion.div
        className="w-full h-96 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <MapContainer
          center={offices[0].position}
          zoom={15}
          scrollWheelZoom={false}
          dragging={false}
          className="w-full h-full rounded-xl shadow-lg"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {offices.map((office) => (
            <Marker key={office.name} position={office.position} icon={customPin}>
              <Popup>
                <div className="font-bold">{office.name}</div>
                <div className="text-sm">{office.address}</div>
              </Popup>
            </Marker>
          ))}
          <FitBounds positions={offices.map((o) => o.position)} />
        </MapContainer>

        {/* Floating Google Maps Button */}
        <motion.a
          href={`https://www.google.com/maps/dir/?api=1&destination=${offices[0].position[0]},${offices[0].position[1]}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.1 }}
          className="absolute bottom-4 right-4 bg-[#0F3952] text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-[#0a2b46] transition-colors"
          title="Get Directions"
        >
          <FaDirections size={20} />
        </motion.a>
      </motion.div>
    </section>
  );
};

export default ContactSection;

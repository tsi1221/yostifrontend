import React from "react";
import { Form, Input, Button, Select, message } from "antd";
import { EnvironmentOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

import {
  FaTelegramPlane,
  FaEnvelope,
  FaPhoneAlt,
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";
import { SiWechat } from "react-icons/si";

import headerImg from "../../../public/assets/5823ec57d1038d4c4f62805e3151d728.jpeg";

const { Option } = Select;

const ACCENT_COLOR = "#FACC15";

// ================= Telegram Config =================
const TELEGRAM_BOT_TOKEN = "8181691703:AAHAxK-HW3GXwJ-WC8tTdv-xBwgj-BLPuIk";
const TELEGRAM_CHAT_ID = "5143972027";



// ================= Offices =================
interface Office {
  name: string;
  position: [number, number];
  address: string;
}

const offices: Office[] = [
  {
    name: "Shanghai Office",
    position: [31.2304, 121.4737],
    address:
      "Room A13, 10th Floor, No.1 Lane 1136, Xinzha Road, Jing’an District, Shanghai, China",
  },
  {
    name: "Yiwu Office",
    position: [29.3061, 120.0728],
    address:
      "Room 2106, Building 3, Zhongfu Plaza, Futian Street, Yiwu, Zhejiang Province, China",
  },
];

// ================= Social Links =================
interface SocialLink {
  icon: React.ReactNode;
  link: string;
}

const socialLinks: SocialLink[] = [
  {
    icon: <FaFacebookF />,
    link: "https://web.facebook.com/people/Yosti-Import-Export-Trading-Co-Ltd/61564161543733/",
  },
  { icon: <FaLinkedinIn />, link: "https://www.linkedin.com/in/mulubrhan" },
  { icon: <FaTelegramPlane />, link: "https://t.me/+8618621980391" },
  { icon: <SiWechat />, link: "weixin://dl/chat?username=Yosti-Import-Export-Trading-Co-Ltd" },
  { icon: <FaPhoneAlt />, link: "tel:+8618621980391" },
  { icon: <FaEnvelope />, link: "mailto:ayalewmuller@gmail.com" },
];

// ================= Contact Card =================
interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  text: React.ReactNode;
}

const ContactCard: React.FC<ContactCardProps> = ({ icon, title, text }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="flex flex-col items-center text-center p-5 bg-white rounded-xl shadow-lg"
  >
    <div className="text-3xl mb-2" style={{ color: ACCENT_COLOR }}>
      {icon}
    </div>
    <h3 className="font-bold text-gray-800">{title}</h3>
    <div className="text-gray-500 text-sm break-words leading-relaxed">{text}</div>
  </motion.div>
);

// ================= MAIN COMPONENT =================
const ContactSection: React.FC = () => {
  const [form] = Form.useForm();

  interface FormValues {
    name: string;
    phone: string;
    email: string;
    topic: string;
    message: string;
  }

  const handleSubmit = async (values: FormValues) => {
    const messageText = `
New Contact Form Submission:
Name: ${values.name}
Phone: ${values.phone}
Email: ${values.email}
Topic: ${values.topic}
Message: ${values.message}
    `;

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: messageText,
          }),
        }
      );

      const data = await res.json();

      if (data.ok) {
        message.success("Your message has been sent successfully!");
        form.resetFields();
      } else {
        message.error("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to send message. Please try again.");
    }
  };

  const contactInfo: ContactCardProps[] = [
    {
      icon: <EnvironmentOutlined />,
      title: "Shanghai Office",
      text: offices[0].address,
    },
    {
      icon: <EnvironmentOutlined />,
      title: "Yiwu Office",
      text: offices[1].address,
    },
    {
      icon: <PhoneOutlined />,
      title: "Call",
      text: (
        <>
          +86 186 2198 0391 <br />
          +86 131 2773 2480
        </>
      ),
    },
    {
      icon: <MailOutlined />,
      title: "Email",
      text: (
        <>
          ayalewmuller@gmail.com <br />
          muller@yostitrading.com
        </>
      ),
    },
  ];

  return (
    <section className="w-full bg-gray-50" id="contact">
      {/* ===== Header ===== */}
      <div className="w-full h-64 md:h-72 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${headerImg})` }}
        />
        <div className="absolute inset-0 bg-[#0F395280] flex items-center justify-center">
          <motion.h1
            className="text-3xl md:text-5xl font-extrabold text-slate-900  text-yellow-400"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Contact Us
          </motion.h1>
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <div className="flex-1 bg-white p-6 md:p-8 rounded-xl shadow-xl">
          <h2 className="text-2xl font-bold text-[#0F3952] mb-6">
            General Contact Form
          </h2>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item name="phone" label="Phone / WhatsApp" rules={[{ required: true }]}>
              <Input size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[{ required: true, type: "email" }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item name="topic" label="Message Topic" rules={[{ required: true }]}>
              <Select size="large">
                <Option value="inquiry">Inquiry</Option>
                <Option value="partnership">Partnership</Option>
                <Option value="complaint">Complaint</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item name="message" label="Message" rules={[{ required: true }]}>
              <Input.TextArea rows={6} />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full !bg-[#0F3952]"
            >
              Send Message
            </Button>
          </Form>
        </div>

        {/* Info + Social */}
        <div className="flex-1 flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold text-[#0F3952]">Get In Touch</h2>
            <p className="text-gray-600">
              Our Shanghai and Yiwu teams support sourcing, logistics, and export operations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {contactInfo.map((item, i) => (
              <ContactCard key={i} {...item} />
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#0F3952] mb-3">Follow Us</h3>
            <div className="flex gap-4 flex-wrap">
              {socialLinks.map((s, i) => (
                <motion.a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15 }}
                  className="w-10 h-10 rounded-full bg-[#0F3952] text-white flex items-center justify-center"
                >
                  {s.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

import React from "react";
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  InstagramOutlined,
  WechatOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { FaTelegram } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t("footer.company"),
      links: [
        { label: t("footer.aboutUs"), href: "/about" },
        { label: t("footer.ourProjects"), href: "/ourproject" },
        { label: t("footer.whyChooseUs"), href: "/about" },
        { label: t("footer.contact"), href: "/contact" },
      ],
    },
    {
      title: t("footer.ourServices"),
      links: [
        { label: t("footer.allServices"), href: "/services" },
        { label: t("footer.importServices"), href: "/services" },
        { label: t("footer.exportServices"), href: "/services" },
        { label: t("footer.consulting"), href: "/services" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.blogNews"), href: "/blog/news" },
        { label: t("footer.pdfForms"), href: "/blog/news" },
        { label: t("footer.licenseVerification"), href: "/blog/news" },
        { label: t("footer.developerSdk"), href: "/blog/news" },
      ],
    },
  ];

  return (
    <footer className="bg-[#0f3952] text-white w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col lg:flex-row justify-between gap-12">
          <div className="lg:w-1/3">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">
              {t("footer.brand")}
            </h3>

            <p className="text-gray-300 mb-8 leading-relaxed text-sm">
              {t("footer.tagline")}
            </p>

            <h4 className="text-lg font-semibold mb-3 text-white">
              {t("footer.stayUpdated")}
            </h4>
            <p className="text-gray-300 mb-3 text-xs">
              {t("footer.newsletter")}
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="p-3 bg-white text-gray-800 border-none outline-none w-full text-sm focus:ring-1 focus:ring-yellow-400"
              />
              <button className="bg-yellow-400 text-black px-6 py-3 font-medium text-sm hover:bg-yellow-300 transition shrink-0">
                {t("footer.subscribe")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 lg:w-2/3 mt-6 lg:mt-0">
            <div className="flex flex-col sm:flex-row gap-12">
              {columns.slice(0, 2).map((col, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold mb-4 text-white">
                    {col.title}
                  </h4>
                  <ul className="space-y-3">
                    {col.links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.href}
                          className="text-gray-300 text-sm hover:text-yellow-400 transition"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">
                {t("footer.resources")}
              </h4>
              <ul className="space-y-3">
                {columns[2].links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-gray-300 text-sm hover:text-yellow-400 transition"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}

                <li className="pt-6 space-y-2">
                  <p className="text-white font-semibold text-sm">
                    {t("footer.questions")}
                  </p>

                  <a
                    href="mailto:ayalewmuller@gmail.com"
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition flex items-center"
                  >
                    <MailOutlined className="mr-2" />
                    ayalewmuller@gmail.com
                  </a>

                  <a
                    href="mailto:muller@yostitrading.com"
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition flex items-center"
                  >
                    <MailOutlined className="mr-2" />
                    muller@yostitrading.com
                  </a>

                  <div className="text-gray-300 text-sm flex flex-col gap-1 mt-2">
                    <span className="flex items-center">
                      <PhoneOutlined className="mr-2" /> +86 186 2198 0391
                    </span>
                    <span className="flex items-center pl-5">
                      +86 131 2773 2480
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs">
                    {t("footer.responseTime")}
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <p className="text-white text-sm">{t("footer.followUs")}</p>
            <div className="flex space-x-5 text-xl">
              <a
                href="https://web.facebook.com/people/Yosti-Import-Export-Trading-Co-Ltd/61564161543733/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition"
              >
                <FacebookOutlined />
              </a>

              <a
                href="https://www.linkedin.com/in/mulubrhan"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition"
              >
                <LinkedinOutlined />
              </a>

              <a
                href="https://t.me/+8618621980391"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition"
              >
                <FaTelegram />
              </a>

              <a
                href="weixin://dl/chat?username=Yosti-Import-Export-Trading-Co-Ltd"
                className="hover:text-yellow-400 transition"
              >
                <WechatOutlined />
              </a>

              <a className="hover:text-yellow-400 transition opacity-50 cursor-not-allowed">
                <TwitterOutlined />
              </a>
              <a className="hover:text-yellow-400 transition opacity-50 cursor-not-allowed">
                <YoutubeOutlined />
              </a>
              <a className="hover:text-yellow-400 transition opacity-50 cursor-not-allowed">
                <InstagramOutlined />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end text-gray-400 text-xs">
            <p className="mr-2">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <span className="text-gray-500 hidden sm:inline">•</span>
            <div className="space-x-4 ml-4 flex flex-wrap justify-center">
              <a href="/about" className="hover:text-yellow-400 transition">
                {t("footer.privacy")}
              </a>
              <a href="/about" className="hover:text-yellow-400 transition">
                {t("footer.terms")}
              </a>
              <a href="/about" className="hover:text-yellow-400 transition">
                {t("footer.cookies")}
              </a>
              <a href="/about" className="hover:text-yellow-400 transition">
                {t("footer.accessibility")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

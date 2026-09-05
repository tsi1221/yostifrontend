
import React, { useState } from "react";
import {
  Button,
  ConfigProvider,
  Drawer,
  Menu,
} from "antd";
import {
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "../../i18n/LanguageSwitcher";

const BRAND_COLOR = "#0F3952";
const DRAWER_BG_COLOR = "#274C63";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [drawerVisible, setDrawerVisible] = useState(false);

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }

    return currentPath.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerVisible(false);
  };

  const linkClass = (path: string) =>
    isActive(path)
      ? "font-bold text-yellow-400"
      : "text-yellow-500 hover:text-yellow-400";

  const menuItems = [
    { key: "/", label: t("nav.home") },
    { key: "/about", label: t("nav.about") },
    { key: "/industries", label: t("nav.industries") },
    { key: "/services", label: t("nav.services") },
    { key: "/ourproject", label: t("nav.projects") },
    { key: "/staffs", label: t("nav.staff") },
    { key: "/blog/news", label: t("nav.blog") },
    { key: "/contact", label: t("nav.contact") },
  ].map((item) => ({
    key: item.key,
    label: <span className={linkClass(item.key)}>{item.label}</span>,
  }));

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemSelectedBg: "transparent",
            itemSelectedColor: "#FBBF24",
            itemHoverBg: "transparent",
            itemHoverColor: "#FBBF24",
            itemActiveBg: "transparent",
            itemColor: "#F59E0B",
          },
          Drawer: {
            colorText: "#FFFFFF",
            colorIcon: "#FFFFFF",
            colorIconHover: "#FBBF24",
          },
        },
      }}
    >
      <header
        className="sticky top-0 z-50 w-full shadow-md"
        style={{ backgroundColor: BRAND_COLOR }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => handleNavigation("/")}
            className="flex items-center border-none bg-transparent p-0"
            aria-label={t("nav.goHome")}
          >
            <img
              src="/assets/yostilogo.png"
              alt={t("nav.brand")}
              className="h-10 w-auto"
            />

            <span className="ml-1 text-2xl font-bold text-yellow-500">
              <span className="text-white">Y</span>
              osti
            </span>
          </button>

          <div className="hidden items-center lg:flex">
            <Menu
              mode="horizontal"
              items={menuItems}
              onClick={({ key }) => handleNavigation(String(key))}
              selectedKeys={[currentPath]}
              className="!border-none !bg-transparent"
              style={{ gap: "8px" }}
            />

            <div className="ml-4 flex items-center gap-2">
              <LanguageSwitcher />

              <Button
                icon={<LoginOutlined />}
                onClick={() => handleNavigation("/login")}
                className="
                  h-9
                  rounded-full
                  border-2
                  border-yellow-500
                  bg-transparent
                  px-4
                  font-semibold
                  !text-yellow-500
                  hover:!border-yellow-400
                  hover:!text-yellow-400
                "
              >
                {t("nav.login")}
              </Button>
            </div>
          </div>

          <div className="flex items-center lg:hidden">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="
                !text-2xl
                !text-yellow-400
                hover:!text-yellow-300
              "
              aria-label={t("nav.openMenu")}
            />
          </div>
        </div>
      </header>

      <Drawer
        title={
          <button
            type="button"
            onClick={() => handleNavigation("/")}
            className="flex items-center border-none bg-transparent p-0"
          >
            <img
              src="/assets/yostilogo.png"
              alt={t("nav.brand")}
              className="h-8 w-auto"
            />

            <span className="ml-2 text-xl font-bold text-yellow-500">
              <span className="text-white">Y</span>
              osti
            </span>
          </button>
        }
        placement="right"
        width={280}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        styles={{
          body: {
            backgroundColor: DRAWER_BG_COLOR,
          },
          header: {
            backgroundColor: BRAND_COLOR,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      >
        <Menu
          mode="inline"
          items={menuItems}
          onClick={({ key }) => handleNavigation(String(key))}
          selectedKeys={[currentPath]}
          className="!border-none !bg-transparent"
        />

        <div className="mt-6 px-4">
          <LanguageSwitcher variant="drawer" />
        </div>

        <div className="mt-5 px-4">
          <Button
            icon={<LoginOutlined />}
            block
            onClick={() => handleNavigation("/login")}
            className="
              h-10
              rounded-full
              border-2
              border-yellow-500
              bg-transparent
              font-semibold
              !text-yellow-500
              hover:!border-yellow-400
              hover:!text-yellow-400
            "
          >
            {t("nav.login")}
          </Button>
        </div>
      </Drawer>
    </ConfigProvider>
  );
};

export default Navbar;


import React, { useState } from "react";
import {
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Menu,
  Space,
} from "antd";
import {
  DownOutlined,
  FlagOutlined,
  GlobalOutlined,
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import type { MenuProps } from "antd";

const BRAND_COLOR = "#0F3952";
const DRAWER_BG_COLOR = "#274C63";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

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

  const handleLanguageSelect: MenuProps["onClick"] = ({ key }) => {
    setSelectedLanguage(String(key));
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      label: (
        <span
          className={
            isActive("/")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Home
        </span>
      ),
    },
    {
      key: "/about",
      label: (
        <span
          className={
            isActive("/about")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          About Us
        </span>
      ),
    },
    {
      key: "/industries",
      label: (
        <span
          className={
            isActive("/industries")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Industries
        </span>
      ),
    },
    {
      key: "/services",
      label: (
        <span
          className={
            isActive("/services")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Services
        </span>
      ),
    },
    {
      key: "/ourproject",
      label: (
        <span
          className={
            isActive("/ourproject")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Our Projects
        </span>
      ),
    },
    {
      key: "/staffs",
      label: (
        <span
          className={
            isActive("/staffs")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Staff
        </span>
      ),
    },
    {
      key: "/blog/news",
      label: (
        <span
          className={
            isActive("/blog/news")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Blog
        </span>
      ),
    },
    {
      key: "/contact",
      label: (
        <span
          className={
            isActive("/contact")
              ? "font-bold text-yellow-400"
              : "text-yellow-500 hover:text-yellow-400"
          }
        >
          Contact Us
        </span>
      ),
    },
  ];

  const languageMenuItems: MenuProps["items"] = [
    {
      key: "EN",
      label: (
        <Space>
          <FlagOutlined />
          English
        </Space>
      ),
    },
    {
      key: "AM",
      label: (
        <Space>
          <FlagOutlined />
          Amharic
        </Space>
      ),
    },
    {
      key: "CN",
      label: (
        <Space>
          <FlagOutlined />
          Chinese
        </Space>
      ),
    },
    {
      key: "OR",
      label: (
        <Space>
          <FlagOutlined />
          Oromiffa
        </Space>
      ),
    },
  ];

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
            aria-label="Go to homepage"
          >
            <img
              src="/assets/yostilogo.png"
              alt="Yosti Logo"
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
              <Dropdown
                menu={{
                  items: languageMenuItems,
                  onClick: handleLanguageSelect,
                }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="text"
                  className="flex items-center !text-yellow-500 hover:!text-yellow-400"
                >
                  <GlobalOutlined />
                  <DownOutlined className="ml-1" />
                  <span className="ml-1">{selectedLanguage}</span>
                </Button>
              </Dropdown>

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
                Login
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
              aria-label="Open navigation menu"
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
              alt="Yosti Logo"
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
          <div className="mb-2 text-sm font-semibold text-yellow-500">
            Select Language
          </div>

          <Menu
            mode="inline"
            items={languageMenuItems}
            onClick={handleLanguageSelect}
            selectedKeys={[selectedLanguage]}
            className="!border-none !bg-transparent"
          />
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
            Login
          </Button>
        </div>
      </Drawer>
    </ConfigProvider>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { Menu, Button, Dropdown, Space, ConfigProvider, Drawer } from "antd";
import {
  LoginOutlined,
  DownOutlined,
  GlobalOutlined,
  FlagOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import yostiLogo from "../../assets/yostilogo.png"; // Assuming this path is correct

const ACTIVE_COLOR = "text-yellow-400 font-bold";
const INACTIVE_COLOR = "text-yellow-500";
const HOVER_COLOR = "hover:text-yellow-400";
const BACKGROUND_COLOR = "#0F3952";
const DRAWER_BG_COLOR = "#274C63";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const isActive = (key: string) =>
    key === "/" ? currentPath === key : currentPath.startsWith(key);

  // Define the main navigation items
  const menuItems: MenuProps["items"] = [
    { label: "Home", key: "/" },
    { label: "About Us", key: "/about" },
    {
      label: "Industries",
      key: "/industries"
     
    },
    { label: "Services", key: "/services" },
    { label: "Our Projects", key: "/ourproject" },
    { label: "Blog", key: "/blog/news" },
    { label: "Contact Us", key: "/contact" },
  ].map((item) => ({
    ...item,
    // Custom label rendering for active/inactive styling
    label: (
      <span
        className={`${isActive(item.key as string) ? ACTIVE_COLOR : INACTIVE_COLOR} ${HOVER_COLOR} flex items-center`}
      >
        {item.label}
        {/* Adds a DownOutlined icon for submenus */}
        
      </span>
    ),
  }));

  // Define the language menu items
  const languageMenuItems: MenuProps["items"] = [
    { label: <Space className="ml-1 !text-yellow-500"><FlagOutlined /> English</Space>, key: "EN" },
    { label: <Space className="ml-1 !text-yellow-500"><FlagOutlined /> Amharic</Space>, key: "AM" },
    { label: <Space className="ml-1 !text-yellow-500"><FlagOutlined /> Chinese</Space>, key: "CN" },
    { label: <Space className="ml-1 !text-yellow-500"><FlagOutlined /> Oromiffa</Space>, key: "OR" },
  ];

  // Handler for all main menu clicks
  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    navigate(key);
    setDrawerVisible(false); // Close drawer on navigation
  };

  // Handler for language selection
  const handleLanguageSelect: MenuProps["onClick"] = ({ key }) => {
    setSelectedLanguage(key as string);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            // Custom styling for Ant Design Menu components
            itemSelectedBg: "transparent",
            itemSelectedColor: "#FBBF24",
            itemHoverBg: "transparent",
            itemHoverColor: "#FBBF24",
            itemActiveBg: "transparent",
            itemColor: "#F59E0B",
          },
          Drawer: {
            // Custom styling for Ant Design Drawer component
            colorText: "white",
            colorIcon: "white",
            colorIconHover: "#FBBF24",
          },
        },
      }}
    >
      <header className={`w-full shadow sticky top-0 z-50`} style={{ backgroundColor: BACKGROUND_COLOR }}>
        <div className="py-3 max-w-7xl mx-auto px-4 flex justify-between items-center">
          {/* Logo and Site Name */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={yostiLogo} alt="Yosti Logo" className="h-10 w-auto" />
            <span className="text-2xl font-bold ml-1 text-yellow-500"><span className="text-white">Y</span>osti</span>
          </div>

          {/* Large Screen Menu (Hidden below 'lg' breakpoint) */}
          <div className="hidden lg:flex items-center space-x-4">
            <Menu
              mode="horizontal"
              items={menuItems}
              onClick={handleMenuClick}
              selectedKeys={[currentPath]}
              // Overrides Ant Design's default background and border
              className="!border-none !text-yellow-500 !bg-transparent"
              style={{ gap: "8px" }} // Adds spacing between top-level items
            />
            <div className="flex items-center space-x-2 ml-2">
              {/* Language Dropdown */}
              <Dropdown
                menu={{ items: languageMenuItems, onClick: handleLanguageSelect }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button type="text" className={`${INACTIVE_COLOR} ${HOVER_COLOR} flex items-center px-1`}>
                  <GlobalOutlined className="ml-1 !text-yellow-500" />
                  <DownOutlined className="ml-1 !text-yellow-500" />
                  <span className="ml-1 !text-yellow-500">{selectedLanguage}</span>
                </Button>
              </Dropdown>

              {/* Login Button */}
              <Button
                icon={<LoginOutlined />}
                type="default"
                onClick={() => navigate("/login")}
                className={`rounded-full border-2 !text-yellow-500 ${INACTIVE_COLOR} hover:${HOVER_COLOR} border-yellow-500 hover:border-yellow-600 px-3 py-1 h-8 text-2xl bg-transparent`}
              >
                Login
              </Button>
            </div>
          </div>

          {/* Mobile Hamburger (Hidden on 'lg' breakpoint and up) */}
          <div className="lg:hidden flex items-center">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              className="text-yellow-400 font-bold text-2xl hover:text-yellow-300"
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Appears when hamburger is clicked) */}
      <Drawer
        title={
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src={yostiLogo} alt="Yosti Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold ml-2 !text-yellow-500"><span className="text-white">Y</span>osti</span>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ backgroundColor: DRAWER_BG_COLOR }}
      >
        {/* Main Menu inside Drawer */}
        <Menu
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          selectedKeys={[currentPath]}
          className="!bg-transparent !text-yellow-500 border-none"
        />

        {/* Language Selector inside Drawer */}
        <div className="mt-6 px-4">
          <div className="!text-yellow-500 text-sm font-medium mb-2">Select Language</div>
          <Menu
            mode="inline"
            items={languageMenuItems}
            onClick={handleLanguageSelect}
            selectedKeys={[selectedLanguage]}
            className="!bg-transparent border-none !text-yellow-500"
          />
        </div>

        {/* Login Button inside Drawer */}
        <div className="mt-4 px-4">
          <Button
            icon={<LoginOutlined />}
            type="default"
            onClick={() => {
              navigate("/login");
              setDrawerVisible(false);
            }}
            block
            className="rounded-full border-2 border-yellow-500 text-yellow-500 hover:border-yellow-400 hover:text-yellow-400 bg-transparent"
          >
            Login
          </Button>
        </div>
      </Drawer>
    </ConfigProvider>
  );
};

export default Navbar;
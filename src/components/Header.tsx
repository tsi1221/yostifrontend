import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { BellOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { Role } from "./Sidebar";
import yostiLogo from "../assets/yostilogo.png";

interface HeaderProps {
  role: Role;
  email: string;
  setRole: React.Dispatch<React.SetStateAction<Role | null>>;
}

const Header: React.FC<HeaderProps> = ({ role, email, setRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    navigate("/");
  };

  const menu = (
    <Menu
      items={[
        {
          key: "email",
          icon: <UserOutlined />,
          label: <span className="truncate max-w-[200px]">{email}</span>,
        },
        {
          key: "profile",
          icon: <UserOutlined />,
          label: "Profile",
        },
        {
          key: "logout",
          icon: <LogoutOutlined />,
          label: <span className="logout-text">Logout</span>,
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 h-16 flex items-center justify-between px-6 shadow-md bg-[#0F3952]">
      {/* Left: Logo + Yosti */}
      <div className="flex items-center gap-3 ml-2">
        <img src={yostiLogo} alt="Yosti Logo" className="h-8 w-auto object-contain" />
        <span className="text-yellow-400 font-bold text-lg truncate">Yosti</span>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          className="relative"
          icon={<BellOutlined style={{ fontSize: 20, color: "#fff" }} />}
        >
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <div className="flex items-center gap-2 cursor-pointer">
            <img
              src="https://via.placeholder.com/32"
              alt="Profile"
              className="rounded-full border border-white"
            />
            <span className="hidden md:inline font-medium text-white capitalize">
              {role.replace("-", " ")}
            </span>
          </div>
        </Dropdown>
      </div>

      <style>{`
        .logout-text {
          display: inline-block;
          width: 100%;
          padding: 6px 12px;
        }

        .logout-text:hover {
          background-color: transparent !important;
          color: inherit !important;
        }
      `}</style>
    </header>
  );
};

export default Header;

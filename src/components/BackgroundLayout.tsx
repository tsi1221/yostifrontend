import type { ReactNode } from "react";
import { HomeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import yostiLogo from "../assets/yostilogo.png";

interface AuthLayoutProps {
  children: ReactNode;
  showLeftPanel?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showLeftPanel = true }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex relative bg-gray-50">
      {/* Home Icon - Back to Landing Page */}
      <div
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 bg-[#0F3952] hover:bg-[#1a4f6e] p-3 rounded-full cursor-pointer z-50 shadow-lg transition-all"
      >
        <HomeOutlined style={{ color: "#EAB308", fontSize: "24px" }} />
      </div>

      {/* Left Panel: Branding & Visuals */}
      {showLeftPanel && (
        <div className="w-1/2 hidden lg:flex flex-col items-center justify-center bg-[#0F3952] relative overflow-hidden">
          {/* Subtle Background Decoration */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center justify-center px-10 text-center">
            <img 
              src={yostiLogo} 
              alt="Yosti Logo" 
              className="w-40 h-40 mb-8 drop-shadow-2xl" 
            />
            
            {/* Bold Yellow Branding */}
            <h1 className="text-5xl font-black text-yellow-500 mb-4 tracking-tight">
              Welcome to Yosti
            </h1>
            
            <p className="text-yellow-400 text-xl font-bold max-w-md leading-relaxed">
              Your gateway to seamless import-export solutions
            </p>

            <div className="mt-12 w-20 h-1 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
      )}

      {/* Right Panel: The Login/Register Form */}
      <div
        className={`w-full ${showLeftPanel ? "lg:w-1/2" : "w-full"} flex items-center justify-center p-8 bg-white md:bg-transparent`}
      >
        <div className="w-full flex justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
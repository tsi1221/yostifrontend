import type { ReactNode } from "react";
import { OrderedListOutlined, ShopOutlined, TruckOutlined, UserOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

type StaticsCardProps = {
  icon: ReactNode;
  name: string;
  num: number;
};

function StaticsCard({ icon, name, num }: StaticsCardProps) {
  return (
    <div className="bg-white min-h-28 w-full max-w-60 relative rounded-md shadow-md flex flex-col items-center justify-center pt-10 px-3 pb-4">
      <div className="bg-[#0F3952] text-yellow-400 w-16 h-16 flex items-center justify-center text-3xl rounded-full absolute -top-8">
        {icon}
      </div>

      <div className="flex flex-col items-center gap-1 mt-4 text-center">
        <p className="text-[#0F3952] text-3xl font-bold">{num}</p>
        <p className="text-[#0F3952] font-medium leading-snug">{name}</p>
      </div>
    </div>
  );
}

function Statics() {
  const { t } = useTranslation();

  const staticsData = [
    { icon: <OrderedListOutlined />, name: t("stats.ordersProcessed"), num: 124 },
    { icon: <UserOutlined />, name: t("stats.totalCustomers"), num: 879 },
    { icon: <TruckOutlined />, name: t("stats.activeShipments"), num: 312 },
    { icon: <ShopOutlined />, name: t("stats.totalSuppliers"), num: 56 },
  ];

  return (
    <div className="bg-black w-full py-16 flex justify-center items-center">
      <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-10 w-full max-w-6xl px-4 sm:px-6 lg:px-8 items-center justify-items-center">
        {staticsData.map((statics, index) => (
          <div key={index} className="w-full flex justify-center">
            <StaticsCard
              icon={statics.icon}
              name={statics.name}
              num={statics.num}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Statics;

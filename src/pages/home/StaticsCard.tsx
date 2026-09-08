import type { ReactNode } from "react";

type StaticsCardProps = {
  icon: ReactNode;
  name: string;
  num: number;
};

function StaticsCard({ icon, name, num }: StaticsCardProps) {
  return (
    <div className="bg-white w-60 h-28 relative rounded-md shadow-md flex flex-col items-cente pl-4 pt-10">
    
      <div className="bg-[#0021f5e9] text-white w-16 h-16 flex items-center justify-center text-3xl rounded-md absolute -top-8">
        {icon}
      </div>

      
      <div className="text-center  flex items-center gap-3">
        <p className="text-[#0021f5e9] text-3xl font-bold">{num}</p>
        <p className="uppercase text-gray-600  font-medium">{name}</p>
      </div>
    </div>
  );
}

export default StaticsCard;

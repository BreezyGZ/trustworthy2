"use client";

import { useRouter } from "next/navigation";

export default function Homepage3() {
  const router = useRouter();
  const goToResults = () => {
    router.push("/search");
  };

  return (
    <div className="h-screen w-full bg-orange-50 p-16 flex flex-col gap-16 items-center">
      <h1 className="text-7xl font-semibold text-black">
        Spot red flags, before you've even started
        </h1>
      <div className="flex items-center justify-center gap-16">
        <img 
          src="/img/cash-transaction.png" 
          alt="Tradie Scaffolding" 
          className="w-2/5 h-auto hidden lg:block" />
        <div className="flex flex-col w-1/2 text-4xl font-normal text-black gap-16">
          <span>
            For less than a takeaway meal, create peace of mind before you start the work by 
            checking on a business’ financial and occupational history.
            </span>
          <button 
            className="
              bg-black text-white w-1/2 px-4 py-6 rounded-2xl transition-all duration-200
              hover:bg-gray-800 hover:cursor-pointer hover:scale-105 
            "
            onClick={goToResults}
          >
            Show me how
          </button>
        </div>
      </div>
    </div>
  );
}



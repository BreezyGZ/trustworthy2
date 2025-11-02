export default function Homepage1() {
  return (
    <div 
      className="
        h-screen w-full flex items-center justify-center text-8xl font-bold text-black
        bg-[url('/img/tradie-scaffolding.png')] bg-no-repeat bg-cover bg-center font-sans font-normal
      "
      >
        <div className="absolute top-5 left-5 text-xl font-sans font-bold flex flex-col leading-tight">
          <span>TRUSTWORTHY</span>
          <span>SUBCONTRACTOR</span>
          <span>SOLUTIONS</span>
        </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 text-8xl font-sans font-medium">
        You deserve to be paid on time.
      </div>
    </div>
  );
}



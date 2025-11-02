export default function Homepage2() {
  return (
    <div className="h-screen w-full bg-orange-50 flex items-center justify-center gap-16 p-16">
      <div className="text-4xl font-normal text-black flex flex-col items-left justify-center w-full lg:w-1/2 gap-6">
        <span>
          Trustworthy’s mission is simple: to remove delays and discounts from the payments 
          received by construction small businesses, which make up a staggering 98% of the 
          entire industry.
        </span>
        <span>
          Trustworthy’s simple and effective digital tools increase transparency around your 
          payments and cut down payment times - and for a fraction of cost charged by our 
          competitors.
        </span>
        <span>
          We know you want to spend more time on the tools and less time around the table, 
          worrying about the financials. With Trustworthy, you can.
        </span>
        <span>
          Trust us.
        </span>
      </div>
      <img 
        src="/img/tradie-measuretape.png" 
        alt="Tradie Scaffolding" 
        className="w-2/5 h-auto hidden lg:block" 
      />
    </div>
  );
}



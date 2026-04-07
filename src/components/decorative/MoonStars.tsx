export const MoonStars = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crescent moon */}
    <circle cx="100" cy="100" r="50" fill="hsl(38 80% 75%)" />
    <circle cx="120" cy="85" r="42" fill="hsl(210 60% 95%)" className="dark:fill-[hsl(222,47%,11%)]" />
    {/* Stars */}
    <circle cx="45" cy="40" r="3" fill="hsl(38 80% 75%)" className="animate-twinkle" />
    <circle cx="160" cy="55" r="2.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "0.5s" }} />
    <circle cx="140" cy="150" r="2" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "1s" }} />
    <circle cx="55" cy="160" r="3.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "1.5s" }} />
    <circle cx="170" cy="30" r="2" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "2s" }} />
  </svg>
);

export const FloatingZzz = () => (
  <div className="relative w-12 h-12">
    <span className="absolute text-primary font-heading font-bold text-xs animate-float-up" style={{ left: 4, top: 0, animationDelay: "0s", animationIterationCount: "infinite" }}>Z</span>
    <span className="absolute text-primary/70 font-heading font-bold text-sm animate-float-up" style={{ left: 14, top: 6, animationDelay: "0.5s", animationIterationCount: "infinite" }}>z</span>
    <span className="absolute text-primary/40 font-heading font-bold text-base animate-float-up" style={{ left: 24, top: 2, animationDelay: "1s", animationIterationCount: "infinite" }}>Z</span>
  </div>
);

export const SleepingBabyNest = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Nest */}
    <ellipse cx="80" cy="95" rx="60" ry="20" fill="hsl(30 40% 75%)" />
    <ellipse cx="80" cy="95" rx="50" ry="14" fill="hsl(30 50% 82%)" />
    {/* Baby body (blanket) */}
    <ellipse cx="80" cy="78" rx="30" ry="18" fill="hsl(210 60% 88%)" />
    {/* Baby head */}
    <circle cx="80" cy="60" r="16" fill="hsl(25 60% 85%)" />
    {/* Eyes closed */}
    <path d="M73 60 Q76 63 79 60" stroke="hsl(222 47% 30%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M81 60 Q84 63 87 60" stroke="hsl(222 47% 30%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Tiny smile */}
    <path d="M77 66 Q80 69 83 66" stroke="hsl(340 60% 65%)" strokeWidth="1" strokeLinecap="round" fill="none" />
    {/* Cheek blush */}
    <circle cx="72" cy="64" r="3" fill="hsl(340 60% 80%)" opacity="0.5" />
    <circle cx="88" cy="64" r="3" fill="hsl(340 60% 80%)" opacity="0.5" />
  </svg>
);

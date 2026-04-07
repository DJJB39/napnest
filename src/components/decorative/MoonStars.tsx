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
    <span className="absolute text-primary font-display font-bold text-sm animate-float-up" style={{ left: 4, top: 0, animationDelay: "0s", animationIterationCount: "infinite" }}>Z</span>
    <span className="absolute text-primary/70 font-display font-bold text-base animate-float-up" style={{ left: 14, top: 6, animationDelay: "0.5s", animationIterationCount: "infinite" }}>z</span>
    <span className="absolute text-primary/40 font-display font-bold text-lg animate-float-up" style={{ left: 24, top: 2, animationDelay: "1s", animationIterationCount: "infinite" }}>Z</span>
  </div>
);

export const SleepingBabyNest = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 300 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Background glow */}
    <circle cx="150" cy="140" r="120" fill="hsl(210 60% 95%)" opacity="0.4" />

    {/* Crescent moon top-right */}
    <circle cx="230" cy="50" r="30" fill="hsl(38 80% 78%)" />
    <circle cx="245" cy="40" r="26" fill="hsl(270 40% 94%)" className="dark:fill-[hsl(222,47%,11%)]" />

    {/* Stars scattered */}
    <circle cx="60" cy="30" r="3" fill="hsl(38 80% 75%)" className="animate-twinkle" />
    <circle cx="120" cy="18" r="2" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "0.7s" }} />
    <circle cx="200" cy="25" r="2.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "1.2s" }} />
    <circle cx="270" cy="90" r="2" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
    <circle cx="40" cy="80" r="2.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "1.8s" }} />
    <circle cx="260" cy="140" r="1.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "2.2s" }} />
    {/* Star sparkle shapes */}
    <path d="M85 50 L87 44 L89 50 L95 48 L89 52 L91 58 L87 54 L83 58 L85 52 L79 48Z" fill="hsl(38 80% 80%)" className="animate-twinkle" style={{ animationDelay: "0.5s" }} />
    <path d="M180 10 L181.5 6 L183 10 L187 9 L183 12 L184.5 16 L181.5 13 L178.5 16 L180 12 L176 9Z" fill="hsl(38 80% 80%)" className="animate-twinkle" style={{ animationDelay: "1.5s" }} />

    {/* Fluffy cloud nest - layered puffs */}
    <ellipse cx="150" cy="210" rx="110" ry="40" fill="hsl(210 40% 92%)" />
    <circle cx="70" cy="195" r="30" fill="hsl(210 50% 90%)" />
    <circle cx="110" cy="185" r="35" fill="hsl(210 45% 92%)" />
    <circle cx="155" cy="182" r="38" fill="hsl(330 30% 93%)" />
    <circle cx="200" cy="185" r="34" fill="hsl(210 45% 91%)" />
    <circle cx="235" cy="195" r="28" fill="hsl(210 50% 90%)" />
    {/* Inner nest softness */}
    <ellipse cx="150" cy="200" rx="80" ry="28" fill="hsl(330 40% 95%)" />

    {/* Baby body (blanket) - soft blue-pink gradient look */}
    <ellipse cx="150" cy="185" rx="45" ry="25" fill="hsl(210 60% 88%)" />
    <ellipse cx="150" cy="185" rx="40" ry="22" fill="hsl(330 40% 92%)" />

    {/* Baby head */}
    <circle cx="150" cy="152" r="26" fill="hsl(25 60% 85%)" />
    {/* Hair wisps */}
    <path d="M133 140 Q138 125 150 130 Q155 120 160 132 Q168 126 167 140" stroke="hsl(30 40% 55%)" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Eyes closed - cute curves */}
    <path d="M139 152 Q143 157 147 152" stroke="hsl(222 47% 30%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M153 152 Q157 157 161 152" stroke="hsl(222 47% 30%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    {/* Eyelashes */}
    <line x1="139" y1="152" x2="137" y2="149" stroke="hsl(222 47% 30%)" strokeWidth="1" strokeLinecap="round" />
    <line x1="161" y1="152" x2="163" y2="149" stroke="hsl(222 47% 30%)" strokeWidth="1" strokeLinecap="round" />

    {/* Tiny smile */}
    <path d="M145 161 Q150 166 155 161" stroke="hsl(340 60% 65%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Cheek blush - rosy circles */}
    <circle cx="136" cy="158" r="5" fill="hsl(340 60% 80%)" opacity="0.5" />
    <circle cx="164" cy="158" r="5" fill="hsl(340 60% 80%)" opacity="0.5" />

    {/* Little hand peeking from blanket */}
    <circle cx="118" cy="178" r="5" fill="hsl(25 60% 85%)" />
    <circle cx="114" cy="176" r="2.5" fill="hsl(25 55% 82%)" />

    {/* Tiny star on blanket */}
    <path d="M170 178 L171.5 174 L173 178 L177 177 L173.5 180 L175 184 L171.5 181.5 L168 184 L169.5 180 L166 177Z" fill="hsl(38 80% 75%)" opacity="0.6" />

    {/* Floating Zzz above baby */}
    <text x="180" y="120" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="16" fontWeight="bold" opacity="0.7" className="animate-float-up" style={{ animationIterationCount: "infinite" }}>Z</text>
    <text x="195" y="100" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="22" fontWeight="bold" opacity="0.5" className="animate-float-up" style={{ animationDelay: "0.6s", animationIterationCount: "infinite" }}>z</text>
    <text x="210" y="80" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="28" fontWeight="bold" opacity="0.3" className="animate-float-up" style={{ animationDelay: "1.2s", animationIterationCount: "infinite" }}>Z</text>
  </svg>
);

export const SleepingCloud = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="50" r="22" fill="hsl(210 40% 92%)" />
    <circle cx="60" cy="40" r="28" fill="hsl(330 30% 94%)" />
    <circle cx="88" cy="48" r="20" fill="hsl(210 45% 91%)" />
    <ellipse cx="60" cy="60" rx="45" ry="14" fill="hsl(210 50% 93%)" />
    {/* Tiny Zzz */}
    <text x="68" y="28" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="12" fontWeight="bold" opacity="0.5" className="animate-float-up" style={{ animationIterationCount: "infinite" }}>z</text>
    <text x="78" y="18" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="16" fontWeight="bold" opacity="0.3" className="animate-float-up" style={{ animationDelay: "0.5s", animationIterationCount: "infinite" }}>Z</text>
  </svg>
);

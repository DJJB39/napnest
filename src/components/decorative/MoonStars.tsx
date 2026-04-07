export const MoonStars = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="50" fill="hsl(38 80% 75%)" />
    <circle cx="120" cy="85" r="42" fill="hsl(210 60% 95%)" className="dark:fill-[hsl(222,47%,11%)]" />
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
  <svg viewBox="0 0 320 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft background glow */}
    <ellipse cx="160" cy="150" rx="140" ry="120" fill="hsl(270 30% 95%)" opacity="0.3" />

    {/* Large crescent moon with sleeping face */}
    <circle cx="248" cy="48" r="38" fill="hsl(38 85% 78%)" />
    <circle cx="268" cy="36" r="32" fill="hsl(270 40% 94%)" className="dark:fill-[hsl(222,47%,11%)]" />
    {/* Moon sleeping eyes */}
    <path d="M236 46 Q240 51 244 46" stroke="hsl(30 40% 45%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M248 44 Q252 49 256 44" stroke="hsl(30 40% 45%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Moon smile */}
    <path d="M240 54 Q248 60 256 54" stroke="hsl(30 40% 50%)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    {/* Moon blush */}
    <circle cx="234" cy="52" r="4" fill="hsl(340 60% 80%)" opacity="0.4" />
    <circle cx="260" cy="50" r="4" fill="hsl(340 60% 80%)" opacity="0.4" />

    {/* Stars — 4-point sparkle shapes */}
    <path d="M50 28 L52 20 L54 28 L62 26 L54 30 L56 38 L52 32 L48 38 L50 30 L42 26Z" fill="hsl(38 85% 80%)" className="animate-twinkle" style={{ animationDelay: "0s" }} />
    <path d="M110 12 L112 6 L114 12 L120 10 L114 14 L116 20 L112 16 L108 20 L110 14 L104 10Z" fill="hsl(38 85% 80%)" className="animate-twinkle" style={{ animationDelay: "0.8s" }} />
    <path d="M190 18 L191.5 13 L193 18 L198 16.5 L193 20 L194.5 25 L191.5 22 L188.5 25 L190 20 L185 16.5Z" fill="hsl(38 85% 82%)" className="animate-twinkle" style={{ animationDelay: "1.4s" }} />
    <circle cx="285" cy="95" r="2.5" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
    <circle cx="30" cy="70" r="3" fill="hsl(38 80% 75%)" className="animate-twinkle" style={{ animationDelay: "1.8s" }} />
    <circle cx="75" cy="55" r="2" fill="hsl(38 80% 78%)" className="animate-twinkle" style={{ animationDelay: "2.2s" }} />
    <circle cx="295" cy="130" r="2" fill="hsl(38 80% 78%)" className="animate-twinkle" style={{ animationDelay: "0.6s" }} />
    <path d="M300 60 L301 56 L302 60 L306 59 L302 62 L303 66 L301 63 L299 66 L300 62 L296 59Z" fill="hsl(38 85% 82%)" className="animate-twinkle" style={{ animationDelay: "2s" }} />

    {/* Fluffy cloud nest — many overlapping puffs */}
    <ellipse cx="160" cy="225" rx="125" ry="38" fill="hsl(210 50% 92%)" />
    <circle cx="55" cy="210" r="32" fill="hsl(210 55% 90%)" />
    <circle cx="95" cy="198" r="36" fill="hsl(270 25% 93%)" />
    <circle cx="140" cy="192" r="42" fill="hsl(330 35% 94%)" />
    <circle cx="185" cy="195" r="38" fill="hsl(210 45% 92%)" />
    <circle cx="225" cy="200" r="34" fill="hsl(270 20% 93%)" />
    <circle cx="260" cy="210" r="30" fill="hsl(210 55% 90%)" />
    {/* Extra small puffs for volume */}
    <circle cx="72" cy="220" r="20" fill="hsl(330 25% 94%)" />
    <circle cx="248" cy="222" r="18" fill="hsl(330 25% 94%)" />
    {/* Inner nest warmth */}
    <ellipse cx="160" cy="212" rx="85" ry="26" fill="hsl(330 40% 95%)" />
    <ellipse cx="160" cy="215" rx="65" ry="18" fill="hsl(330 45% 96%)" />

    {/* Baby blanket — blue with star pattern */}
    <ellipse cx="160" cy="196" rx="52" ry="28" fill="hsl(210 55% 86%)" />
    <ellipse cx="160" cy="196" rx="46" ry="24" fill="hsl(220 50% 88%)" />
    {/* Star pattern on blanket */}
    <path d="M135 192 L136 189 L137 192 L140 191 L137 194 L138 197 L136 195 L134 197 L135 194 L132 191Z" fill="hsl(38 80% 82%)" opacity="0.5" />
    <path d="M175 188 L176 185 L177 188 L180 187 L177 190 L178 193 L176 191 L174 193 L175 190 L172 187Z" fill="hsl(38 80% 82%)" opacity="0.5" />
    <path d="M155 202 L156 199 L157 202 L160 201 L157 204 L158 207 L156 205 L154 207 L155 204 L152 201Z" fill="hsl(38 80% 82%)" opacity="0.4" />

    {/* Baby head */}
    <circle cx="160" cy="160" r="30" fill="hsl(25 55% 85%)" />
    {/* Hair wisps — softer, more */}
    <path d="M140 148 Q145 128 158 138 Q162 125 168 140 Q178 130 176 148" stroke="hsl(25 35% 50%)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <path d="M145 145 Q150 135 155 142" stroke="hsl(25 30% 55%)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Eyes closed — cute curves with lashes */}
    <path d="M147 160 Q152 166 157 160" stroke="hsl(222 47% 25%)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M163 160 Q168 166 173 160" stroke="hsl(222 47% 25%)" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Eyelashes */}
    <line x1="147" y1="160" x2="144" y2="156" stroke="hsl(222 47% 30%)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="150" y1="159" x2="148" y2="155" stroke="hsl(222 47% 30%)" strokeWidth="1" strokeLinecap="round" />
    <line x1="173" y1="160" x2="176" y2="156" stroke="hsl(222 47% 30%)" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="170" y1="159" x2="172" y2="155" stroke="hsl(222 47% 30%)" strokeWidth="1" strokeLinecap="round" />

    {/* Tiny nose */}
    <circle cx="160" cy="165" r="1.5" fill="hsl(25 40% 75%)" />

    {/* Sweet smile */}
    <path d="M153 172 Q160 179 167 172" stroke="hsl(340 55% 60%)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

    {/* Rosy cheeks */}
    <circle cx="142" cy="168" r="6" fill="hsl(340 65% 82%)" opacity="0.5" />
    <circle cx="178" cy="168" r="6" fill="hsl(340 65% 82%)" opacity="0.5" />

    {/* Little hands peeking */}
    <circle cx="122" cy="190" r="6" fill="hsl(25 55% 84%)" />
    <circle cx="117" cy="187" r="3" fill="hsl(25 50% 82%)" />
    <circle cx="198" cy="192" r="5.5" fill="hsl(25 55% 84%)" />
    <circle cx="203" cy="189" r="2.8" fill="hsl(25 50% 82%)" />

    {/* Floating Zzz above baby */}
    <text x="200" y="128" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="18" fontWeight="bold" opacity="0.7" className="animate-float-up" style={{ animationIterationCount: "infinite" }}>Z</text>
    <text x="216" y="105" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="24" fontWeight="bold" opacity="0.5" className="animate-float-up" style={{ animationDelay: "0.6s", animationIterationCount: "infinite" }}>z</text>
    <text x="230" y="82" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="30" fontWeight="bold" opacity="0.3" className="animate-float-up" style={{ animationDelay: "1.2s", animationIterationCount: "infinite" }}>Z</text>

    {/* Tiny floating cloud near Zzz */}
    <ellipse cx="210" cy="115" rx="12" ry="6" fill="hsl(210 40% 92%)" opacity="0.3" />
    <circle cx="204" cy="112" r="5" fill="hsl(210 40% 93%)" opacity="0.25" />
    <circle cx="216" cy="112" r="4.5" fill="hsl(210 40% 93%)" opacity="0.25" />
  </svg>
);

export const SleepingCloud = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 120 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="50" r="22" fill="hsl(210 40% 92%)" />
    <circle cx="60" cy="40" r="28" fill="hsl(330 30% 94%)" />
    <circle cx="88" cy="48" r="20" fill="hsl(210 45% 91%)" />
    <ellipse cx="60" cy="60" rx="45" ry="14" fill="hsl(210 50% 93%)" />
    <text x="68" y="28" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="12" fontWeight="bold" opacity="0.5" className="animate-float-up" style={{ animationIterationCount: "infinite" }}>z</text>
    <text x="78" y="18" fill="hsl(168 40% 54%)" fontFamily="Caveat, cursive" fontSize="16" fontWeight="bold" opacity="0.3" className="animate-float-up" style={{ animationDelay: "0.5s", animationIterationCount: "infinite" }}>Z</text>
  </svg>
);

export const TinyMoonPhases = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {/* New moon */}
    <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="hsl(215 16% 47%)" opacity="0.3" /></svg>
    {/* Waxing crescent */}
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="hsl(38 80% 75%)" />
      <circle cx="10" cy="7" r="5.5" fill="hsl(215 16% 47%)" opacity="0.3" />
    </svg>
    {/* First quarter */}
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="hsl(38 80% 75%)" />
      <rect x="7" y="1" width="6" height="12" fill="hsl(215 16% 47%)" opacity="0.3" rx="0" />
    </svg>
    {/* Full moon */}
    <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6" fill="hsl(38 85% 78%)" /></svg>
    {/* Waning crescent */}
    <svg width="14" height="14" viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="hsl(38 80% 75%)" />
      <circle cx="4" cy="7" r="5.5" fill="hsl(215 16% 47%)" opacity="0.3" />
    </svg>
  </div>
);

import { useNavigate } from "react-router-dom";
import { CalendarHeart, BookOpen, MessageCircle, Settings, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { to: "/expect", icon: CalendarHeart, label: "What to Expect", description: "NHS milestones & development" },
  { to: "/stories", icon: BookOpen, label: "Bedtime Book", description: "Personalised bedtime stories" },
  { to: "/ask-ai", icon: MessageCircle, label: "Ask AI", description: "Sleep advice powered by AI" },
  { to: "/settings", icon: Settings, label: "Settings", description: "Account & preferences" },
];

const More = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-3">
      <h1 className="text-lg font-semibold text-foreground mb-4">More</h1>
      {menuItems.map(({ to, icon: Icon, label, description }, i) => (
        <motion.button
          key={to}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => navigate(to)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:bg-accent/50 transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      ))}
    </div>
  );
};

export default More;

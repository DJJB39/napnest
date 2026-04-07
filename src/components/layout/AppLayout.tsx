import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { AnimatePresence, motion } from "framer-motion";

export const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-lg mx-auto relative gradient-page">
      <main className="flex-1 pb-20 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
};

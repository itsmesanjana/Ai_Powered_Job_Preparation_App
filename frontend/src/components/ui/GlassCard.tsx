import { ReactNode } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", glow = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={glow ? { scale: 1.02 } : {}}
      className={`glass glass-shimmer rounded-2xl p-6 ${glow ? 'hover:neon-glow hover:border-primary/50 transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

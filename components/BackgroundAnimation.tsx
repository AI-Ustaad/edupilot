"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Pencil,
  Globe,
  Calculator,
  FlaskConical,
  Music,
  Palette,
  Atom,
  Languages,
  Star,
  Heart,
  Lightbulb,
  School,
} from "lucide-react";

// تعلیمی آئیکنز کی فہرست
const EDUCATIONAL_ICONS = [
  BookOpen,
  GraduationCap,
  Pencil,
  Globe,
  Calculator,
  FlaskConical,
  Music,
  Palette,
  Atom,
  Languages,
  Star,
  Heart,
  Lightbulb,
  School,
];

// ڈریمی پاسٹل کلرز
const COLORS = [
  "#FFB6B8", // پرائمری (Soft Pink)
  "#BEC5FF", // سیکنڈری (Soft Periwinkle)
  "#C7A8FF", // ایکسنٹ (Soft Lilac)
  "#A0E7FF", // Info (Sky Blue)
  "#FFC78B", // وارننگ (Warm Peach)
  "#7EE6A2", // سَکسِس (Mint Green)
  "#FFD1DC", // Dreamy Pink
  "#D1E8FF", // Dreamy Blue
  "#E8D1FF", // Dreamy Purple
];

interface FloatingIcon {
  id: number;
  x: number;          // شروع کا ایکس
  icon: any;
  color: string;
  size: number;       // 60 سے 100 کے درمیان
  delay: number;
  duration: number;   // 15 سے 25 سیکنڈ
}

export default function BackgroundAnimation() {
  const [icons, setIcons] = useState<FloatingIcon[]>([]);

  useEffect(() => {
    // 12 سے 18 آئیکنز بنائیں
    const count = Math.floor(Math.random() * 7) + 12; // 12-18
    const generated: FloatingIcon[] = [];

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100, // 0% سے 100% کے درمیان شروع
        icon: EDUCATIONAL_ICONS[Math.floor(Math.random() * EDUCATIONAL_ICONS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.floor(Math.random() * 41) + 60, // 60px - 100px
        delay: Math.random() * 10, // 0-10 سیکنڈ تاخیر
        duration: Math.floor(Math.random() * 11) + 15, // 15-25 سیکنڈ
      });
    }

    setIcons(generated);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {icons.map((item) => {
        const IconComponent = item.icon;

        return (
          <motion.div
            key={item.id}
            className="absolute"
            style={{
              left: `${item.x}%`,
              top: "-10%",
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
            initial={{
              y: "-10%",
              x: 0,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              // 3 مرحلوں میں حرکت:
              // 1. اوپر سے نیچے گرنا
              // 2. دائیں طرف جمع ہونا
              // 3. نیچے سے دائیں سے بائیں جانا
              y: [
                "-10%",     // اوپر
                "40%",      // درمیان (گرنا)
                "75%",      // نیچے (جمع ہونا)
                "85%",      // بیس پر
              ],
              x: [
                0,          // شروع
                30,         // دائیں طرف جھکاؤ
                80,         // دائیں طرف جمع
                -20,        // بائیں طرف بہنا
              ],
              opacity: [0, 0.8, 0.6, 0],
              rotate: [0, 15, -10, 0],
              scale: [0.6, 1, 0.9, 0.7],
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.4, 0.7, 1],
            }}
          >
            {/* شیشے کا گول بلبلہ */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                background: `${item.color}20`, // 12% شفافیت
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${item.color}40`,
                boxShadow: `0 8px 32px ${item.color}30, inset 0 0 20px ${item.color}15`,
              }}
            >
              <IconComponent
                size={item.size * 0.45}
                style={{ color: item.color, opacity: 0.9 }}
              />
            </div>
          </motion.div>
        );
      })}

      {/* === اضافی نرم ذرات (Particles) === */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: "4px",
            height: "4px",
            background: COLORS[i % COLORS.length],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
            y: [0, -30, -60],
            x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            delay: Math.random() * 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useHoverSound } from "@/hooks/useHoverSound";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  imagePosition?: "left" | "right";
  index?: number;
}

export function CategoryCard({
  title,
  description,
  href,
  imagePosition = "left",
  index = 0,
}: CategoryCardProps) {
  const { hoverProps } = useHoverSound();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={href}
        className="group flex overflow-hidden rounded-3xl bg-[#1a1a1a] text-white card-hover"
        {...hoverProps}
      >
        {imagePosition === "left" && (
          <div className="hidden w-2/5 items-center justify-center bg-[#222] sm:flex">
            <span className="text-5xl font-black text-white/10">
              {title.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center p-6 md:p-8">
          <h3 className="text-xl font-bold md:text-2xl">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors group-hover:text-[#facc15]">
            Explore now <ArrowRight size={14} />
          </span>
        </div>

        {imagePosition === "right" && (
          <div className="hidden w-2/5 items-center justify-center bg-[#222] sm:flex">
            <span className="text-5xl font-black text-white/10">
              {title.charAt(0)}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

"use client";

import { getPaypalLink } from "@/lib/data";
import { useHoverSound } from "@/hooks/useHoverSound";

interface PayPalButtonProps {
  email: string;
  amount: number;
  currency: string;
  itemName: string;
  className?: string;
}

export function PayPalButton({
  email,
  amount,
  currency,
  itemName,
  className = "",
}: PayPalButtonProps) {
  const { hoverProps } = useHoverSound();
  const href = getPaypalLink(email, amount, currency, itemName);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffc439] py-3.5 text-sm font-bold text-[#003087] transition-transform hover:scale-[1.02] ${className}`}
      {...hoverProps}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .758-.658h6.35c2.092 0 3.563.43 4.37 1.278.807.848 1.1 2.147.87 3.865-.023.17-.05.34-.082.51-.28 1.633-.77 2.93-1.46 3.86-.69.93-1.6 1.59-2.72 1.98-1.12.39-2.48.58-4.08.58h-1.05l-.74 4.68a.641.641 0 0 1-.633.54zm.46-5.58h1.28c1.52 0 2.6-.31 3.24-.93.64-.62 1.08-1.62 1.32-3 .24-1.38.08-2.35-.48-2.9-.56-.55-1.58-.83-3.06-.83H8.5l-.96 6.06z" />
      </svg>
      Pay with PayPal
    </a>
  );
}

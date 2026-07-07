import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 ${className}`}
    >
      <Image
        src="/logo.png"
        alt="WUTSHY"
        width={size}
        height={size}
        className="rounded-full object-cover ring-1 ring-white/10"
        priority
      />
      {showText && (
        <span className="text-lg font-bold tracking-tight">WUTSHY</span>
      )}
    </Link>
  );
}

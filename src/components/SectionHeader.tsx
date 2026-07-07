interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  dark,
}: SectionHeaderProps) {
  return (
    <div className="mb-8 md:mb-12">
      {label && (
        <span
          className={`text-xs font-bold uppercase tracking-widest ${
            dark ? "text-white/40" : "text-black/40"
          }`}
        >
          {label}
        </span>
      )}
      <h2
        className={`mt-1 text-3xl font-bold tracking-tight md:text-4xl ${
          dark ? "text-white" : "text-black"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-2 max-w-xl text-sm md:text-base ${
            dark ? "text-white/50" : "text-black/50"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

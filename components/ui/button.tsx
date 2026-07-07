import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "dark";
};

const styles = {
  primary: "bg-navy text-white hover:bg-ink",
  secondary: "bg-[#fffaf2] text-ink border border-line hover:border-navy",
  ghost: "bg-transparent text-ink hover:bg-[#fffaf2]",
  danger: "bg-red-700 text-white hover:bg-red-800",
  gold: "bg-gold text-white shadow-lg shadow-black/20 hover:bg-[#856229]",
  dark: "border border-gold/70 bg-navy/80 text-white hover:bg-navy"
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  className,
  variant = "primary",
  children
}: {
  href: string;
  className?: string;
  variant?: keyof typeof styles;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
        styles[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}

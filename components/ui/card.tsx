import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-[#fffaf2] p-5 shadow-soft", className)} {...props} />;
}

export function Section({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("mx-auto w-full max-w-6xl px-5 py-14 md:px-8", className)} {...props} />;
}

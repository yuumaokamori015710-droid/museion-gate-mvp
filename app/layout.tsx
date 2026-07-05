import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MUSEION Gate",
  description: "知性が、次に動く入口。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

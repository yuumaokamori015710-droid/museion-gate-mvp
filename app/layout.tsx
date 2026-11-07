import type { Metadata } from "next";
import "./globals.css";
import "./support-contact.css";

export const metadata: Metadata = {
  title: "MUSEION Gate",
  description: "知性が、次に動く入口。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}<footer className="business-support-footer-link"><a href="/contact">運営へのお問い合わせ</a></footer></body>
    </html>
  );
}

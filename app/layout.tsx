import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roundtable AI — 더 나은 답을 위한 두 개의 시선",
  description:
    "GPT와 Claude가 서로 검토하고 합의해 더 나은 답을 만드는 AI 토론 인터페이스",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

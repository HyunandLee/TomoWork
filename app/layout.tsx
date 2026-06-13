import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tuna Work — 外国人雇用マッチング＆書類生成',
  description: '外国人労働者と雇用主を繋ぎ、在留資格コンプライアンス検証と様式第3号自動生成を提供するプラットフォーム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

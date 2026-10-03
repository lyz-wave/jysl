import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '解忧森林 · 治愈系纸艺心事森林',
  description:
    '基于认知行为疗法（CBT）、自我关怀与接纳承诺疗法（ACT）的 2.5D 纸雕治愈应用。7只思维动物伙伴，陪伴你释放情绪、转变认知、沉淀成长年轮。',
  keywords: [
    '解忧森林',
    '心理治愈',
    '情绪释放',
    'CBT认知行为疗法',
    '自我关怀',
    '2.5D剪纸',
    '立体书',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAF7EE] text-[#4D3524] font-wenkai selection:bg-[#E5EFE3] selection:text-[#23481F]">
        {children}
      </body>
    </html>
  );
}

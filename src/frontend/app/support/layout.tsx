import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trung tâm trợ giúp | NestAI',
  description: 'Tìm kiếm câu trả lời và hướng dẫn sử dụng các tính năng của NestAI.',
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

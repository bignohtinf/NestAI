import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật | NestAI',
  description: 'Tìm hiểu cách NestAI bảo vệ thông tin và quyền riêng tư của bạn.',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

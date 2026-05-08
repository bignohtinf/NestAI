import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng | NestAI',
  description: 'Các quy định và điều khoản khi sử dụng dịch vụ của NestAI.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

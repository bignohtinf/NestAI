import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liên hệ chúng tôi | NestAI',
  description: 'Kết nối với đội ngũ NestAI để được hỗ trợ và giải đáp thắc mắc.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

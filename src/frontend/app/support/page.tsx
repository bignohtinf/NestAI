'use client';


import { HomeLayout } from '@/components/layouts/home-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Book, MessageCircle, Phone } from 'lucide-react';

export default function SupportPage() {
  const faqs = [
    {
      question: "NestAI giúp ích gì cho mẹ bầu?",
      answer: "NestAI cung cấp lộ trình dinh dưỡng cá nhân hóa theo từng tuần thai, gợi ý thực đơn món Việt quen thuộc và hỗ trợ giải đáp các thắc mắc về sức khỏe thai kỳ thông qua trợ lý AI Nori."
    },
    {
      question: "Làm thế nào để theo dõi sự phát triển của bé?",
      answer: "Bạn có thể vào mục 'Hành trình bé' để xem hình ảnh 3D và thông tin chi tiết về sự phát triển của thai nhi theo từng tuần tuổi."
    },
    {
      question: "Chế độ ăn uống cho mẹ tiểu đường thai kỳ?",
      answer: "NestAI có chế độ lọc thực đơn riêng biệt cho mẹ gặp vấn đề về tiểu đường thai kỳ, giúp kiểm soát lượng đường mà vẫn đảm bảo dinh dưỡng cho bé."
    },
    {
      question: "Làm sao để liên hệ với đội ngũ chuyên gia?",
      answer: "Bạn có thể sử dụng tính năng 'Liên hệ chúng tôi' hoặc gửi tin nhắn trực tiếp qua Zalo/Hotline hỗ trợ hiển thị ở trang liên hệ."
    }
  ];

  return (
    <HomeLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#c8564a]">Trung tâm trợ giúp</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn trong suốt hành trình làm mẹ. Tìm câu trả lời cho các thắc mắc phổ biến hoặc kết nối với chúng tôi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#fdf3f1] bg-[#fdf3f1]/30">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="p-2 bg-[#c8564a]/10 rounded-lg">
                <Book className="w-6 h-6 text-[#c8564a]" />
              </div>
              <CardTitle className="text-lg">Hướng dẫn sử dụng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Tìm hiểu cách sử dụng các tính năng của NestAI để tối ưu hóa sức khỏe thai kỳ.</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer border-[#fdf3f1] bg-[#fdf3f1]/30">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="p-2 bg-[#c8564a]/10 rounded-lg">
                <HelpCircle className="w-6 h-6 text-[#c8564a]" />
              </div>
              <CardTitle className="text-lg">Câu hỏi thường gặp</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Giải đáp các thắc mắc phổ biến về dinh dưỡng, sức khỏe và tài khoản.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-[#c8564a]" />
            Thắc mắc phổ biến
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium hover:text-[#c8564a]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <Card className="border-[#c8564a]/20 bg-gradient-to-br from-[#fdf3f1] to-white">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold text-[#c8564a]">Vẫn cần hỗ trợ?</h3>
              <p className="text-sm text-muted-foreground">Đội ngũ của chúng tôi luôn trực tuyến để giúp bạn.</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-2 bg-[#c8564a] text-white rounded-full font-medium hover:bg-[#b04a3f] transition-colors shadow-sm">
                Chat với chúng tôi
              </button>
              <button className="px-6 py-2 border border-[#c8564a] text-[#c8564a] rounded-full font-medium hover:bg-[#c8564a]/5 transition-colors">
                Gửi Email
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </HomeLayout>
  );
}

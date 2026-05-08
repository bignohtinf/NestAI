'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  return (
    <HomeLayout>
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-[#c8564a]">Liên hệ với NestAI</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Bạn có góp ý hay thắc mắc? Đừng ngần ngại liên hệ với chúng tôi. Đội ngũ NestAI luôn lắng nghe bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-none bg-[#fdf3f1]/50 shadow-none">
              <CardContent className="pt-6 space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-[#c8564a]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">support@nestai.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-[#c8564a]">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Hotline</p>
                    <p className="text-sm text-muted-foreground">1900 123 456</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-[#c8564a]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Văn phòng</p>
                    <p className="text-sm text-muted-foreground">Toà nhà Innovation, Công viên phần mềm Quang Trung, Quận 12, TP. HCM</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#c8564a]/10">
                  <p className="text-xs text-muted-foreground italic">
                    Thời gian làm việc: 8:00 - 18:00 (Thứ 2 - Thứ 7)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-xl shadow-[#c8564a]/5">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-[#c8564a]" />
                  Gửi tin nhắn cho chúng tôi
                </CardTitle>
                <CardDescription>
                  Điền thông tin vào biểu mẫu bên dưới, chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Họ và tên</label>
                      <Input placeholder="Nguyễn Văn A" className="bg-muted/50 focus-visible:ring-[#c8564a]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="example@gmail.com" className="bg-muted/50 focus-visible:ring-[#c8564a]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chủ đề</label>
                    <Input placeholder="Tôi cần hỗ trợ về..." className="bg-muted/50 focus-visible:ring-[#c8564a]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nội dung</label>
                    <Textarea 
                      placeholder="Hãy cho chúng tôi biết chi tiết vấn đề của bạn..." 
                      className="min-h-[150px] bg-muted/50 focus-visible:ring-[#c8564a] resize-none" 
                    />
                  </div>

                  <Button className="w-full bg-[#c8564a] hover:bg-[#b04a3f] text-white py-6 rounded-xl font-bold text-lg shadow-lg shadow-[#c8564a]/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Gửi tin nhắn
                    <Send className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

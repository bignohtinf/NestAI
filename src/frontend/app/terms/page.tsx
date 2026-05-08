'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { Scale, AlertCircle, CheckCircle2, ScrollText } from 'lucide-react';

export default function TermsPage() {
  const lastUpdated = "08 tháng 05, 2026";

  return (
    <HomeLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-[#c8564a]/10 rounded-full mb-2">
            <Scale className="w-8 h-8 text-[#c8564a]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Điều khoản sử dụng</h1>
          <p className="text-muted-foreground italic">Cập nhật lần cuối: {lastUpdated}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm space-y-10 prose prose-slate max-w-none prose-headings:text-[#c8564a] prose-strong:text-foreground prose-p:text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <ScrollText className="w-6 h-6" />
              1. Chấp nhận điều khoản
            </h2>
            <p>
              Bằng cách sử dụng ứng dụng NestAI, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, bạn không nên sử dụng dịch vụ của chúng tôi.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <AlertCircle className="w-6 h-6" />
              2. Miễn trừ trách nhiệm y tế
            </h2>
            <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
              <p className="text-amber-800 font-medium text-sm mb-0">
                <strong>QUAN TRỌNG:</strong> NestAI cung cấp thông tin dinh dưỡng và hỗ trợ dựa trên trí tuệ nhân tạo. Các thông tin này chỉ mang tính chất tham khảo và KHÔNG thay thế cho lời khuyên, chẩn đoán hoặc điều trị y tế chuyên nghiệp từ bác sĩ.
              </p>
            </div>
            <p>
              Bạn nên luôn tham khảo ý kiến của bác sĩ hoặc chuyên gia y tế có trình độ trước khi thực hiện bất kỳ thay đổi lớn nào trong chế độ ăn uống hoặc lối sống trong thời kỳ mang thai.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <CheckCircle2 className="w-6 h-6" />
              3. Quyền hạn và trách nhiệm
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình.</li>
              <li>Bạn cam kết cung cấp thông tin chính xác để hệ thống có thể đưa ra gợi ý dinh dưỡng phù hợp nhất.</li>
              <li>Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản nếu phát hiện hành vi vi phạm pháp luật hoặc gây hại cho cộng đồng.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <Scale className="w-6 h-6" />
              4. Thay đổi điều khoản
            </h2>
            <p>
              Chúng tôi có thể cập nhật các điều khoản này theo thời gian. Việc bạn tiếp tục sử dụng ứng dụng sau khi các thay đổi được đăng tải sẽ được coi là sự chấp nhận đối với các điều khoản mới.
            </p>
          </section>

          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Việc sử dụng NestAI đồng nghĩa với việc bạn đã đọc, hiểu và đồng ý với các điều khoản này.
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

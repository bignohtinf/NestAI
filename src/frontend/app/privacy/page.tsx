'use client';

import { HomeLayout } from '@/components/layouts/home-layout';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = "08 tháng 05, 2026";

  return (
    <HomeLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-[#c8564a]/10 rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-[#c8564a]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Chính sách bảo mật</h1>
          <p className="text-muted-foreground italic">Cập nhật lần cuối: {lastUpdated}</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-12 shadow-sm space-y-8 prose prose-slate max-w-none prose-headings:text-[#c8564a] prose-strong:text-foreground prose-p:text-muted-foreground">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <Eye className="w-6 h-6" />
              1. Thông tin chúng tôi thu thập
            </h2>
            <p>
              NestAI thu thập các thông tin sau để cung cấp dịch vụ tốt nhất cho bạn:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Thông tin cá nhân:</strong> Tên, địa chỉ email, số điện thoại khi bạn đăng ký tài khoản.</li>
              <li><strong>Thông tin sức khỏe:</strong> Tuần thai, tình trạng sức khỏe (như tiểu đường thai kỳ), thói quen ăn uống để cá nhân hóa thực đơn.</li>
              <li><strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn tương tác với ứng dụng, các món ăn bạn đã quét hoặc tìm kiếm.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <Lock className="w-6 h-6" />
              2. Cách chúng tôi bảo vệ dữ liệu của bạn
            </h2>
            <p>
              Bảo mật của bạn là ưu tiên hàng đầu của chúng tôi. Chúng tôi áp dụng các biện pháp bảo mật tiên tiến:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Mã hóa dữ liệu:</strong> Toàn bộ dữ liệu nhạy cảm được mã hóa khi truyền tải và lưu trữ.</li>
              <li><strong>Kiểm soát truy cập:</strong> Chỉ những nhân viên có thẩm quyền mới được truy cập dữ liệu để hỗ trợ kỹ thuật.</li>
              <li><strong>Không chia sẻ bên thứ ba:</strong> Chúng tôi cam kết không bán hoặc chia sẻ dữ liệu cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 border-b border-[#c8564a]/10 pb-2">
              <FileText className="w-6 h-6" />
              3. Quyền của người dùng
            </h2>
            <p>
              Bạn có toàn quyền kiểm soát dữ liệu của mình:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Yêu cầu truy cập và xem lại thông tin cá nhân của bạn.</li>
              <li>Yêu cầu sửa đổi hoặc cập nhật thông tin không chính xác.</li>
              <li>Yêu cầu xóa tài khoản và toàn bộ dữ liệu liên quan bất kỳ lúc nào.</li>
            </ul>
          </section>

          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách này, vui lòng liên hệ qua <span className="text-[#c8564a] font-medium">privacy@nestai.vn</span>
            </p>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}

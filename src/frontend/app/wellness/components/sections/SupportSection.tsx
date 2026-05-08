'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Send, HelpCircle } from 'lucide-react';
import { wellnessService } from '../../services/wellnessService';
import { toast } from 'sonner';
import { SectionHeader } from '../SectionHeader';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

interface SupportSectionProps {
  userId: string;
}

const FAQs = [
  {
    question: 'How often should I track my wellness data?',
    answer: 'We recommend tracking daily, preferably at the same time each day. This helps us get accurate trends and give you better insights.'
  },
  {
    question: 'What does the milk score represent?',
    answer: 'The milk score is a personal wellness metric that you track daily. It can represent breastfeeding comfort, nutrition level, or any personal health metric you choose to track.'
  },
  {
    question: 'How is the health score calculated?',
    answer: 'Your health score is calculated based on 4 factors: Milk Score (30%), Mood (25%), Sleep (25%), and Energy Level (20%). The score ranges from 0-100.'
  },
  {
    question: 'What are the daily challenges for?',
    answer: 'Daily challenges help keep you motivated and maintain healthy habits. Completing challenges builds your streak and contributes to your overall wellness.'
  },
  {
    question: 'Can I edit past entries?',
    answer: 'Yes, you can edit any past entry by clicking on the date and updating the data. Your health score and trends will update automatically.'
  },
  {
    question: 'How do I book a consultation with an expert?',
    answer: 'Use the consultation form below to submit your request. Our team will contact you within 24-48 hours to schedule a consultation.'
  },
  {
    question: 'Is my data private?',
    answer: 'Yes! Your wellness data is completely private and secure. Only you and authorized health professionals can view your information.'
  },
  {
    question: 'What should I do if I\'m concerned about my health?',
    answer: 'If you have serious health concerns, please consult with a healthcare professional immediately. Use our expert consultation service for additional support.'
  }
];

export const SupportSection = ({ userId }: SupportSectionProps) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmitting(true);

    try {
      await wellnessService.requestConsultation(userId, message);
      toast.success('✅ Consultation request submitted! We\'ll contact you soon.');
      setMessage('');
    } catch (error) {
      toast.error('Failed to submit consultation request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-border/50">
        <div className="flex items-start gap-3">
          <span className="text-4xl">💬</span>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Hỗ Trợ & Tư Vấn</h2>
            <p className="text-sm text-muted-foreground mt-2">Có câu hỏi? Cần tư vấn từ chuyên gia? Chúng tôi ở đây để giúp bạn</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-foreground">Các Câu Hỏi Thường Gặp</h3>
        </div>

        <div className="space-y-2">
          {FAQs.map((faq, idx) => (
            <Collapsible key={idx} className="border rounded-lg overflow-hidden">
              <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <p className="font-semibold text-slate-700 text-left">{faq.question}</p>
                <ChevronDown className="w-5 h-5 text-slate-500" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 py-3 bg-slate-50 border-t">
                <p className="text-slate-700">{faq.answer}</p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* Consultation Booking */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold mb-2 text-foreground">👩‍⚕️ Tư Vấn Với Chuyên Gia</h3>
        <p className="text-slate-700 text-sm mb-4">
          Có những lo lắng về sức khỏe? Các chuyên gia wellness của chúng tôi sẵn sàng giúp. Gửi yêu cầu của bạn và chúng tôi sẽ liên hệ trong vòng 24-48 giờ.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Chia sẻ mối quan tâm về sức khỏe hoặc đặt câu hỏi của bạn..."
            rows={4}
            className="bg-white"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Đang gửi...' : 'Yêu Cầu Tư Vấn'}
          </Button>
        </form>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">📚 Tài Nguyên & Công Cụ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <p className="font-semibold text-slate-700">📖 Bài Viết Sức Khỏe</p>
            <p className="text-sm text-slate-600 mt-1">Đọc các bài viết về sức khỏe mẹ và trẻ em</p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-green-400 hover:bg-green-50 transition-colors"
          >
            <p className="font-semibold text-slate-700">🎥 Video Hướng Dẫn</p>
            <p className="text-sm text-slate-600 mt-1">Xem video về dinh dưỡng và mẹo wellness</p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 transition-colors"
          >
            <p className="font-semibold text-slate-700">🧘 Thiền & Thư Giãn</p>
            <p className="text-sm text-slate-600 mt-1">Truy cập thiền hướng dẫn và bài tập thư giãn</p>
          </a>
          <a
            href="#"
            className="border rounded-lg p-4 hover:border-amber-400 hover:bg-amber-50 transition-colors"
          >
            <p className="font-semibold text-slate-700">👥 Cộng Đồng</p>
            <p className="text-sm text-slate-600 mt-1">Kết nối với các mẹ khác và chia sẻ kinh nghiệm</p>
          </a>
        </div>
      </div>
    </div>
  );
};

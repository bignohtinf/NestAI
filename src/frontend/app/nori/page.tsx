'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BotAnimation } from '@/components/nori/bot-animation';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function NoriPage() {
  const { user } = useApp();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role === 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: `Xin chào ${user?.name}! 👋 Tôi là Nori, trợ lý AI của bạn. Tôi có thể giúp bạn với:\n\n• Lời khuyên về dinh dưỡng cho mẹ sau sinh\n• Thông tin về phát triển của bé\n• Gợi ý công thức nấu ăn\n• Trả lời các câu hỏi về sức khỏe\n\nBạn cần giúp gì hôm nay?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 800);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Nutrition responses
    if (input.includes('dinh dưỡng') || input.includes('ăn gì')) {
      return `Để duy trì sức khỏe và sản xuất sữa tốt, bạn nên:\n\n✓ Ăn đủ protein (cá, trứng, thịt)\n✓ Uống đủ nước (8-10 cốc/ngày)\n✓ Ăn rau xanh và trái cây\n✓ Bổ sung canxi (sữa, phô mai, cá)\n✓ Ăn các loại hạt (hạnh nhân, óc chó)\n\nBạn có muốn xem công thức nấu ăn cụ thể không?`;
    }

    if (input.includes('sữa') || input.includes('bú')) {
      return `Về nuôi con bằng sữa mẹ:\n\n• Bé nên bú 8-12 lần/ngày trong 2 tháng đầu\n• Mỗi lần bú khoảng 15-20 phút\n• Xen kẽ giữa hai ngực\n• Nếu sữa ít, hãy bú thường xuyên hơn\n• Mẹ cần ăn uống đầy đủ và nghỉ ngơi\n\nBạn có vấn đề gì về sữa không?`;
    }

    if (input.includes('bé') || input.includes('con')) {
      return `Về phát triển của bé:\n\n👶 0-2 tháng: Bé chủ yếu ngủ, bú và khóc\n😊 2-4 tháng: Bé bắt đầu cười, theo dõi vật\n🤲 4-6 tháng: Bé nắm chặt tay, lăn người\n🍽️ 6+ tháng: Bé sẵn sàng ăn dặm\n\nBé của bạn bao nhiêu tuổi rồi?`;
    }

    if (input.includes('công thức') || input.includes('nấu ăn')) {
      return `Tôi có thể gợi ý một số công thức dinh dưỡng:\n\n🥣 Cháo cá hồi với rau xanh\n🥗 Salad cá ngừ với dầu olive\n🍲 Canh gà với nấm\n🥘 Cơm chiên với trứng và rau\n\nBạn muốn xem chi tiết công thức nào?`;
    }

    if (input.includes('mệt') || input.includes('stress') || input.includes('lo lắng')) {
      return `Mẹ sau sinh thường cảm thấy mệt mỏi và lo lắng. Đây là bình thường!\n\n💡 Lời khuyên:\n• Nghỉ ngơi đủ giấc (ít nhất 6-8 giờ/ngày)\n• Yêu cầu gia đình giúp đỡ\n• Ăn uống đầy đủ và thường xuyên\n• Tập thể dục nhẹ\n• Nếu cảm thấy quá lo lắng, hãy trao đổi với bác sĩ\n\nBạn cần hỗ trợ gì?`;
    }

    // Default response
    return `Cảm ơn câu hỏi của bạn! 😊\n\nTôi có thể giúp bạn về:\n• Dinh dưỡng cho mẹ sau sinh\n• Phát triển của bé\n• Công thức nấu ăn\n• Sức khỏe và sự chăm sóc\n\nHãy hỏi tôi bất cứ điều gì bạn muốn biết!`;
  };

  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Nori - Trợ lý AI</h1>
          <p className="text-muted-foreground">Hỏi tôi bất cứ điều gì về sức khỏe, dinh dưỡng và phát triển của bé</p>
        </div>

        {/* Bot Animation */}
        <div className="flex justify-center">
          <BotAnimation />
        </div>

        {/* Chat Container */}
        <Card className="flex flex-col h-[600px]">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="border-t border-border p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Quick suggestions */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Gợi ý câu hỏi:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Tôi nên ăn gì để tăng sữa?')}
              className="justify-start"
            >
              Tôi nên ăn gì để tăng sữa?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Bé 2 tháng tuổi phát triển bình thường không?')}
              className="justify-start"
            >
              Bé 2 tháng tuổi phát triển bình thường không?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Có công thức nấu ăn nào tốt cho mẹ không?')}
              className="justify-start"
            >
              Có công thức nấu ăn nào tốt cho mẹ không?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInput('Tôi cảm thấy mệt mỏi, phải làm sao?')}
              className="justify-start"
            >
              Tôi cảm thấy mệt mỏi, phải làm sao?
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, Sparkles, Baby, Apple, ChefHat, HeartPulse } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  { icon: Apple, text: 'Tôi nên ăn gì để tăng sữa?' },
  { icon: Baby, text: 'Bé 2 tháng tuổi phát triển bình thường không?' },
  { icon: ChefHat, text: 'Có công thức nấu ăn nào tốt cho mẹ không?' },
  { icon: HeartPulse, text: 'Tôi cảm thấy mệt mỏi, phải làm sao?' },
];

const BOT_FRAMES = ['/bot_1.PNG', '/bot_2.PNG', '/bot_3.PNG'];

function BotAvatar({ size = 28 }: { size?: number }) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % 3), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <img
      src={BOT_FRAMES[frame]}
      alt="Nori"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

export default function NoriPage() {
  const { user } = useApp();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role === 'admin') router.push('/');
  }, [user, router]);

  useEffect(() => {
    if (messages.length === 0 && user) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: `Xin chào ${user?.name}! 💕\n\nTôi là Nori — trợ lý AI đồng hành cùng mẹ và bé. Tôi có thể giúp bạn:\n\n• Lời khuyên dinh dưỡng cho mẹ sau sinh\n• Thông tin phát triển của bé\n• Gợi ý công thức nấu ăn lành mạnh\n• Trả lời câu hỏi về sức khỏe\n\nHôm nay mẹ cần tôi giúp gì? 🌸`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateResponse(msg),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setLoading(false);
    }, 900);
  };

  const generateResponse = (userInput: string): string => {
    const q = userInput.toLowerCase();
    if (q.includes('dinh dưỡng') || q.includes('ăn gì') || q.includes('tăng sữa')) {
      return `Để duy trì sức khỏe và sản xuất sữa tốt, mẹ nên:\n\n✅ Ăn đủ protein (cá hồi, trứng, thịt gà)\n✅ Uống đủ nước 8–10 cốc/ngày\n✅ Rau xanh đậm & trái cây tươi\n✅ Canxi từ sữa, phô mai, cá nhỏ\n✅ Hạnh nhân, óc chó, hạt chia\n\nBạn muốn tôi gợi ý thực đơn cụ thể không? 🍱`;
    }
    if (q.includes('sữa') || q.includes('bú')) {
      return `Về nuôi con bằng sữa mẹ 🤱\n\n• Bé nên bú 8–12 lần/ngày trong 2 tháng đầu\n• Mỗi lần bú khoảng 15–20 phút\n• Xen kẽ hai bên ngực\n• Nếu sữa ít, hãy cho bú thường xuyên hơn\n• Mẹ cần ngủ đủ giấc và ăn uống đầy đủ\n\nMẹ đang gặp vấn đề gì cụ thể không?`;
    }
    if (q.includes('bé') || q.includes('con') || q.includes('phát triển')) {
      return `Về phát triển của bé 👶\n\n🌱 0–2 tháng: Ngủ nhiều, bú và khóc để giao tiếp\n😊 2–4 tháng: Biết cười, theo dõi ánh sáng & khuôn mặt\n🤲 4–6 tháng: Nắm tay, lẫy, bắt đầu tập ngồi\n🍽️ 6+ tháng: Sẵn sàng ăn dặm\n\nBé của mẹ đang được bao nhiêu tuổi rồi?`;
    }
    if (q.includes('công thức') || q.includes('nấu ăn') || q.includes('món')) {
      return `Một số món ngon bổ dưỡng cho mẹ sau sinh 🍲\n\n🥣 Cháo cá hồi + rau chân vịt\n🍵 Canh gà hầm nấm linh chi\n🥗 Salad cá ngừ + dầu olive\n🫕 Súp bí đỏ + hạt bí\n\nMón nào mẹ muốn tôi hướng dẫn chi tiết?`;
    }
    if (q.includes('mệt') || q.includes('stress') || q.includes('lo lắng') || q.includes('buồn')) {
      return `Mẹ ơi, mệt mỏi sau sinh là hoàn toàn bình thường! 💗\n\n💡 Một vài lời khuyên:\n• Tranh thủ ngủ khi bé ngủ\n• Nhờ chồng/gia đình hỗ trợ bế bé\n• Ăn đủ bữa, không bỏ bữa\n• Đi bộ nhẹ 15 phút/ngày\n• Tâm sự với người thân khi cần\n\nNếu cảm thấy quá tải kéo dài, hãy nói chuyện với bác sĩ nhé. Mẹ không đơn độc! 🌸`;
    }
    return `Cảm ơn câu hỏi của mẹ! 😊\n\nTôi có thể giúp bạn về:\n• 🥗 Dinh dưỡng cho mẹ sau sinh\n• 👶 Phát triển và chăm sóc bé\n• 🍳 Công thức nấu ăn lành mạnh\n• 💊 Sức khỏe & phục hồi sau sinh\n\nHãy hỏi tôi bất cứ điều gì nhé!`;
  };

  if (!user || user.role === 'admin') return null;

  return (
    <MainLayout>
      <div className="space-y-4 h-full">

        {/* Chat Header */}
        <div className="rounded-2xl p-4 flex items-center gap-3 border border-violet-100"
          style={{ background: 'linear-gradient(135deg, #faf8ff, #f3eeff)' }}>
          <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shrink-0 overflow-hidden border border-violet-100">
            <BotAvatar size={52} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg leading-tight text-violet-900">Nori</h1>
            <p className="text-violet-400 text-xs">Trợ lý AI • Luôn sẵn sàng lắng nghe</p>
          </div>
          <div className="flex items-center gap-1.5 bg-violet-100 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-violet-500">Online</span>
          </div>
        </div>

        {/* Chat Window */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card flex flex-col overflow-hidden"
          style={{ height: 'calc(100vh - 300px)', minHeight: '420px' }}>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-white border border-green-100 flex items-center justify-center shrink-0 mb-0.5 overflow-hidden">
                    <BotAvatar size={30} />
                  </div>
                )}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  msg.type === 'user'
                    ? 'text-rose-900 rounded-br-sm'
                    : 'text-green-900 rounded-bl-sm'
                }`}
                  style={msg.type === 'user'
                    ? { background: '#fecdd3' }
                    : { background: '#dcfce7' }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-rose-400 text-right' : 'text-green-600'}`}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.type === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm shrink-0 mb-0.5">
                    👤
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-white border border-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <BotAvatar size={30} />
                </div>
                <div className="rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: '#dcfce7' }}>
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border/50 bg-background/50 p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 items-center"
            >
              <input
                className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground"
                placeholder="Nhập câu hỏi của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-violet-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-200 active:scale-95 shrink-0 border border-violet-200"
                style={{ background: '#ede9fe' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Gợi ý câu hỏi
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickSuggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => handleSend(s.text)}
                disabled={loading}
                className="flex items-center gap-2.5 text-left rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-sm text-foreground/80 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all disabled:opacity-50"
              >
                <s.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="leading-snug">{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
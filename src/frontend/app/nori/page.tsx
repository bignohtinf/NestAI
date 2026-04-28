'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Send, Loader2, Sparkles, Apple, ChefHat, HeartPulse, Baby, Stethoscope, Phone, Star, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  role: 'user' | 'assistant';
  content: string;
}

const MOCK_EXPERTS = [
  {
    id: 1,
    name: 'BS. CKII Nguyễn Thị Hương',
    title: 'Chuyên khoa Sản & Dinh dưỡng',
    hospital: 'Bệnh viện Từ Dũ',
    rating: 4.9,
    reviews: 128,
    avatar: '👩‍⚕️',
    price: '300.000đ/lần',
    available: 'Hôm nay, 14:00 - 16:00'
  },
  {
    id: 2,
    name: 'ThS. BS. Trần Văn Minh',
    title: 'Trưởng khoa Dinh dưỡng',
    hospital: 'Viện Dinh dưỡng Quốc gia',
    rating: 4.8,
    reviews: 85,
    avatar: '👨‍⚕️',
    price: '400.000đ/lần',
    available: 'Ngày mai, 09:00 - 11:30'
  },
  {
    id: 3,
    name: 'Phòng khám Sản khoa Hạnh Phúc',
    title: 'Đa khoa chuyên sâu',
    hospital: 'Quận 1, TP.HCM',
    rating: 4.7,
    reviews: 342,
    avatar: '🏥',
    price: 'Từ 250.000đ',
    available: 'Mở cửa 24/7'
  }
];

// PRD-aligned quick suggestions — pregnancy pain moments
const quickSuggestions = [
  { icon: Apple, text: 'Tiểu đường thai kỳ nên ăn gì hôm nay?' },
  { icon: HeartPulse, text: 'Thiếu sắt nên ăn gì để bổ sung?' },
  { icon: ChefHat, text: 'Tuần thai này cần vi chất gì thêm?' },
  { icon: Stethoscope, text: 'Tôi muốn đặt lịch khám bác sĩ' },
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
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role === 'admin') router.push('/');
  }, [user, router]);

  // Build a personalised opening message based on pregnancy week + condition
  useEffect(() => {
    if (messages.length === 0 && user) {
      const weekLabel =
        user.babyStatus === 'pregnant' && user.gestationWeeks
          ? `Tuần ${user.gestationWeeks} thai kỳ`
          : user.babyStatus === 'born' && user.weeksPostpartum
            ? `Tuần ${user.weeksPostpartum} sau sinh`
            : null;

      const conditionNote =
        user.condition === 'gdm'
          ? '\n\n⚠️ Tôi biết bạn đang theo dõi tiểu đường thai kỳ — tôi sẽ ưu tiên gợi ý món GI thấp cho bạn.'
          : user.condition === 'anemia'
            ? '\n\n🩸 Tôi biết bạn cần tăng cường sắt — tôi sẽ ưu tiên gợi ý thực phẩm giàu sắt.'
            : user.condition === 'hypertension'
              ? '\n\n💊 Tôi biết bạn đang quản lý huyết áp — tôi sẽ ưu tiên gợi ý món ít muối.'
              : '';

      setMessages([
        {
          id: '1',
          type: 'bot',
          content:
            `Xin chào ${user?.name}! 🌸\n\nTôi là Nori — trợ lý dinh dưỡng AI của bạn.${weekLabel ? ` Đang theo dõi ${weekLabel}.` : ''}${conditionNote}\n\nTôi có thể giúp bạn:\n\n• 🍚 Gợi ý món Việt phù hợp tuần thai và bệnh lý\n• 📊 Kiểm tra vi chất còn thiếu sau bữa ăn\n• ✅ Danh sách thực phẩm được/không được khi mang thai\n• 📋 Giải thích kết quả xét nghiệm (sắt, glucose)\n\nHôm nay mẹ cần tôi giúp gì? 🌿`,
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
    setShowSuggestions(false);

    const newHistory: ChatHistory[] = [
      ...chatHistory,
      { role: 'user', content: msg },
    ];

    try {
      // Build rich context: pregnancy week + condition + food preference per PRD
      const weekContext =
        user?.babyStatus === 'pregnant' && user.gestationWeeks
          ? `tuần ${user.gestationWeeks} thai kỳ`
          : user?.babyStatus === 'born' && user.weeksPostpartum
            ? `tuần ${user.weeksPostpartum} sau sinh`
            : 'chưa rõ giai đoạn';

      const conditionMap: Record<string, string> = {
        gdm: 'tiểu đường thai kỳ',
        anemia: 'thiếu máu/thiếu sắt',
        hypertension: 'cao huyết áp thai kỳ',
      };
      const conditionContext =
        user?.condition && user.condition !== 'none'
          ? `; Bệnh lý: ${conditionMap[user.condition] || user.condition}`
          : '';

      const foodCtx =
        user?.foodPreference && user.foodPreference !== 'no_pref'
          ? `; Hạn chế ăn: ${user.foodPreference}`
          : '';

      const userContext = user
        ? `[Người dùng: mẹ bầu Việt Nam. ${weekContext}${conditionContext}${foodCtx}. Trả lời tiếng Việt, ưu tiên gợi ý món Việt phù hợp.]`
        : '';

      const res = await fetch('/api/nori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, userContext }),
      });

      const data = await res.json();
      const botContent = data.response || generateFallback(msg);

      setChatHistory(newHistory);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: botContent,
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateFallback(msg),
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Offline fallback responses — pregnancy-focused per PRD
  const generateFallback = (userInput: string): string => {
    const q = userInput.toLowerCase();

    if (q.includes('tiểu đường') || q.includes('gdm') || q.includes('đường huyết')) {
      return `Với tiểu đường thai kỳ, nguyên tắc chính là:\n\n✅ Chọn thực phẩm GI thấp\n• Cơm gạo lứt thay gạo trắng\n• Bánh mì nguyên cám thay bánh mì trắng\n• Khoai lang thay khoai tây\n\n✅ Chia 5–6 bữa nhỏ/ngày thay vì 3 bữa lớn\n\n✅ Protein mỗi bữa: trứng, cá, đậu hũ\n\n✅ Rau xanh không giới hạn: cải xanh, rau muống, bông cải\n\n❌ Tránh: nước ngọt, bánh ngọt, trái cây ngọt nhiều (xoài chín, nho)\n\nBạn muốn tôi gợi ý thực đơn cụ thể cho một ngày không? 🍱`;
    }

    if (q.includes('thiếu sắt') || q.includes('thiếu máu') || q.includes('anemia')) {
      return `Để bổ sung sắt khi mang thai:\n\n🩸 Thực phẩm giàu sắt hem (hấp thụ tốt):\n• Thịt bò, thịt heo nạc\n• Gan gà/heo (2 lần/tuần)\n• Huyết heo, huyết bò\n\n🥬 Sắt non-hem + tăng hấp thụ:\n• Rau dền, rau muống, cải bó xôi\n• Đậu lăng, đậu đỏ\n• Uống kèm cam/chanh (Vitamin C tăng hấp thụ sắt)\n\n⚠️ Tránh uống trà/cà phê ngay sau bữa ăn — làm giảm hấp thụ sắt đến 60%\n\nBạn đang ở tuần thai bao nhiêu? Nhu cầu sắt tăng dần theo tam cá nguyệt.`;
    }

    if (q.includes('vi chất') || q.includes('folate') || q.includes('canxi') || q.includes('dha')) {
      return `Vi chất thiết yếu theo tam cá nguyệt:\n\n🤰 Tam cá nguyệt 1 (tuần 1–12):\n• Folate 600mcg/ngày — ngăn dị tật ống thần kinh\n• DHA 200mg/ngày — phát triển não\n• Nguồn: rau lá xanh đậm, cá hồi, óc chó\n\n🤰 Tam cá nguyệt 2 (tuần 13–27):\n• Canxi 1000mg/ngày — xương thai nhi\n• Sắt 27mg/ngày — bắt đầu tăng nhu cầu\n• Nguồn: sữa, phô mai, cá nhỏ ăn cả xương\n\n🤰 Tam cá nguyệt 3 (tuần 28–42):\n• Sắt 27mg/ngày — thiếu máu rất phổ biến\n• DHA tăng — não phát triển nhanh nhất\n• Nguồn: cá hồi, cá thu, trứng\n\nBạn muốn biết cụ thể tuần thai của mình cần gì?`;
    }

    if (q.includes('không ăn') || q.includes('tránh') || q.includes('kiêng') || q.includes('được ăn')) {
      return `Danh sách thực phẩm cần lưu ý khi mang thai:\n\n❌ Tuyệt đối tránh:\n• Rượu bia — mọi giai đoạn\n• Thịt sống, cá sống (sashimi, gỏi cá) — nguy cơ Listeria\n• Gan động vật quá nhiều — vitamin A liều cao gây dị tật\n• Cá lớn nhiều thủy ngân (cá mập, cá kiếm)\n\n⚠️ Hạn chế:\n• Cà phê < 200mg caffeine/ngày (khoảng 1 cốc nhỏ)\n• Hải sản tươi sống\n• Phô mai mềm chưa tiệt trùng\n\n✅ Hoàn toàn ổn:\n• Cá hồi nấu chín, cá ngừ đóng hộp (< 2 lần/tuần)\n• Trứng chín kỹ\n• Sữa tiệt trùng\n\nCó thực phẩm cụ thể nào bạn muốn tôi kiểm tra không?`;
    }

    if (q.includes('buồn nôn') || q.includes('ốm nghén') || q.includes('nôn')) {
      return `Ốm nghén tam cá nguyệt 1 — rất phổ biến! 🌿\n\nTips giảm buồn nôn:\n\n🍘 Ăn trước khi rời giường: bánh quy nhạt, bánh mì khô\n🍋 Ngửi hoặc uống nước chanh loãng\n🫚 Tránh thức ăn nhiều dầu mỡ và mùi nồng\n⏰ Ăn ít hơn nhưng thường xuyên hơn (5–6 bữa nhỏ)\n💧 Uống nước từng ngụm nhỏ, tránh uống nhiều một lúc\n🫚 Gừng: trà gừng, kẹo gừng giúp giảm buồn nôn\n\nNếu nôn nhiều hơn 3–4 lần/ngày hoặc không giữ được thức ăn, cần gặp bác sĩ để được hỗ trợ thêm nhé.`;
    }

    if (q.includes('bác sĩ') || q.includes('phòng khám') || q.includes('chuyên gia') || q.includes('đặt lịch')) {
      return `NestAI hiện đang hợp tác với các phòng khám và chuyên gia dinh dưỡng thai kỳ hàng đầu! 🏥\n\nBạn có thể nhấn vào nút **"Gặp chuyên gia"** ở phía trên màn hình để đặt lịch tư vấn trực tuyến (Telehealth) hoặc khám trực tiếp tại phòng khám gần nhất.\n\nTrong lúc chờ đợi, bạn có câu hỏi nào về dinh dưỡng để tôi hỗ trợ thêm không?`;
    }

    return `Cảm ơn câu hỏi của mẹ! 😊\n\nTôi có thể giúp về:\n• 🍚 Thực đơn theo tuần thai và bệnh lý\n• 🩸 Thực phẩm bổ sung sắt/folate/canxi/DHA\n• 👨‍⚕️ Kết nối bác sĩ/chuyên gia dinh dưỡng\n• 📋 Giải thích chỉ số xét nghiệm thai kỳ\n\nHãy hỏi tôi bất cứ điều gì nhé!`;
  };

  if (!user || user.role === 'admin') return null;

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 h-[calc(100dvh-12rem)] md:h-[calc(100dvh-9rem)] min-h-[600px]">
        {/* Chat Window */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card flex flex-col overflow-hidden flex-1">
          
          {/* Action Header - Expert Connection */}
          <div className="bg-primary/5 border-b border-primary/10 px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary/90">
                Cần tư vấn chuyên sâu?
              </span>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-7 text-xs px-3 rounded-full shadow-sm bg-primary hover:bg-primary/90"
                >
                  <Phone className="h-3 w-3 mr-1.5" /> Gặp chuyên gia
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 dark:text-slate-100">Đặt lịch chuyên gia / phòng khám</DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed text-left">
                    Chọn chuyên gia hoặc phòng khám phù hợp với nhu cầu của bạn để được tư vấn trực tiếp.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2.5 py-1">
                  {MOCK_EXPERTS.map(expert => (
                    <div key={expert.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-colors cursor-pointer bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                        {expert.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{expert.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{expert.title} • {expert.hospital}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-500 font-medium bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-500/20">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {expert.rating} ({expert.reviews})
                          </span>
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Clock className="h-3 w-3" /> {expert.available}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2.5 shrink-0 border border-primary/30 text-primary hover:bg-primary hover:text-white" onClick={(e) => { e.stopPropagation(); alert('Đã ghi nhận lịch hẹn mô phỏng.'); }}>
                        Chọn
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

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
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.type === 'user'
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
                placeholder="Hỏi về dinh dưỡng thai kỳ..."
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
        {showSuggestions && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Câu hỏi phổ biến
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
        )}
      </div>
    </MainLayout>
  );
}
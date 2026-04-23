'use client';

import { MainLayout } from '@/components/layouts/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BotAnimation } from '@/components/nori/bot-animation';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, Loader2, Sparkles, Baby, Apple, HeartPulse, Scale, Milk } from 'lucide-react';

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

const SUGGESTED_QUESTIONS = [
  { icon: <Apple className="h-3.5 w-3.5" />, text: 'Thai 20 tuần cần bổ sung dinh dưỡng gì?', category: 'nutrition' },
  { icon: <HeartPulse className="h-3.5 w-3.5" />, text: 'Tiểu đường thai kỳ ăn gì, kiêng gì?', category: 'gdm' },
  { icon: <Baby className="h-3.5 w-3.5" />, text: 'Canxi cho mẹ bầu: bao nhiêu, ăn gì?', category: 'mineral' },
  { icon: <Scale className="h-3.5 w-3.5" />, text: 'Tăng cân bao nhiêu là đủ khi mang thai?', category: 'weight' },
  { icon: <Milk className="h-3.5 w-3.5" />, text: 'Ăn gì để nhiều sữa sau sinh?', category: 'breastfeeding' },
  { icon: <Sparkles className="h-3.5 w-3.5" />, text: 'Bổ sung sắt và acid folic thế nào?', category: 'supplement' },
];

function formatBotMessage(content: string): React.ReactNode {
  // Simple markdown-like formatting for bot messages
  const lines = content.split('\n');
  return lines.map((line, i) => {
    // Bold text
    let formatted: React.ReactNode = line;
    if (line.includes('**')) {
      const parts = line.split('**');
      formatted = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
    }
    // Headers
    if (line.startsWith('### ')) {
      return <p key={i} className="font-bold text-base mt-2 mb-1">{line.slice(4)}</p>;
    }
    if (line.startsWith('## ')) {
      return <p key={i} className="font-bold text-base mt-2 mb-1">{line.slice(3)}</p>;
    }
    // Empty lines
    if (line.trim() === '') {
      return <br key={i} />;
    }
    return <p key={i} className="leading-relaxed">{formatted}</p>;
  });
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else if (user.role === 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          type: 'bot',
          content: `Xin chào ${user?.name || 'bạn'}! 👋\n\nTôi là **Nori** - trợ lý dinh dưỡng AI cho mẹ bầu và mẹ cho con bú.\n\nTôi tư vấn dựa trên hướng dẫn chính thức của **Bộ Y tế Việt Nam** (QĐ 776 & QĐ 1470).\n\n🍽️ Dinh dưỡng theo từng giai đoạn thai kỳ\n🩺 Tiểu đường thai kỳ - sàng lọc & chế độ ăn\n💊 Bổ sung vi chất: sắt, canxi, folate, DHA\n🤱 Dinh dưỡng cho mẹ cho con bú\n⚖️ Tăng cân hợp lý khi mang thai\n\nBạn muốn hỏi về vấn đề nào?`,
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

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowSuggestions(false);

    const newHistory: ChatHistory[] = [
      ...chatHistory,
      { role: 'user', content: text },
    ];

    try {
      const userContext = user
        ? `Tuần thai/sau sinh: ${user.weeksPostpartum || 'chưa rõ'}. Vai trò: ${user.role || 'mẹ'}.`
        : '';

      const res = await fetch('/api/nori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          userContext,
        }),
      });

      const data = await res.json();
      const botContent = data.response || 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setChatHistory([...newHistory, { role: 'assistant', content: botContent }]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại. 🙏',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, chatHistory, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (text: string) => {
    sendMessage(text);
  };

  if (!user || user.role === 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0">
            <BotAnimation />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Nori
              <Badge variant="secondary" className="text-xs font-normal">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Bộ Y tế
              </Badge>
            </h1>
            <p className="text-sm text-muted-foreground">Trợ lý dinh dưỡng thông minh • QĐ 776 & QĐ 1470/BYT</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
                    N
                  </div>
                )}
                <div
                  className={`max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted rounded-bl-sm'
                  }`}
                >
                  <div className="text-sm">
                    {message.type === 'bot'
                      ? formatBotMessage(message.content)
                      : <p className="whitespace-pre-wrap">{message.content}</p>
                    }
                  </div>
                  <p className={`text-[10px] mt-1.5 ${message.type === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground/60'}`}>
                    {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                  N
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Nori đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">💡 Gợi ý câu hỏi:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-background text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
                    disabled={loading}
                  >
                    {q.icon}
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Hỏi Nori về dinh dưỡng thai kỳ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 rounded-full"
              />
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                size="icon"
                className="rounded-full h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

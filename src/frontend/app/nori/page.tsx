'use client';

import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { Send, Loader2, Sparkles, Apple, ChefHat, HeartPulse, Stethoscope, Phone, Star, Clock, Mic, Volume2, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useChatHistory, ChatMessage } from '@/hooks/useChatHistory';
import { ChatHistoryToggle } from '@/components/chat/chat-history-toggle';
import { Sidebar } from '@/components/navigation/sidebar';
import { Header } from '@/components/navigation/header';
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav';
import { OnboardingGuard } from '@/components/layouts/onboarding-guard';
import { botPregnantApi } from '@/lib/bot-pregnant-api';
import { apiCall } from '@/lib/api';

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

const quickSuggestions = [
  { icon: Apple, text: 'Tiểu đường thai kỳ nên ăn gì hôm nay?' },
  { icon: HeartPulse, text: 'Thiếu sắt nên ăn gì để bổ sung?' },
  { icon: ChefHat, text: 'Tuần thai này cần vi chất gì thêm?' },
  { icon: Stethoscope, text: 'Tôi muốn đặt lịch khám bác sĩ' },
];

const BOT_FRAMES = ['/bot_1.png', '/bot_2.png', '/bot_3.png'];

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

function NoriPageInner() {
  const { user } = useApp();
  const router = useRouter();
  const { createChatHistory, updateChatHistory, generateChatTitle, getChatHistory, addMessagesToChat } = useChatHistory();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showHistorySidebar, setShowHistorySidebar] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChatTitle, setCurrentChatTitle] = useState<string>('Cuộc trò chuyện mới');
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('id');
  const [isBotReady, setIsBotReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Input (STT - FPT.AI ASR via MediaRecorder)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Voice Output (TTS - FPT.AI)
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setPlayingMsgId(null);
    setIsTtsLoading(false);
  };

  const handleSpeak = async (msgId: string, text: string) => {
    if (playingMsgId === msgId) {
      stopTTS();
      return;
    }
    stopTTS();
    setIsTtsLoading(true);
    setPlayingMsgId(msgId);
    try {
      const res = await fetch('/api/nori/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'banmai' }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('[TTS] Failed:', res.status, errJson);
        throw new Error('TTS failed');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setIsTtsLoading(false);
      audio.onended = () => { setPlayingMsgId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setPlayingMsgId(null); URL.revokeObjectURL(url); };
      audio.play();
    } catch (err) {
      console.error('[TTS] Error:', err);
      stopTTS();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioToSTT(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('[STT] Microphone error:', err);
      alert('Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsTranscribing(true);
  };

  const sendAudioToSTT = async (audioBlob: Blob) => {
    try {
      const res = await fetch('/api/nori/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: audioBlob,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[STT] Failed:', res.status, err);
        throw new Error('STT failed');
      }
      const { transcript } = await res.json();
      if (transcript) {
        setInput(transcript);
        setTimeout(() => handleSend(transcript), 300);
      }
    } catch (err) {
      console.error('[STT] Error:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTTS();
      mediaRecorderRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    
    const checkHealth = async () => {
      console.log('[Nori] Starting health check loop...');
      while (mounted) {
        try {
          attempts++;
          const isOk = await botPregnantApi.healthCheck();
          
          if (isOk) {
            console.log(`[Nori] Health check passed after ${attempts} attempts`);
            if (mounted) setIsBotReady(true);
            break;
          } else {
            if (attempts % 5 === 0) {
              console.warn(`[Nori] Health check still failing after ${attempts} attempts...`);
            }
          }
        } catch (e) {
          console.error('[Nori] Health check error:', e);
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    };
    
    checkHealth();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!user) router.push('/auth/login');
    else if (user.role === 'admin') router.push('/');
  }, [user, router]);

  // Load chat history if ID is in URL
  useEffect(() => {
    if (chatIdFromUrl && chatIdFromUrl !== currentChatId) {
      handleSelectChat(chatIdFromUrl);
    }
  }, [chatIdFromUrl]);

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

  const handleToggle = () => {
    const newState = !showHistorySidebar;
    setShowHistorySidebar(newState);
    localStorage.setItem('showChatHistory', JSON.stringify(newState));
    
    // Dispatch custom event để sidebar lắng nghe
    window.dispatchEvent(new CustomEvent('chatHistoryToggle', { detail: newState }));
  };

  const handleNewChat = async () => {
    try {
      const newChat = await createChatHistory('Cuộc trò chuyện mới', []);
      setCurrentChatId(newChat.id);
      setCurrentChatTitle('Cuộc trò chuyện mới');
      router.push(`/nori?id=${newChat.id}`);
      setMessages([]);
      setChatHistory([]);
      setInput('');
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (!chatId || chatId === 'undefined') return;
    console.log('NoriPage handleSelectChat called with:', chatId);
    try {
      setLoading(true);
      const data = await getChatHistory(chatId);
      if (data && data.messages) {
        const loadedMessages = data.messages.map((m: any, i: number) => ({
           id: Date.now().toString() + i,
           type: m.role === 'user' ? 'user' : 'bot',
           content: m.content,
           timestamp: new Date(m.timestamp || Date.now())
        }));
        setMessages(loadedMessages);
        setChatHistory(data.messages);
        setCurrentChatId(chatId);
        setCurrentChatTitle(data.title || 'Cuộc trò chuyện mới');
        if (chatIdFromUrl !== chatId) {
          router.push(`/nori?id=${chatId}`);
        }
        setShowSuggestions(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

    // Create bot message placeholder for streaming
    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      type: 'bot',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botMsg]);

    try {
      // Prepare request payload for streaming endpoint
      const requestPayload = {
        user_id: user?.id,
        question: msg,
        conversation_id: null, // Can be set if tracking conversations
        chat_history: newHistory,
        user_profile: user ? {
          id: user.id,
          name: user.name,
          gestation_weeks: user.babyStatus === 'pregnant' ? user.gestationWeeks : null,
          condition: user.condition !== 'none' ? user.condition : null,
          food_preference: user.foodPreference !== 'no_pref' ? user.foodPreference : null,
          baby_status: user.babyStatus,
        } : null,
      };

      // Gọi thẳng Cloud Run backend (bỏ qua Vercel proxy để tránh timeout 10s)
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      let fullResponse = '';
      let hasError = false;

      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), 60000); // 60s timeout

      try {
        const response = await fetch(`${BACKEND_URL}/api/bot-pregnant/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
          signal: timeoutController.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === 'token' && data.content) {
                fullResponse += data.content;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === botMsgId ? { ...m, content: fullResponse } : m
                  )
                );
              } else if (data.type === 'done') {
                streamDone = true;
              } else if (data.type === 'error') {
                hasError = true;
                throw new Error(data.error || 'Stream error');
              }
            } catch (e) { /* bỏ qua dòng lỗi format */ }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.error('[Nori] Stream timeout after 60s');
        } else {
          console.error('[Nori] Stream error:', err);
          hasError = true;
        }
        if (!fullResponse) {
          const fallbackContent = generateFallback(msg);
          setMessages(prev =>
            prev.map(m =>
              m.id === botMsgId ? { ...m, content: fallbackContent } : m
            )
          );
          setLoading(false);
          return;
        }
      } finally {
        clearTimeout(timeoutId);
      }

      const onDone = async () => {
        console.log('[Nori] Stream done. fullResponse length:', fullResponse.length);
        
        const assistantMsg = { role: 'assistant' as const, content: fullResponse };
        const updatedHistory = [...newHistory, assistantMsg];
        setChatHistory(updatedHistory);

        // Generate title if the chat doesn't have a real title yet
        const needsTitleGeneration = !currentChatId || currentChatTitle === 'Cuộc trò chuyện mới';
        console.log('[Nori] needsTitleGeneration check:', { currentChatTitle, currentChatId, needsTitleGeneration });
        
        if (needsTitleGeneration) {
          console.log('[Nori] Triggering title generation for:', msg);
          try {
            const data = await generateChatTitle(msg);
            console.log('[Nori] generateChatTitle response:', data);
            
            if (data && data.title) {
              const finalTitle = data.title;
              const isGreeting = data.is_greeting;
              
              if (currentChatId) {
                console.log('[Nori] Chat exists, checking if title update needed. isGreeting:', isGreeting);
                if (!isGreeting) {
                  console.log('[Nori] Calling updateChatHistory with:', finalTitle);
                  await updateChatHistory(currentChatId, finalTitle);
                  setCurrentChatTitle(finalTitle);
                }
                
                console.log('[Nori] Calling addMessagesToChat');
                await addMessagesToChat(currentChatId, [
                  { role: 'user', content: msg },
                  { role: 'assistant', content: fullResponse },
                ]);
              } else {
                console.log('[Nori] Chat does not exist, creating new chat with title:', finalTitle);
                const chatMessages: ChatMessage[] = [
                  { role: 'user', content: msg },
                  { role: 'assistant', content: fullResponse },
                ];
                const newChat = await createChatHistory(finalTitle, chatMessages);
                console.log('[Nori] New chat created with ID:', newChat.id);
                setCurrentChatId(newChat.id);
                setCurrentChatTitle(finalTitle);
                router.push(`/nori?id=${newChat.id}`);
              }
            }
          } catch (err) {
            console.error('[Nori] Error in title generation/saving:', err);
          }
        } else if (currentChatId) {
          console.log('[Nori] Not first message, appending to existing chat:', currentChatId);
          try {
            await addMessagesToChat(currentChatId, [
              { role: 'user', content: msg },
              { role: 'assistant', content: fullResponse },
            ]);
            console.log('[Nori] Messages appended successfully');
          } catch (err) {
            console.error('[Nori] Failed to append messages:', err);
          }
        }

        setLoading(false);
      };

      await onDone();


    } catch (error) {
      console.error('Error initiating stream:', error);
      const fallbackContent = generateFallback(msg);
      setMessages(prev =>
        prev.map(m =>
          m.id === botMsgId ? { ...m, content: fallbackContent } : m
        )
      );
      setLoading(false);
    }
  };

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
    <OnboardingGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar 
          open={sidebarOpen} 
          onOpenChange={setSidebarOpen} 
          activeChatId={currentChatId}
          onSelectChat={handleSelectChat}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-hidden w-full">
            {!isBotReady ? (
              <div className="flex flex-col items-center justify-center h-full space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                  <BotAvatar size={160} />
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <h3 className="text-xl font-bold text-primary animate-pulse">Nori đang khởi động...</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang chuẩn bị kiến thức dinh dưỡng thai kỳ
                  </p>
                </div>
              </div>
            ) : (
            <div className="flex h-full gap-0">
              {/* Chat History Toggle - Sát sidebar */}
              <div className="flex flex-col items-center justify-start pt-4 w-12 shrink-0 border-r border-border/30">
                <ChatHistoryToggle 
                  isOpen={showHistorySidebar} 
                  onToggle={handleToggle}
                  onNewChat={handleNewChat}
                />
              </div>

              {/* Main Chat Area - Mở rộng toàn bộ */}
              <div className="flex flex-col gap-4 flex-1 p-6">
          {/* Chat Window */}
          <div className="rounded-2xl bg-card shadow-card flex flex-col overflow-hidden flex-1">
            {/* Action Header */}
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
                  <Button style={{ backgroundColor: '#dcfce7', borderColor: '#dcfce7', color: '#166534' }}
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
                    <div className={`flex items-center mt-1 gap-1.5 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-xs ${msg.type === 'user' ? 'text-rose-400' : 'text-green-600'}`}>
                        {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.type === 'bot' && msg.content && (
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          disabled={isTtsLoading && playingMsgId !== msg.id}
                          title={playingMsgId === msg.id ? 'Dừng đọc' : 'Đọc tin nhắn'}
                          className={`h-5 w-5 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                            playingMsgId === msg.id
                              ? 'bg-green-500 text-white'
                              : 'text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {isTtsLoading && playingMsgId === msg.id
                            ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            : playingMsgId === msg.id
                              ? <Square className="h-2.5 w-2.5 fill-current" />
                              : <Volume2 className="h-2.5 w-2.5" />
                          }
                        </button>
                      )}
                    </div>
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
              {isRecording && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <div className="flex gap-0.5 items-center">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="w-1 rounded-full bg-red-400 animate-bounce" style={{ height: `${8 + (i % 2) * 8}px`, animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                  <span className="text-xs text-red-500 font-medium">Đang ghi âm... bấm lại để dừng 🎙️</span>
                </div>
              )}
              {isTranscribing && (
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-primary font-medium">Đang nhận dạng giọng nói...</span>
                </div>
              )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2 items-center"
              >
                {/* Mic button */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading || isTranscribing}
                  title={isRecording ? 'Dừng ghi âm' : 'Nói chuyện với Nori'}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 border ${
                    isRecording
                      ? 'bg-red-500 border-red-500 text-white animate-pulse'
                      : 'border-rose-200 text-rose-500 hover:bg-rose-100'
                  }`}
                  style={isRecording ? {} : { background: '#fff1f2' }}
                >
                  {isTranscribing
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : isRecording
                      ? <Square className="h-3.5 w-3.5 fill-current" />
                      : <Mic className="h-4 w-4" />
                  }
                </button>

                <input
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition-all placeholder:text-muted-foreground"
                  placeholder={isRecording ? '🎙️ Đang ghi âm...' : isTranscribing ? '⏳ Đang xử lý...' : 'Hỏi về dinh dưỡng thai kỳ...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading || isRecording || isTranscribing}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim() || isRecording || isTranscribing}
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
            </div>
            )}
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </OnboardingGuard>
  );
}

export default function NoriPage() {
  return (
    <Suspense fallback={null}>
      <NoriPageInner />
    </Suspense>
  );
}
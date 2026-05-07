'use client';

import { useState, useEffect } from 'react';
import { useChatHistory, ChatHistoryItem } from '@/hooks/useChatHistory';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreVertical, Trash2, Download, ChevronDown } from 'lucide-react';
import { ClientOnlyDate } from './client-only-date';
import { cn } from '@/lib/utils';

interface ChatHistoryTabProps {
  onSelectChat?: (chatId: string) => void;
  isVisible?: boolean;
  activeChatId?: string | null;
}

export function ChatHistoryTab({ onSelectChat, isVisible = true, activeChatId }: ChatHistoryTabProps) {
  const { getChatHistories, deleteChatHistory } = useChatHistory();
  const [histories, setHistories] = useState<ChatHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadHistories();

    const handleUpdate = () => {
      setOffset(0);
      loadHistories(0);
    };
    window.addEventListener('chatHistoryUpdated', handleUpdate);
    return () => window.removeEventListener('chatHistoryUpdated', handleUpdate);
  }, []);

  const loadHistories = async (offsetOverride?: number) => {
    try {
      setLoading(true);
      const currentOffset = offsetOverride !== undefined ? offsetOverride : offset;
      const response = await getChatHistories(10, currentOffset);
      const data = response.data || [];
      if (currentOffset === 0) {
        setHistories(data);
      } else {
        setHistories(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
    } catch (err) {
      console.error('Failed to load chat histories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Bạn chắc chắn muốn xóa cuộc trò chuyện này?')) {
      try {
        await deleteChatHistory(chatId);
        setHistories(prev => prev.filter(h => h.id !== chatId));
      } catch (err) {
        console.error('Failed to delete chat history:', err);
      }
    }
  };

  const handleDownload = (e: React.MouseEvent, history: ChatHistoryItem) => {
    e.stopPropagation();
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${history.title}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <>
      {isVisible && (
        <div className="space-y-2">


          {loading && histories.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Đang tải...
            </div>
          ) : histories.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Chưa có cuộc trò chuyện
            </div>
          ) : (
            <>
              <div className="space-y-1 px-1">
                {histories.slice(0, 5).map(history => (
                  <div
                    key={history.id}
                    onMouseEnter={() => setHoveredId(history.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      if (history.id && history.id !== 'undefined') {
                        onSelectChat?.(history.id);
                      }
                    }}
                    className={cn(
                      "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors cursor-pointer",
                      activeChatId === history.id 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium">{history.title}</p>
                      <ClientOnlyDate dateStr={history.created_at} className="text-[11px] text-muted-foreground/70" />
                    </div>

                    {hoveredId === history.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-muted"
                              onClick={e => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                              <DialogTitle className="text-sm">Tùy chọn</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={e => handleDownload(e, history)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Tải xuống
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm text-destructive hover:text-destructive"
                                onClick={e => handleDelete(e, history.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {histories.length > 5 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs h-8 text-primary hover:bg-primary/10"
                      onClick={() => setOffset(0)}
                    >
                      <ChevronDown className="h-3.5 w-3.5 mr-1" />
                      Xem thêm ({histories.length})
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">

                    <div className="flex-1 overflow-y-auto space-y-1 pr-4">
                      {histories.map(history => (
                        <div
                          key={history.id}
                          onMouseEnter={() => setHoveredId(history.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => {
                            if (history.id && history.id !== 'undefined') {
                              onSelectChat?.(history.id);
                            }
                          }}
                          className={cn(
                            "group relative flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                            activeChatId === history.id 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{history.title}</p>
                            <ClientOnlyDate dateStr={history.created_at} className="text-xs text-muted-foreground/70" />
                          </div>

                          {hoveredId === history.id && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-muted"
                                onClick={e => handleDownload(e, history)}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-destructive/10 text-destructive"
                                onClick={e => handleDelete(e, history.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs border border-border/50"
                        onClick={() => {
                          setOffset(prev => prev + 10);
                          loadHistories();
                        }}
                      >
                        Tải thêm
                      </Button>
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

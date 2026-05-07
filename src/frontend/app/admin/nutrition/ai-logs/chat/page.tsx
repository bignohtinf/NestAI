'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, User, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/api';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await adminApi.getChatLogs();
        setLogs(data.logs || []);
      } catch (error) {
        console.error('Failed to fetch chat logs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const handleRowClick = async (log: any) => {
    setSelectedChat(log);
    setIsDialogOpen(true);
    setLoadingMessages(true);
    try {
      const data = await adminApi.getChatMessages(log.id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          Lịch sử Chat Nori
        </h1>
        <p className="text-gray-500 mt-2">Xem nội dung các cuộc hội thoại ẩn danh với AI Nori</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chat Conversations</CardTitle>
          <CardDescription>Danh sách các cuộc hội thoại gần đây. Nhấn vào hàng để xem nội dung.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500 italic">Đang tải dữ liệu...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Chưa có dữ liệu cuộc hội thoại nào.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Phiên</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Cập nhật cuối</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleRowClick(log)}
                  >
                    <TableCell className="font-mono text-[10px] text-gray-400">
                      {log.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">{log.title}</TableCell>
                    <TableCell>{format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>{format(new Date(log.updated_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              {selectedChat?.title || 'Chi tiết cuộc hội thoại'}
            </DialogTitle>
            <DialogDescription>
              ID Phiên: {selectedChat?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-[60vh] px-6 py-4">
              {loadingMessages ? (
                <div className="flex flex-col justify-center items-center h-full py-20 text-gray-500 gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span>Đang tải nội dung tin nhắn...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 text-gray-500 italic">Không tìm thấy tin nhắn nào.</div>
              ) : (
                <div className="space-y-6 pb-4">
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.role === 'assistant' ? 'items-start' : 'items-end'}`}
                    >
                      <div className={`flex items-center gap-2 mb-1 ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                        {msg.role === 'assistant' ? (
                          <>
                            <div className="bg-blue-100 p-1.5 rounded-full">
                              <Bot className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-tight">Nori AI</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-gray-100 p-1.5 rounded-full">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Người dùng</span>
                          </>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">
                          {format(new Date(msg.timestamp), 'HH:mm:ss')}
                        </span>
                      </div>
                      <div 
                        className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'assistant' 
                            ? 'bg-blue-50 text-gray-800 rounded-tl-none border border-blue-100 shadow-sm' 
                            : 'bg-gray-100 text-gray-800 rounded-tr-none border border-gray-200'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button 
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Đóng
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

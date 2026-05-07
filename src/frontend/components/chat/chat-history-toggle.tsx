'use client';

import { Button } from '@/components/ui/button';
import { TbLayoutNavbarCollapseFilled, TbLayoutNavbarExpand } from 'react-icons/tb';
import { RiChatNewFill } from 'react-icons/ri';

interface ChatHistoryToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
}

export function ChatHistoryToggle({ isOpen, onToggle, onNewChat }: ChatHistoryToggleProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        variant="ghost"
        onClick={onToggle}
        className="h-10 w-10 p-0 text-primary hover:bg-primary/10 transition-all duration-300"
        title={isOpen ? 'Ẩn lịch sử chat' : 'Hiện lịch sử chat'}
      >
        {isOpen ? (
          <TbLayoutNavbarCollapseFilled className="h-5 w-5 transition-transform duration-300" />
        ) : (
          <TbLayoutNavbarExpand className="h-5 w-5 transition-transform duration-300" />
        )}
      </Button>
      <Button
        size="lg"
        variant="ghost"
        onClick={onNewChat}
        className="h-10 w-10 p-0 text-primary hover:bg-primary/10 transition-all duration-300"
        title="Tạo đoạn chat mới"
      >
        <RiChatNewFill className="h-5 w-5" />
      </Button>
    </div>
  );
}

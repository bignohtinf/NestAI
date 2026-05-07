'use client';

import type React from 'react';
import {
  BarChart2,
  CreditCard,
  Folder,
  Wallet,
  Users2,
  Shield,
  MessagesSquare,
  Settings,
  HelpCircle,
  ChevronDown,
  Home,
  ShoppingCart,
  Package,
  FileText,
  Database,
  Globe,
  Mail,
  Calendar,
  ImageIcon,
  Zap,
  Code,
  Layers,
  Monitor,
  PieChart,
  TrendingUp,
  Activity,
  Target,
  UserPlus,
  UserX,
  Lock,
  Key,
  Eye,
  Bell,
  MessageSquare,
  Camera,
  Headphones,
  Play,
  Bookmark,
  Tag,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Plus,
  Minus,
  Check,
  Star,
  Map,
  Truck,
  Clock,
  Timer,
  DollarSign,
  TrendingDown,
  Puzzle,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type MenuState = 'full' | 'collapsed' | 'hidden';

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  badge?: string;
  isNew?: boolean;
  children?: SubMenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  badge?: string;
  isNew?: boolean;
  children?: SubMenuItem[];
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

const menuData: MenuSection[] = [
  {
    id: 'overview',
    label: '1. Tổng quan',
    items: [
      {
        id: 'dashboard',
        label: 'Bảng điều khiển - Dashboard',
        href: '/admin',
        icon: Home,
      },
      {
        id: 'analytics',
        label: 'Thống kê Analytics',
        href: '/admin/analytics',
        icon: BarChart2,
        children: [
          {
            id: 'user-stats',
            label: 'Thống kê người dùng',
            href: '/admin/analytics/users',
            icon: Users2,
          },
          {
            id: 'chat-stats',
            label: 'Thống kê hội thoại AI',
            href: '/admin/analytics/chat',
            icon: MessageSquare,
          },
          {
            id: 'health-stats',
            label: 'Chỉ số sức khỏe cộng đồng',
            href: '/admin/analytics/health',
            icon: Activity,
          },
        ],
      },
    ],
  },
  {
    id: 'users',
    label: '2. Quản lý người dùng',
    items: [
      {
        id: 'user-list',
        label: 'Danh sách người dùng',
        href: '/admin/users',
        icon: Users2,
      },
      {
        id: 'medical-profiles',
        label: 'Hồ sơ y tế & Thai kỳ',
        href: '/admin/users/medical-profiles',
        icon: FileText,
      },
    ],
  },
  {
    id: 'nutrition',
    label: '3. Dinh dưỡng & Hoạt động',
    items: [
      {
        id: 'ai-logs',
        label: 'Nhật ký hoạt động AI',
        href: '/admin/nutrition/ai-logs',
        icon: Database,
        children: [
          {
            id: 'chat-logs',
            label: 'Lịch sử Chat Nori',
            href: '/admin/nutrition/ai-logs/chat',
            icon: MessageSquare,
          },
          {
            id: 'scan-logs',
            label: 'Lịch sử Scan món ăn',
            href: '/admin/nutrition/ai-logs/scan',
            icon: Camera,
          },
          {
            id: 'recommendation-logs',
            label: 'Lịch sử Gợi ý thực đơn',
            href: '/admin/nutrition/ai-logs/recommendations',
            icon: Bookmark,
          },
        ],
      },
      {
        id: 'food-db',
        label: 'Quản lý thực phẩm',
        href: '/admin/nutrition/food-database',
        icon: Package,
        children: [
          {
            id: 'dishes',
            label: 'Danh mục món ăn & Dinh dưỡng',
            href: '/admin/nutrition/food-database/dishes',
            icon: ShoppingCart,
          },
          {
            id: 'ingredients',
            label: 'Nguyên liệu gốc',
            href: '/admin/nutrition/food-database/ingredients',
            icon: Tag,
          },
        ],
      },
    ],
  },
  {
    id: 'stores',
    label: '4. Cửa hàng & Đối tác',
    items: [
      {
        id: 'store-list',
        label: 'Danh sách cửa hàng/Siêu thị',
        href: '/admin/stores',
        icon: Globe,
      },
      {
        id: 'store-mapping',
        label: 'Liên kết Món ăn - Cửa hàng',
        href: '/admin/stores/mapping',
        icon: LinkIcon,
      },
      {
        id: 'locations',
        label: 'Quản lý vị trí & Bản đồ',
        href: '/admin/stores/locations',
        icon: Map,
      },
    ],
  },
  {
    id: 'ai-hub',
    label: '5. Trung tâm AI - Quản trị thuật toán',
    items: [
      {
        id: 'algorithms',
        label: 'Cấu hình thuật toán',
        href: '/admin/ai-hub/algorithms',
        icon: Zap,
        children: [
          {
            id: 'menu-algo',
            label: 'Thuật toán gợi ý thực đơn',
            href: '/admin/ai-hub/algorithms/menu-recommendation',
            icon: Target,
          },
          {
            id: 'scan-algo',
            label: 'Thuật toán nhận diện thực phẩm',
            href: '/admin/ai-hub/algorithms/food-recognition',
            icon: Camera,
          },
        ],
      },
      {
        id: 'rag',
        label: 'Quản lý tri thức RAG - Docs',
        href: '/admin/ai-hub/rag',
        icon: Database,
      },
      {
        id: 'monitoring',
        label: 'Giám sát Token & Model',
        href: '/admin/ai-hub/monitoring',
        icon: Monitor,
      },
    ],
  },
  {
    id: 'system',
    label: '6. Hệ thống',
    items: [
      {
        id: 'cms',
        label: 'Bài viết & Thông báo',
        href: '/admin/system/cms',
        icon: FileText,
      },
      {
        id: 'settings',
        label: 'Cài đặt & Bảo mật',
        href: '/admin/system/settings',
        icon: Settings,
      },
    ],
  },
];

interface AdminSidebarProps {
  menuState: MenuState;
  setMenuState: (state: MenuState) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isMobile?: boolean;
}

export default function AdminSidebar({
  menuState,
  setMenuState,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isMobile: isMobileProp,
}: AdminSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileInternal, setIsMobileInternal] = useState(false);
  const isMobile = isMobileProp ?? isMobileInternal;
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isMobileProp !== undefined) return;
    
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setIsMobileInternal(!isDesktop);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileProp]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  function handleNavigation() {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }

  const showText =
    menuState === 'full' ||
    (menuState === 'collapsed' && isHovered) ||
    (isMobile && isMobileMenuOpen);

  function NavItem({
    item,
    level = 0,
    parentId = '',
  }: {
    item: MenuItem | SubMenuItem;
    level?: number;
    parentId?: string;
  }) {
    const itemId = `${parentId}-${item.id}`;
    const isExpanded = expandedItems.has(itemId);
    const hasChildren = item.children && item.children.length > 0;
    const showExpandIcon = hasChildren && showText;

    const paddingLeft =
      level === 0 ? 'px-3' : level === 1 ? 'pl-8 pr-3' : 'pl-12 pr-3';

    const content = (
      <div
        className={cn(
          'flex items-center py-2 text-sm rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 relative group cursor-pointer',
          paddingLeft
        )}
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(itemId);
          } else if (item.href) {
            window.location.href = item.href;
            handleNavigation();
          }
        }}
        title={
          menuState === 'collapsed' && !isHovered && !isMobile
            ? item.label
            : undefined
        }
      >
        {'icon' in item && item.icon ? (
          <item.icon className="h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        ) : null}

        {showText && (
          <>
            <span className="ml-3 flex-1 transition-opacity duration-200 text-gray-700 dark:text-gray-300">
              {item.label}
            </span>

            <div className="flex items-center space-x-1">
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  New
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 rounded-full">
                  {item.badge}
                </span>
              )}
              {showExpandIcon && (
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-200 text-gray-400',
                    isExpanded ? 'rotate-180' : 'rotate-0'
                  )}
                />
              )}
            </div>
          </>
        )}

        {menuState === 'collapsed' && !isHovered && !isMobile && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1 text-rose-300">({item.badge})</span>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div>
        {item.href && !hasChildren ? (
          <Link href={item.href} onClick={handleNavigation}>
            {content}
          </Link>
        ) : (
          content
        )}
        {hasChildren && isExpanded && showText && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                level={level + 1}
                parentId={itemId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const getSidebarWidth = () => {
    if (isMobile) return 'w-64';
    if (menuState === 'collapsed' && isHovered) return 'w-64';
    return menuState === 'collapsed' ? 'w-16' : 'w-64';
  };

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <nav
          className={`
            fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-gray-950
            border-r border-gray-200 dark:border-gray-800
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="h-16 px-3 flex items-center border-b border-gray-200 dark:border-gray-800">
              <Link href="/admin" className="flex items-center gap-3 w-full">
                <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/img_0174.png"
                    alt="NestAI Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-primary tracking-tight">
                  NestAI
                </span>
              </Link>
            </div>

            <div
              className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="space-y-6">
                {menuData.map((section) => (
                  <div key={section.id}>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <NavItem
                          key={item.id}
                          item={item}
                          parentId={section.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <NavItem
                  item={{
                    id: 'settings',
                    label: 'Cài đặt',
                    href: '/admin/settings',
                    icon: Settings,
                  }}
                />
                <NavItem
                  item={{
                    id: 'help',
                    label: 'Trợ giúp',
                    href: '/admin/help',
                    icon: HelpCircle,
                  }}
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile overlay backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[65]"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <nav
      className={`
        fixed inset-y-0 left-0 z-[60] bg-white dark:bg-gray-950
        border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
        ${menuState === 'hidden' ? 'w-0 border-r-0' : getSidebarWidth()}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: menuState === 'hidden' ? 'hidden' : 'visible',
      }}
    >
      {menuState !== 'hidden' && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 px-3 flex items-center border-b border-gray-200 dark:border-gray-800">
            {showText ? (
              <Link href="/admin" className="flex items-center gap-3 w-full">
                <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/img_0174.png"
                    alt="NestAI Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-primary tracking-tight transition-opacity duration-200">
                  NestAI
                </span>
              </Link>
            ) : (
              <div className="flex justify-center w-full">
                <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Image
                    src="/img_0174.png"
                    alt="NestAI Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="space-y-6">
              {menuData.map((section) => (
                <div key={section.id}>
                  {showText && (
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 transition-opacity duration-200">
                      {section.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        parentId={section.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="space-y-1">
              <NavItem
                item={{
                  id: 'settings',
                  label: 'Cài đặt',
                  href: '/admin/settings',
                  icon: Settings,
                }}
              />
              <NavItem
                item={{
                  id: 'help',
                  label: 'Trợ giúp',
                  href: '/admin/help',
                  icon: HelpCircle,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Tag, BarChart3,
  LogOut, ChevronLeft, Gem, X, Layers
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/content', label: 'محتوى الموقع', icon: Layers },
  { href: '/admin/coupons', label: 'كوبونات الخصم', icon: Tag },
  { href: '/admin/analytics', label: 'الإحصائيات', icon: BarChart3 },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onLogout?: () => void;
  adminName?: string;
}

export default function AdminSidebar({
  collapsed = false,
  onToggle,
  onClose,
  onLogout,
  adminName = 'Admin',
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/admin';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo + close (mobile) */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center flex-shrink-0">
            <Gem size={16} className="text-[#1a1a2e]" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-none">LUXE</p>
              <p className="text-gray-400 text-xs">Admin</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggle && (
            <button
              onClick={onToggle}
              className="hidden lg:flex p-1 rounded text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded text-gray-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#C9A84C] text-[#1a1a2e]'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-gray-700">
        {!collapsed && (
          <div className="px-3 py-2 text-sm text-gray-400 mb-1">
            <p className="text-white font-medium truncate">{adminName}</p>
            <p className="text-xs">مدير النظام</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? 'تسجيل الخروج' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && 'تسجيل الخروج'}
        </button>
      </div>
    </aside>
  );
}

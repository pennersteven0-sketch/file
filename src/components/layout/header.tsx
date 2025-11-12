'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSidebar } from '@/hooks/use-sidebar';
import { DesktopSidebar } from './desktop-sidebar';
import { Logo } from './logo';
import { notifications } from '@/lib/data';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/jobs')) return 'Job Details';
  if (pathname.startsWith('/quotes')) return 'Quotes';
  if (pathname.startsWith('/calendar')) return 'Calendar';
  if (pathname.startsWith('/team')) return 'Team';
  if (pathname.startsWith('/notifications')) return 'Notifications';
  return 'ConexPro';
};

export function Header() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b px-6">
              <Logo />
            </div>
            <div className="flex-1 overflow-auto">
              <DesktopSidebar isMobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{getPageTitle(pathname)}</h1>
      </div>

      <Button asChild size="icon" variant="ghost" className="relative">
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-xs">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Link>
      </Button>
    </header>
  );
}

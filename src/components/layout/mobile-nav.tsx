'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Users, Bell, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifications } from '@/lib/data';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/quotes', label: 'Quotes', icon: ClipboardList },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/notifications', label: 'Alerts', icon: Bell },
];

export function MobileNav() {
  const pathname = usePathname();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
      <div className="grid h-16 grid-cols-5 items-center justify-items-center">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary',
                isActive && 'text-primary',
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6" />
                {item.href === '/notifications' && unreadCount > 0 && (
                   <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { useSidebar } from '@/hooks/use-sidebar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/quotes', label: 'Quotes', icon: ClipboardList },
  { href: '/team', label: 'Team', icon: Users },
  { href: '/notifications', label: 'Notifications', icon: Bell },
];

export function DesktopSidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { setOpen } = useSidebar();

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => isMobile && setOpen(false)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-muted text-primary',
        )}
      >
        <item.icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <div
      className={cn(
        'hidden border-r bg-muted/40 md:block',
        isMobile && 'block border-r-0',
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        {!isMobile && (
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
        )}
        <div className="flex-1">
          <nav
            className={cn(
              'grid items-start px-2 text-sm font-medium lg:px-4',
              isMobile && 'pt-4',
            )}
          >
            {navItems.map(item => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

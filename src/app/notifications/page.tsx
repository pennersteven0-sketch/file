import Link from 'next/link';
import { notifications } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const sortedNotifications = [...notifications].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Recent updates and alerts.</p>
      </div>
      
      {sortedNotifications.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {sortedNotifications.map(notification => (
                <li
                  key={notification.id}
                  className={cn(
                    'p-4 flex items-start gap-4 transition-colors hover:bg-muted/50',
                    !notification.read && 'bg-primary/5'
                  )}
                >
                  <div className={cn('mt-1 h-2 w-2 rounded-full', !notification.read ? 'bg-accent' : 'bg-muted-foreground/50')} />
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">{notification.date.toLocaleString()}</p>
                  </div>
                  {notification.jobId && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/jobs/${notification.jobId}`}>View Job</Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Notifications</h3>
            <p className="text-muted-foreground">You're all caught up!</p>
        </Card>
      )}
    </div>
  );
}

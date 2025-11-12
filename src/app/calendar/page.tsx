'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { jobs } from '@/lib/data';
import { isSameDay, format } from 'date-fns';
import { MapPin, ArrowRight } from 'lucide-react';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const jobsByDate = useMemo(() => {
    const groups: { [key: string]: typeof jobs } = {};
    jobs.forEach(job => {
      const jobDate = format(job.date, 'yyyy-MM-dd');
      if (!groups[jobDate]) {
        groups[jobDate] = [];
      }
      groups[jobDate].push(job);
    });
    return groups;
  }, []);

  const selectedJobs = useMemo(() => {
    if (!date) return [];
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    return jobsByDate[selectedDateStr] || [];
  }, [date, jobsByDate]);
  
  const DayContent = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = jobsByDate[dateStr]?.length;
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <span>{format(day, 'd')}</span>
        {count && count > 0 && (
          <span className="absolute bottom-0 right-0.5 text-[10px] h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground">
            {count}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Calendar</h1>
        <p className="text-muted-foreground">View and manage your job schedule.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              components={{
                  DayContent: ({ date }) => DayContent(date),
              }}
              modifiers={{
                hasJobs: Object.keys(jobsByDate).map(dateStr => new Date(dateStr + 'T00:00:00'))
              }}
              modifiersStyles={{
                hasJobs: { fontWeight: 'bold' }
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Jobs for {date ? format(date, 'MMMM d, yyyy') : '...'}
          </h2>
          {selectedJobs.length > 0 ? (
            <div className="space-y-4">
              {selectedJobs.map(job => (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <Badge variant={job.status === 'Completed' ? 'secondary' : 'default'} className={job.status === 'In Progress' ? 'bg-accent text-accent-foreground' : ''}>
                      {job.status}
                    </Badge>
                    <Link href={`/jobs/${job.id}`} className="flex items-center text-sm text-primary hover:underline">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground pt-4">No jobs scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
}

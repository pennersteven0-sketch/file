'use client';

import { useState, useMemo, useContext } from 'react';
import Link from 'next/link';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppContext } from '@/components/app-provider';
import { format } from 'date-fns';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Job } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { jobs } = useContext(AppContext);

  const jobsByDate = useMemo(() => {
    const groups: { [key: string]: Job[] } = {};
    jobs.forEach(job => {
      const jobDates = Array.isArray(job.dates) ? job.dates.map(d => (d instanceof Timestamp ? d.toDate() : d)) : [];
      jobDates.forEach(jobDate => {
        const dateStr = format(jobDate, 'yyyy-MM-dd');
        if (!groups[dateStr]) {
          groups[dateStr] = [];
        }
        groups[dateStr].push(job);
      });
    });
    return groups;
  }, [jobs]);

  const selectedJobs = useMemo(() => {
    if (!date) return [];
    const selectedDateStr = format(date, 'yyyy-MM-dd');
    return jobsByDate[selectedDateStr] || [];
  }, [date, jobsByDate]);

  const DayContent = ({ date }: { date: Date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = jobsByDate[dateStr]?.length;
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <span>{format(date, 'd')}</span>
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
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full"
              components={{
                DayContent: ({ date }) => DayContent({ date }),
              }}
              modifiers={{
                hasJobs: Object.keys(jobsByDate).map(dateStr => new Date(dateStr + 'T00:00:00')),
              }}
              modifiersStyles={{
                hasJobs: { fontWeight: 'bold' },
              }}
            />
          </CardContent>
        </Card>
        <div className="space-y-4 md:col-span-1">
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

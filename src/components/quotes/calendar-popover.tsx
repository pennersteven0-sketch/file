'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { jobs } from '@/lib/data';
import { cn } from '@/lib/utils';

export function CalendarPopover({ date, onDateChange }: { date: Date, onDateChange: (date: Date) => void }) {
  const [isOpen, setOpen] = useState(false);

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

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If the same date is clicked again, deselect it by setting a "neutral" date like the original.
      // Here we just re-set it, but a better implementation might be to nullify it or reset.
      // For this implementation, we will allow re-setting to the same date or a new date.
      if (date && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
        // This part is tricky without more context on what "deselect" should do.
        // For now, we'll just allow changing to another date, or re-selecting the same one.
        // Let's assume clicking the same date again is a no-op for selection logic, but we still close.
      } else {
        onDateChange(selectedDate);
      }
      setOpen(false);
    }
  };

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
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
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
      </PopoverContent>
    </Popover>
  );
}

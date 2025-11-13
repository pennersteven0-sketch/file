'use client';

import { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AppContext } from '@/components/app-provider';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { Timestamp } from 'firebase/firestore';

export function CalendarPopover({ dates, onDatesChange }: { dates: Date[], onDatesChange: (dates: Date[]) => void }) {
  const [isOpen, setOpen] = useState(false);
  const { jobs } = useContext(AppContext);

  const jobsByDate = useMemo(() => {
    const groups: { [key: string]: typeof jobs } = {};
    jobs.forEach(job => {
      const jobDates = Array.isArray(job.dates) ? job.dates.map(d => (d instanceof Timestamp ? d.toDate() : d)) : [];
      jobDates.forEach(date => {
        const jobDate = format(date, 'yyyy-MM-dd');
        if (!groups[jobDate]) {
          groups[jobDate] = [];
        }
        groups[jobDate].push(job);
      });
    });
    return groups;
  }, [jobs]);

  const handleSelect = (selectedDates: Date[] | undefined) => {
    if (selectedDates) {
      onDatesChange(selectedDates);
    } else {
      onDatesChange([]);
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

  const getButtonText = () => {
    if (dates.length === 0) return "Pick dates";
    if (dates.length === 1) return format(dates[0], 'PPP');
    return `${dates.length} dates selected`;
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !dates || dates.length === 0 && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="multiple"
          min={0}
          selected={dates}
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

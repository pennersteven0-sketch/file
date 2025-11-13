'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import type { Job, JobStatus } from '@/lib/types';
import { cn } from "@/lib/utils";

const statusOptions: JobStatus[] = ['Scheduled', 'In Progress', 'On Hold', 'Completed', 'Completed and Paid'];

export function JobStatusBadge({ job, onStatusChange }: { job: Job, onStatusChange: (status: JobStatus) => void }) {
  const status = job.status;

  const variant: { [key in JobStatus]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    'Scheduled': 'default',
    'In Progress': 'default',
    'Completed': 'secondary',
    'On Hold': 'outline',
    'Completed and Paid': 'secondary',
  };

  const bgClass: { [key in JobStatus]?: string } = {
    'In Progress': 'bg-accent text-accent-foreground',
    'Completed and Paid': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant={variant[status]} className={cn('cursor-pointer', bgClass[status])}>{status}</Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {statusOptions.map(option => (
          <DropdownMenuItem key={option} onClick={() => onStatusChange(option)} disabled={status === option}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

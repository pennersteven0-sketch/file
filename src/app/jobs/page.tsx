'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AppContext } from '@/components/app-provider';
import type { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';

const JobCard = ({ job }: { job: Job }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-bold tracking-tight">{job.title}</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{job.location}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
            {job.dates.length > 0
              ? job.dates.length === 1 
                ? format(job.dates[0], 'PPP')
                : `${job.dates.length} dates`
              : 'Not scheduled'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>{job.team.length} Team Members</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={job.status === 'Completed' ? 'secondary' : 'default'} className={job.status === 'In Progress' ? 'bg-accent text-accent-foreground' : ''}>
          {job.status}
        </Badge>
      </div>
      <Button asChild variant="outline" size="sm" className="mt-2 w-full">
        <Link href={`/jobs/${job.id}`}>
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardContent>
  </Card>
);

export default function JobsPage() {
  const { jobs } = useContext(AppContext);
  const sortedJobs = [...jobs].sort((a, b) => {
    const aDate = a.dates.length > 0 ? a.dates[0].getTime() : 0;
    const bDate = b.dates.length > 0 ? b.dates[0].getTime() : 0;
    return bDate - aDate;
  });

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Jobs</h1>
        <p className="text-muted-foreground">Browse and manage all scheduled and past jobs.</p>
      </div>
      {sortedJobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No jobs found.</p>
      )}
    </div>
  );
}

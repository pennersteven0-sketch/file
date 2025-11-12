import Link from 'next/link';
import { jobs } from '@/lib/data';
import type { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MapPin, Users } from 'lucide-react';

const isToday = (someDate: Date) => {
  const today = new Date();
  return someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear();
};

const isUpcoming = (someDate: Date) => {
  return someDate.getTime() > new Date().getTime() && !isToday(someDate);
};

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
        <span>{job.date.toLocaleDateString()}</span>
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

export default function DashboardPage() {
  const todayJobs = jobs.filter(job => isToday(new Date(job.date)));
  const upcomingJobs = jobs.filter(job => isUpcoming(new Date(job.date)));

  return (
    <div className="space-y-8 pb-16 md:pb-0">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Today's Jobs</h2>
        {todayJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todayJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No jobs scheduled for today.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Upcoming Jobs</h2>
        {upcomingJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No upcoming jobs.</p>
        )}
      </section>
    </div>
  );
}

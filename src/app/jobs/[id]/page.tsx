import { jobs } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Calendar, Clock, Mail, Phone, CheckCircle, Circle } from 'lucide-react';
import { TaskParser } from '@/components/jobs/task-parser';
import type { Task } from '@/lib/types';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const job = jobs.find(j => j.id === params.id);

  if (!job) {
    notFound();
  }

  const initialTasks: Task[] = job.tasks.length > 0 ? job.tasks : [];

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{job.location}</span>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <strong>Date:</strong>
                <span className="ml-2">{job.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <strong>Status:</strong>
                <Badge variant={job.status === 'Completed' ? 'secondary' : 'default'} className="ml-2">
                  {job.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <TaskParser initialTasks={initialTasks} jobDescription={job.description}/>

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>{job.client.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{job.client.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${job.client.phone}`} className="hover:text-primary">{job.client.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${job.client.email}`} className="hover:text-primary truncate">{job.client.email}</a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.team.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Image
                    src={member.avatarUrl}
                    alt={member.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    data-ai-hint="person face"
                  />
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

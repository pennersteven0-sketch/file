'use client';

import { useContext } from 'react';
import { AppContext } from '@/components/app-provider';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar, Clock, Mail, Phone, Ruler } from 'lucide-react';
import { TaskParser } from '@/components/jobs/task-parser';
import type { Task, Job } from '@/lib/types';
import { format } from 'date-fns';
import { QuoteForm } from '@/components/quotes/quote-form';

const DetailRow = ({ icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => {
    const Icon = icon;
    return (
        <div className="flex items-start">
            <Icon className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
            <strong className="w-24">{label}:</strong>
            <div className="ml-2 flex flex-col">{children}</div>
        </div>
    );
};

export default function JobDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { jobs, updateJob } = useContext(AppContext);
  const job = jobs.find(j => j.id === id);

  if (!job) {
    notFound();
  }

  const handleQuoteUpdate = (updatedQuoteDetails: Job['quoteDetails']) => {
    if (updatedQuoteDetails) {
        const updatedJob: Job = {
            ...job,
            quoteDetails: updatedQuoteDetails,
            title: updatedQuoteDetails.formData?.jobDetails || job.title,
        };
        updateJob(updatedJob);
    }
  }

  const initialTasks: Task[] = job.tasks.length > 0 ? job.tasks : [];
  const { quoteDetails } = job;
  const formData = quoteDetails?.formData;

  const totalSlabs = formData?.slabs?.length || 0;
  const totalFootings = formData?.footings?.length || 0;
  const totalRoundPiers = formData?.roundPierHoles?.reduce((acc, p) => acc + (p.count || 0), 0) || 0;
  const totalSquarePiers = formData?.squarePierHoles?.reduce((acc, p) => acc + (p.count || 0), 0) || 0;


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
                <DetailRow icon={Calendar} label="Dates">
                    {job.dates.length > 0 ? (
                        job.dates.map((date, index) => (
                        <span key={index}>{format(date, 'PPP')}</span>
                        ))
                    ) : (
                        <span>Not scheduled</span>
                    )}
                </DetailRow>

                <DetailRow icon={Clock} label="Status">
                    <Badge variant={job.status === 'Completed' ? 'secondary' : 'default'} className="ml-2">
                        {job.status}
                    </Badge>
                </DetailRow>
                
                {formData && (
                    <>
                         {totalSlabs > 0 && (
                            <DetailRow icon={Ruler} label="Slabs">
                                {formData.slabs?.map((slab, i) => (
                                    <span key={`slab-${i}`}>{slab.length}ft x {slab.width}ft @ {slab.thickness}in thick, {slab.rebarSpacing}in rebar spacing</span>
                                ))}
                            </DetailRow>
                         )}
                         {totalFootings > 0 && (
                            <DetailRow icon={Ruler} label="Footings">
                                {formData.footings?.map((footing, i) => (
                                    <span key={`footing-${i}`}>{footing.length}ft x {footing.width}in x {footing.depth}in, {footing.rebarRows} rebar rows</span>
                                ))}
                            </DetailRow>
                         )}
                         {totalRoundPiers > 0 && (
                            <DetailRow icon={Ruler} label="Round Piers">
                                {formData.roundPierHoles?.map((pier, i) => (
                                    <span key={`rpier-${i}`}>{pier.count} holes @ {pier.diameter}in diameter, {pier.depth}in deep</span>
                                ))}
                            </DetailRow>
                         )}
                         {totalSquarePiers > 0 && (
                             <DetailRow icon={Ruler} label="Square Piers">
                                {formData.squarePierHoles?.map((pier, i) => (
                                    <span key={`spier-${i}`}>{pier.count} holes @ {pier.length}in x {pier.width}in, {pier.depth}in deep</span>
                                ))}
                            </DetailRow>
                         )}
                    </>
                )}
            </CardContent>
          </Card>
          
          <TaskParser initialTasks={initialTasks} jobDescription={job.description}/>

          {job.quoteDetails && (
            <Card>
                <CardHeader>
                    <CardTitle>Quote Details</CardTitle>
                    <CardDescription>
                        Original quote {job.quoteDetails.quoteNumber} information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <QuoteForm quote={job.quoteDetails} onQuoteUpdate={handleQuoteUpdate} />
                </CardContent>
            </Card>
          )}

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

          {job.team.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}

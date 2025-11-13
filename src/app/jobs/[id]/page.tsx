'use client';

import { useContext, useState } from 'react';
import { AppContext } from '@/components/app-provider';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { User, MapPin, Calendar, Clock, Mail, Phone, Ruler, PlusCircle, Edit, Trash2, Users } from 'lucide-react';
import { TaskParser } from '@/components/jobs/task-parser';
import type { Task, Job, JobStatus, TeamMember } from '@/lib/types';
import { format } from 'date-fns';
import { QuoteForm } from '@/components/quotes/quote-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CalendarPopover } from '@/components/quotes/calendar-popover';
import { JobStatusBadge } from '@/components/jobs/job-status-badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {Timestamp} from 'firebase/firestore';


const DetailRow = ({ icon, label, children }: { icon: React.ElementType, label: string, children: React.ReactNode }) => {
    const Icon = icon;
    return (
        <div className="flex items-start text-sm">
            <Icon className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
            <strong className="w-24 flex-shrink-0">{label}:</strong>
            <div className="ml-2 flex flex-col gap-1">{children}</div>
        </div>
    );
};

export default function JobDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { jobs, updateJob, teamMembers } = useContext(AppContext);
  const job = jobs.find(j => j.id === id);

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState('');
  const [isTeamDialogOpen, setTeamDialogOpen] = useState(false);
  
  if (!job) {
    // Data might be loading, or not found. 
    // You can show a loading indicator or a proper not found page.
    return <div>Loading job details or job not found...</div>;
  }
  
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>(job.team || []);
  
  const handleStartEditingLocation = () => {
    setEditingLocation(job.location);
    setIsEditingLocation(true);
  };
  
  const handleUpdateLocation = () => {
    if (editingLocation.trim() !== job.location) {
        const updatedJob = { ...job, location: editingLocation.trim() };
        updateJob(updatedJob);
    }
    setIsEditingLocation(false);
  };
  
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleUpdateLocation();
    } else if (e.key === 'Escape') {
        setIsEditingLocation(false);
        setEditingLocation(job.location);
    }
  };

  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };


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

  const handleDateChange = (newDates: Date[]) => {
    const updatedJob = { ...job, dates: newDates };
    updateJob(updatedJob);
  };

  const handleStatusChange = (newStatus: JobStatus) => {
    const updatedJob = { ...job, status: newStatus };
    updateJob(updatedJob);
  };

  const handleTeamSelectionChange = (member: TeamMember) => {
    setSelectedTeamMembers(prev => 
      prev.some(m => m.id === member.id)
        ? prev.filter(m => m.id !== member.id)
        : [...prev, member]
    );
  };

  const handleSaveTeam = () => {
    const updatedJob = { ...job, team: selectedTeamMembers };
    updateJob(updatedJob);
    setTeamDialogOpen(false);
  };
  
  const handleRemoveTeamMember = (memberId: string) => {
    const updatedTeam = job.team.filter(m => m.id !== memberId);
    const updatedJob = { ...job, team: updatedTeam };
    updateJob(updatedJob);
  };


  const initialTasks: Task[] = job.tasks.length > 0 ? job.tasks : [];
  const { quoteDetails } = job;
  const formData = quoteDetails?.formData;

  const totalSlabs = formData?.slabs?.length || 0;
  const totalFootings = formData?.footings?.length || 0;
  const totalRoundPiers = formData?.roundPierHoles?.reduce((acc, p) => acc + (p.count || 0), 0) || 0;
  const totalSquarePiers = formData?.squarePierHoles?.reduce((acc, p) => acc + (p.count || 0), 0) || 0;

  const jobDates = Array.isArray(job.dates) ? job.dates.map(d => (d instanceof Timestamp ? d.toDate() : d)) : [];


  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
        <p className="text-lg text-muted-foreground">{job.client.name}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <DetailRow icon={Calendar} label="Dates">
                    <CalendarPopover 
                        dates={jobDates}
                        onDatesChange={handleDateChange}
                    />
                </DetailRow>

                <DetailRow icon={MapPin} label="Location">
                   {isEditingLocation ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editingLocation}
                                onChange={(e) => setEditingLocation(e.target.value)}
                                onBlur={handleUpdateLocation}
                                onKeyDown={handleLocationKeyDown}
                                className="h-8"
                                autoFocus
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group">
                            {job.location ? (
                                <>
                                    {isUrl(job.location) ? (
                                        <a href={job.location} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                                            {job.location}
                                        </a>
                                    ) : (
                                        <span>{job.location}</span>
                                    )}
                                    <Button variant="ghost" size="icon" onClick={handleStartEditingLocation} className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outline" size="sm" onClick={handleStartEditingLocation}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Address or Link
                                </Button>
                            )}
                        </div>
                    )}
                </DetailRow>

                <DetailRow icon={Clock} label="Status">
                    <JobStatusBadge job={job} onStatusChange={handleStatusChange} />
                </DetailRow>

                <Separator className="my-2" />
                
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
          
          <TaskParser initialTasks={initialTasks} />

          {job.quoteDetails && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="quote-details">
                <Card>
                  <AccordionTrigger className="w-full p-6 text-left">
                      <div>
                        <CardTitle>Quote Details</CardTitle>
                        <CardDescription>
                            Original quote {job.quoteDetails.quoteNumber} information.
                        </CardDescription>
                      </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent>
                      <QuoteForm quote={job.quoteDetails} onQuoteUpdate={handleQuoteUpdate} />
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>
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
                <a href={`mailto:${job.client.email}`} className="hover-text-primary truncate">{job.client.email}</a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.team.length > 0 ? (
                job.team.map(member => (
                  <div key={member.id} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{member.name}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveTeamMember(member.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No team members assigned.</p>
              )}
            </CardContent>
            <CardFooter>
              <Dialog open={isTeamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" onClick={() => setSelectedTeamMembers(job.team)}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Team Members</DialogTitle>
                    <DialogDescription>Select the team members to assign to this job.</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-64">
                    <div className="space-y-4 p-4">
                    {teamMembers.map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Checkbox 
                          id={`member-${member.id}`}
                          checked={selectedTeamMembers.some(m => m.id === member.id)}
                          onCheckedChange={() => handleTeamSelectionChange(member)}
                        />
                        <label htmlFor={`member-${member.id}`} className="flex items-center gap-3 cursor-pointer">
                            <User className="h-8 w-8 text-muted-foreground" />
                            <span className="font-medium">{member.name}</span>
                        </label>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveTeam}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import { AppContext } from '@/components/app-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit, Trash2, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TeamMemberForm } from '@/components/team/team-member-form';
import type { TeamMember } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function TeamPage() {
  const { teamMembers, deleteTeamMember } = useContext(AppContext);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleNewMember = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setDialogOpen(true);
  };

  const handleFormFinished = () => {
    setDialogOpen(false);
    setEditingMember(null);
  };
  
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground">Directory of all team members.</p>
        </div>
        <Button onClick={handleNewMember}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Member
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map(member => (
          <Card key={member.id} className="relative group">
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={80}
                height={80}
                className="rounded-full mb-4"
                data-ai-hint="person face"
              />
              <p className="font-semibold text-lg">{member.name}</p>
              {member.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${member.phone}`} className="hover:text-primary">{member.phone}</a>
                </div>
              )}
            </CardContent>
            <div className="absolute top-2 right-2">
                 <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                             <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {member.name} from your team.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => deleteTeamMember(member.id)}
                        >
                            Delete
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                 </AlertDialog>
            </div>
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
             <DialogDescription>
              {editingMember ? `Update the details for ${editingMember.name}.` : 'Fill in the details to add a new person to your team.'}
            </DialogDescription>
          </DialogHeader>
          <TeamMemberForm member={editingMember} onFinished={handleFormFinished} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useContext, useEffect } from 'react';
import { AppContext } from '../app-provider';
import { TeamMember, TeamMemberRole } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const teamMemberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  role: z.enum(['Foreman', 'Laborer', 'Finisher', 'Driver']),
  avatarUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  member?: TeamMember | null;
  onFinished?: () => void;
}

const roles: TeamMemberRole[] = ['Foreman', 'Finisher', 'Laborer', 'Driver'];

export function TeamMemberForm({ member, onFinished }: TeamMemberFormProps) {
  const { toast } = useToast();
  const { addTeamMember, updateTeamMember, teamMembers } = useContext(AppContext);
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
      role: 'Laborer',
      avatarUrl: '',
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        role: member.role,
        avatarUrl: member.avatarUrl,
      });
    } else {
      form.reset({
        name: '',
        role: 'Laborer',
        avatarUrl: '',
      });
    }
  }, [member, form]);

  function onSubmit(data: TeamMemberFormValues) {
    const getRandomAvatar = () => {
        const avatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));
        return avatars[Math.floor(Math.random() * avatars.length)].imageUrl;
    }

    if (member) {
      // Update existing member
      const updatedMemberData: TeamMember = {
        ...member,
        name: data.name,
        role: data.role,
        avatarUrl: data.avatarUrl || member.avatarUrl,
      };
      updateTeamMember(updatedMemberData);
      toast({
        title: 'Member Updated',
        description: `${data.name}'s details have been successfully updated.`,
      });

    } else {
      // Create new member
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: data.name,
        role: data.role,
        avatarUrl: data.avatarUrl || getRandomAvatar(),
      };
      addTeamMember(newMember);
      toast({
        title: 'Member Added',
        description: `${data.name} has been added to the team.`,
      });
    }

    onFinished?.();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">{member ? 'Update Member' : 'Add Member'}</Button>
      </form>
    </Form>
  );
}

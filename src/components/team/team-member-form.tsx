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
import { useToast } from '@/hooks/use-toast';
import { useContext, useEffect } from 'react';
import { AppContext } from '../app-provider';
import { TeamMember } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const teamMemberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  member?: TeamMember | null;
  onFinished?: () => void;
}

export function TeamMemberForm({ member, onFinished }: TeamMemberFormProps) {
  const { toast } = useToast();
  const { addTeamMember, updateTeamMember } = useContext(AppContext);
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [member, form]);

  function onSubmit(data: TeamMemberFormValues) {
    const getRandomAvatar = () => {
        const avatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));
        if (avatars.length === 0) return 'https://picsum.photos/seed/default/100/100';
        return avatars[Math.floor(Math.random() * avatars.length)].imageUrl;
    }

    if (member) {
      // Update existing member
      const updatedMemberData: TeamMember = {
        ...member,
        name: data.name,
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
        avatarUrl: getRandomAvatar(),
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
        <Button type="submit" className="w-full">{member ? 'Update Member' : 'Add Member'}</Button>
      </form>
    </Form>
  );
}

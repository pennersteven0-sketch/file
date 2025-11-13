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
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../app-provider';
import { TeamMember } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from 'next/image';
import { cn } from '@/lib/utils';

const teamMemberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Must be a valid URL.'),
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface TeamMemberFormProps {
  member?: TeamMember | null;
  onFinished?: () => void;
}

export function TeamMemberForm({ member, onFinished }: TeamMemberFormProps) {
  const { toast } = useToast();
  const { addTeamMember, updateTeamMember } = useContext(AppContext);
  const [isAvatarPopoverOpen, setAvatarPopoverOpen] = useState(false);
  
  const getRandomAvatar = () => {
      const avatars = PlaceHolderImages.filter(p => p.id.startsWith('avatar'));
      if (avatars.length === 0) return 'https://picsum.photos/seed/default/100/100';
      return avatars[Math.floor(Math.random() * avatars.length)].imageUrl;
  }

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      avatarUrl: member?.avatarUrl || getRandomAvatar(),
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        phone: member.phone,
        avatarUrl: member.avatarUrl,
      });
    } else {
      form.reset({
        name: '',
        phone: '',
        avatarUrl: getRandomAvatar(),
      });
    }
  }, [member, form]);

  function onSubmit(data: TeamMemberFormValues) {
    if (member) {
      // Update existing member
      const updatedMemberData: TeamMember = {
        ...member,
        name: data.name,
        phone: data.phone || '',
        avatarUrl: data.avatarUrl,
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
        phone: data.phone || '',
        avatarUrl: data.avatarUrl,
      };
      addTeamMember(newMember);
      toast({
        title: 'Member Added',
        description: `${data.name} has been added to the team.`,
      });
    }

    onFinished?.();
  }

  const currentAvatar = form.watch('avatarUrl');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={currentAvatar}
            alt="Current Avatar"
            width={80}
            height={80}
            className="rounded-full"
          />
           <Popover open={isAvatarPopoverOpen} onOpenChange={setAvatarPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" type="button">Change Avatar</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid grid-cols-4 gap-4">
                  {PlaceHolderImages.filter(p => p.id.startsWith('avatar')).map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => {
                        form.setValue('avatarUrl', image.imageUrl);
                        setAvatarPopoverOpen(false);
                      }}
                      className={cn(
                        'rounded-full overflow-hidden border-2 transition-all',
                        currentAvatar === image.imageUrl ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                      )}
                    >
                       <Image
                          src={image.imageUrl}
                          alt={image.description}
                          width={60}
                          height={60}
                          className="aspect-square object-cover"
                        />
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
             <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="555-123-4567" {...field} />
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

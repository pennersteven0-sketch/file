import Image from 'next/image';
import { teamMembers } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TeamPage() {
  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
        <p className="text-muted-foreground">Directory of all team members.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamMembers.map(member => (
          <Card key={member.id} className="text-center">
            <CardContent className="flex flex-col items-center pt-6">
              <Image
                src={member.avatarUrl}
                alt={member.name}
                width={80}
                height={80}
                className="rounded-full mb-4"
                data-ai-hint="person face"
              />
              <p className="font-semibold text-lg">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

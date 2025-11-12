'use client';

import { useState, useTransition, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { getTasksFromDescription, type FormState } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { Task } from '@/lib/types';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Tasks
        </>
      )}
    </Button>
  );
}

export function TaskParser({ initialTasks, jobDescription }: { initialTasks: Task[], jobDescription: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(getTasksFromDescription, initialState);
  
  useEffect(() => {
    if (state.message === 'success' && state.tasks) {
      const newTasks = state.tasks.map((desc, index) => ({
        id: `ai-${Date.now()}-${index}`,
        description: desc,
        completed: false,
      }));
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
    }
  }, [state]);

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const progress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage job tasks and use AI to generate them from the description.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length > 0 && (
          <div className="space-y-2">
             <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <ul className="space-y-3">
              {tasks.map(task => (
                <li
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  )}
                  <span
                    className={
                      task.completed ? 'text-muted-foreground line-through' : ''
                    }
                  >
                    {task.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tasks.length > 0 && <Separator />}

        <form action={formAction} className="space-y-4">
          <Textarea
            name="jobDescription"
            placeholder="Enter job description to generate tasks..."
            defaultValue={jobDescription}
            rows={5}
            className="w-full"
            aria-label="Job Description"
          />
          <SubmitButton />
          {state.message && state.message !== 'success' && (
             <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {state.message}
                    {state.fields?.jobDescription && <p>{state.fields.jobDescription}</p>}
                </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

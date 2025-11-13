'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import type { Task } from '@/lib/types';

export function TaskParser({ initialTasks, jobDescription }: { initialTasks: Task[], jobDescription: string }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
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
        <CardDescription>A list of tasks for this job.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length > 0 ? (
          <div className="space-y-2">
             <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <ul className="space-y-3 pt-4">
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
        ) : (
            <p className="text-sm text-muted-foreground">No tasks have been added for this job yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

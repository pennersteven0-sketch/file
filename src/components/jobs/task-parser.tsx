'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Circle, PlusCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TaskParser({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  
  const toggleTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskDescription.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        description: newTaskDescription.trim(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskDescription('');
    }
  };
  
  const progress = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>A list of tasks for this job.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAddTask} className="flex gap-2">
          <Input 
            placeholder="Add a new task..."
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <Button type="submit" size="icon">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </form>

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
            <p className="text-sm text-muted-foreground pt-4 text-center">No tasks have been added for this job yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

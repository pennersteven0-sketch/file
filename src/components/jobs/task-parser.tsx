'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Circle, PlusCircle, Trash2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TaskParser({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTaskId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTaskId]);

  const toggleTask = (id: string) => {
    if (editingTaskId === id) return;
    setTasks(
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      description: '',
      completed: false,
    };
    setTasks([...tasks, newTask]);
    // Immediately start editing the new task
    setEditingTaskId(newTask.id);
    setEditingText('');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.description);
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const handleUpdateTask = (id: string) => {
    if (editingText.trim() === '') {
      // If a new task is left blank, remove it. Otherwise, keep original text.
      const originalTask = tasks.find(t => t.id === id);
      if (originalTask && originalTask.description === '') {
        handleDeleteTask(id);
      }
    } else {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, description: editingText.trim() } : task
      ));
    }
    handleCancelEditing();
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleUpdateTask(id);
    } else if (e.key === 'Escape') {
      handleCancelEditing();
      // If escaping a new blank task, remove it
      const originalTask = tasks.find(t => t.id === id);
      if(originalTask && originalTask.description === '') {
        handleDeleteTask(id);
      }
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
        {tasks.length > 0 ? (
          <div className="space-y-2">
             <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <ul className="space-y-3 pt-4">
              {tasks.map(task => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 group"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-primary cursor-pointer" onClick={() => toggleTask(task.id)} />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground group-hover:text-primary cursor-pointer" onClick={() => toggleTask(task.id)} />
                  )}

                  {editingTaskId === task.id ? (
                    <Input
                      ref={editInputRef}
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => handleUpdateTask(task.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, task.id)}
                      className="h-8"
                      placeholder="Enter task description..."
                    />
                  ) : (
                    <>
                      <span
                        onClick={() => handleStartEditing(task)}
                        className={cn(
                          'flex-1 cursor-pointer',
                          task.completed ? 'text-muted-foreground line-through' : ''
                        )}
                      >
                        {task.description}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
            <p className="text-sm text-muted-foreground pt-4 text-center">No tasks have been added for this job yet.</p>
        )}
        <div className="pt-4">
            <Button type="button" variant="outline" size="sm" onClick={handleAddTask}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

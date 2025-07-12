// components/dashboard/TodoListWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Settings, Trash2, ListTodo } from 'lucide-react';

// Interfaces and hooks remain the same...
interface Todo { id: number; text: string; completed: boolean; }
interface TodoListWidgetProps { icon?: ReactNode; }

export function TodoListWidget({ icon }: TodoListWidgetProps) {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todo-list-items', []);
  const [deadline, setDeadline] = useLocalStorage<string>('todo-list-deadline', '');
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const [newTodoText, setNewTodoText] = useState('');
  const [tempDeadline, setTempDeadline] = useState(deadline);

  const handleAddTodo = (e: React.FormEvent) => { e.preventDefault(); if (newTodoText.trim() === '') return; setTodos([{ id: Date.now(), text: newTodoText, completed: false }, ...todos]); setNewTodoText(''); };
  const toggleTodo = (id: number) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTodo = (id: number) => setTodos(todos.filter(t => t.id !== id));
  const handleSaveDeadline = () => setDeadline(tempDeadline);

  return (
    <Card className="rounded-xl border-b-4 border-green-400 bg-white shadow-lg transition-transform hover:-translate-y-1">
      <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-green-600">
          {icon}
          <div>
            <h3 className="text-base font-bold tracking-tight">To-Do List</h3>
            {isClient && deadline && <CardDescription className="text-xs -mt-0.5">Deadline: {new Date(deadline).toLocaleDateString()}</CardDescription>}
          </div>
        </div>
        <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-green-600"><Settings className="h-4 w-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Set Deadline</DialogTitle></DialogHeader><div className="grid gap-4 py-4"><Label htmlFor="deadline">Deadline</Label><Input id="deadline" type="date" value={tempDeadline} onChange={(e) => setTempDeadline(e.target.value)} /></div><DialogFooter><DialogClose asChild><Button onClick={handleSaveDeadline}>Save</Button></DialogClose></DialogFooter></DialogContent></Dialog>
      </CardHeader>
      <CardContent className="p-3 pt-0 flex-grow flex flex-col">
        <form onSubmit={handleAddTodo} className="flex items-center gap-2 mb-2">
          <Input placeholder="Add a new task..." value={newTodoText} onChange={(e) => setNewTodoText(e.target.value)} className="h-8 text-sm focus:ring-green-400"/>
          <Button type="submit" size="sm" className="h-8 bg-green-500 hover:bg-green-600">Add</Button>
        </form>
        <div className="flex-grow space-y-0">
          {isClient && todos.length > 0 ? (
            todos.slice(0, 4).map(todo => (
              <div key={todo.id} className="flex items-center gap-3 py-1.5 group rounded-md hover:bg-green-50">
                <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} className="border-gray-400 data-[state=checked]:bg-green-500"/>
                <label htmlFor={`todo-${todo.id}`} className={`text-sm flex-grow cursor-pointer ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{todo.text}</label>
                {/* 
                  CHANGE: The bin is now visible by default on mobile (small screens).
                  On medium screens and up (`md:`), it becomes invisible and only appears on hover.
                */}
                <Button variant="ghost" size="icon" className="h-6 w-6 md:opacity-0 group-hover:opacity-100" onClick={() => deleteTodo(todo.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-600" />
                </Button>
              </div>
            ))
          ) : (<div className="text-center py-10 text-gray-400 flex flex-col items-center justify-center h-full"><ListTodo className="h-8 w-8 mb-2" /><p className="text-sm font-medium">All tasks done!</p></div>)}
        </div>
        {isClient && todos.length > 4 && (<div className="text-center text-xs text-green-600 font-semibold pt-1 mt-auto">+ {todos.length - 4} more</div>)}
      </CardContent>
    </Card>
  );
}
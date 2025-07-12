// components/dashboard/TodoListWidget.tsx
"use client";
import { useState, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Settings, Trash2, ListTodo } from 'lucide-react';

// Le "modèle" pour un seul item de notre liste
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListWidgetProps {
  icon?: ReactNode;
}

export function TodoListWidget({ icon }: TodoListWidgetProps) {
  // Stockage de la liste et de l'échéance dans le localStorage
  const [todos, setTodos] = useLocalStorage<Todo[]>('todo-list-items', []);
  const [deadline, setDeadline] = useLocalStorage<string>('todo-list-deadline', '');

  // États temporaires pour les inputs
  const [newTodoText, setNewTodoText] = useState('');
  const [tempDeadline, setTempDeadline] = useState(deadline);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() === '') return;
    const newTodo: Todo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
    };
    setTodos([...todos, newTodo]);
    setNewTodoText('');
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleSaveDeadline = () => {
    setDeadline(tempDeadline);
  };
  
  // Compter les tâches restantes
  const remainingTasks = todos.filter(t => !t.completed).length;

return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
                {icon}
                <div>
                    <CardTitle className="text-lg font-semibold text-gray-700">My To-Do List</CardTitle>
                    {deadline && (
                        <CardDescription className="flex items-center gap-1.5 text-xs pt-1">
                            <CalendarIcon className="h-3 w-3" />
                            Deadline: {new Date(deadline).toLocaleDateString('en-US')}
                        </CardDescription>
                    )}
                </div>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Set Global Deadline</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Label htmlFor="deadline">Deadline Date</Label>
                        <Input id="deadline" type="date" value={tempDeadline} onChange={(e) => setTempDeadline(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button onClick={handleSaveDeadline}>Save</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
            <form onSubmit={handleAddTodo} className="flex items-center gap-2">
                <Input 
                    placeholder="Add a new task..." 
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                />
                <Button type="submit">Add</Button>
            </form>
            
            <ScrollArea className="h-60 pr-3">
                {todos.length > 0 ? (
                    <div className="space-y-2">
                        {todos.map(todo => (
                            <div key={todo.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                                <Checkbox 
                                    id={`todo-${todo.id}`}
                                    checked={todo.completed} 
                                    onCheckedChange={() => toggleTodo(todo.id)} 
                                />
                                <label 
                                    htmlFor={`todo-${todo.id}`}
                                    className={`flex-grow text-sm cursor-pointer ${todo.completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                    {todo.text}
                                </label>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTodo(todo.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-sm text-gray-500 py-10 flex flex-col items-center">
                        <ListTodo className="h-8 w-8 text-gray-400 mb-2"/>
                        <p className="font-medium">No tasks at the moment.</p>
                        <p className="text-xs">Start by adding one!</p>
                    </div>
                )}
            </ScrollArea>
            <div className="text-center text-xs text-muted-foreground pt-2 border-t">
                {remainingTasks > 1 ? `${remainingTasks} tasks remaining` : remainingTasks === 1 ? '1 task remaining' : 'All tasks completed!'}
            </div>
        </CardContent>
    </Card>
);
}
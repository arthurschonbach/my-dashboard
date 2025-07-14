// components/dashboard/TodoListWidget.tsx
"use client";
import { useState, useEffect, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Settings, Trash2, PartyPopper } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}
interface TodoListWidgetProps {
  icon?: ReactNode;
}

export function TodoListWidget({ icon }: TodoListWidgetProps) {
  const [todos, setTodos] = useLocalStorage<Todo[]>("todo-list-items", []);
  const [deadline, setDeadline] = useLocalStorage<string>(
    "todo-list-deadline",
    ""
  );
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [newTodoText, setNewTodoText] = useState("");
  const [tempDeadline, setTempDeadline] = useState(deadline);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim() === "") return;
    setTodos([
      { id: Date.now(), text: newTodoText, completed: false },
      ...todos,
    ]);
    setNewTodoText("");
  };
  const toggleTodo = (id: number) =>
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  const deleteTodo = (id: number) => setTodos(todos.filter((t) => t.id !== id));
  const handleSaveDeadline = () => setDeadline(tempDeadline);

  const completedTasks = isClient ? todos.filter((t) => t.completed).length : 0;
  const totalTasks = isClient ? todos.length : 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card className="rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <CardHeader className="p-4 flex flex-row items-start justify-between border-b">
        <div className="flex items-center gap-2.5 text-slate-800">
          {icon}
          <div>
            <h3 className="text-base font-semibold tracking-tight">
              To-Do List
            </h3>
            {isClient && deadline && (
              <CardDescription className="text-xs text-green-600 font-semibold">
                Deadline: {new Date(deadline).toLocaleDateString()}
              </CardDescription>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl bg-slate-50">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-slate-800">
                To-Do Settings
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="deadline" className="text-slate-700">
                Task Deadline
              </Label>
              <Input
                id="deadline"
                type="date"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                className="rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={handleSaveDeadline}
                  className="rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Save Changes
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-3 pt-2 flex-grow flex flex-col">
        <form onSubmit={handleAddTodo} className="flex items-center gap-2 mb-3">
          <Input
            placeholder="Add a new task..."
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            className="h-9 text-sm rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500"
          />
          <Button
            type="submit"
            size="sm"
            className="h-9 rounded-md bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Add
          </Button>
        </form>
        {isClient && todos.length > 0 && (
          <div className="px-1 mb-2">
            <Progress.Root
              value={progress}
              className="w-full h-2 rounded-full bg-slate-200 overflow-hidden"
            >
              <Progress.Indicator
                className="h-full bg-green-500 transition-transform duration-500"
                style={{ transform: `translateX(-${100 - progress}%)` }}
              />
            </Progress.Root>
            <p className="text-xs text-right text-slate-500 mt-1">
              {completedTasks} / {totalTasks} completed
            </p>
          </div>
        )}
        <div className="flex-grow space-y-1 max-h-[10rem] overflow-y-auto pr-1">
          {isClient && todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-1.5 group rounded-lg hover:bg-slate-50"
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="border-slate-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`text-sm flex-grow cursor-pointer ${
                    todo.completed
                      ? "line-through text-slate-400"
                      : "text-slate-800 font-medium"
                  }`}
                >
                  {todo.text}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 flex flex-col items-center justify-center h-full">
              <PartyPopper className="h-12 w-12 mb-3 text-green-400" />
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-sm">Enjoy your break.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

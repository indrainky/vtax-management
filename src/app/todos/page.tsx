"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    task: "",
    due_date: "",
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      toast.error("Gagal memuat todo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        task: formData.task,
        due_date: formData.due_date || null,
      };

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to create");
      toast.success("Todo berhasil ditambahkan");
      setOpen(false);
      setFormData({ task: "", due_date: "" });
      fetchTodos();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !todo.is_completed }),
      });
      if (!response.ok) throw new Error("Failed to update");
      fetchTodos();
    } catch (error) {
      toast.error("Gagal memperbarui todo");
    }
  };

  const handleDelete = async () => {
    if (!selectedTodo) return;
    try {
      const response = await fetch(`/api/todos/${selectedTodo.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Todo berhasil dihapus");
      setDeleteOpen(false);
      setSelectedTodo(null);
      fetchTodos();
    } catch (error) {
      toast.error("Gagal menghapus todo");
    }
  };

  const activeTodos = todos.filter((t) => !t.is_completed);
  const completedTodos = todos.filter((t) => t.is_completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todo List</h1>
          <p className="text-muted-foreground">
            Kelola daftar tugas harian
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Todo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Todo</DialogTitle>
              <DialogDescription>
                Tambahkan tugas baru ke daftar
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="task">Tugas *</Label>
                  <Input
                    id="task"
                    value={formData.task}
                    onChange={(e) =>
                      setFormData({ ...formData, task: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit">Tambah</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>Memuat...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aktif ({activeTodos.length})</CardTitle>
              <CardDescription>Tugas yang belum selesai</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeTodos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada tugas aktif
                </p>
              ) : (
                activeTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{todo.task}</p>
                      {todo.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Jatuh tempo: {new Date(todo.due_date).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTodo(todo);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selesai ({completedTodos.length})</CardTitle>
              <CardDescription>Tugas yang sudah selesai</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {completedTodos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada tugas selesai
                </p>
              ) : (
                completedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 rounded-lg border opacity-60"
                  >
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() => handleToggleComplete(todo)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-through">{todo.task}</p>
                      {todo.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Jatuh tempo: {new Date(todo.due_date).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedTodo(todo);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Todo?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus todo ini? Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


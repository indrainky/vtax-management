"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Package, Users, FileText, CheckSquare, StickyNote, Plus, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { statusColors } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";

// Color palette for charts
const chartColors = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
  "#6366f1", // indigo-500
];

const statusColorMap: Record<string, string> = {
  Draft: "#6b7280", // gray-500
  Review: "#eab308", // yellow-500
  ACC: "#22c55e", // green-500
  Pencairan: "#3b82f6", // blue-500
  "Bukti Potongan Pajak": "#a855f7", // purple-500
};

interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
  due_date: string | null;
  created_at: string;
}

interface Note {
  id: number;
  title: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpiringContract {
  id: number;
  client_id: number;
  contract_year: number;
  status: "Draft" | "Review" | "ACC" | "Pencairan" | "Bukti Potongan Pajak";
  contract_value: number | null;
  notes: string | null;
  start_date: string | null;
  end_date: string;
  updated_at: string;
  days_until_expiration: number;
  clients: { name: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    products: 0,
    clients: 0,
    contracts: 0,
    todos: 0,
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [expiringContracts, setExpiringContracts] = useState<ExpiringContract[]>([]);
  const [analytics, setAnalytics] = useState<{
    contractStatus: { status: string; count: number }[];
    contractsByYear: { year: number; count: number; totalValue: number }[];
    clientsByRegency: { regency: string; count: number }[];
    topProducts: { id: number; name: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Todo form
  const [todoTask, setTodoTask] = useState("");
  const [todoDueDate, setTodoDueDate] = useState("");
  
  // Note form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, todosRes, notesRes, expiringRes, analyticsRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/todos"),
        fetch("/api/notes"),
        fetch("/api/contracts/expiring"),
        fetch("/api/dashboard/analytics"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (todosRes.ok) {
        const todosData = await todosRes.json();
        setTodos(todosData.filter((t: Todo) => !t.is_completed).slice(0, 5));
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.slice(0, 5));
      }

      if (expiringRes.ok) {
        const expiringData = await expiringRes.json();
        setExpiringContracts(expiringData.slice(0, 5));
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      toast.error("Gagal memuat data dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTask.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: todoTask.trim(),
          due_date: todoDueDate || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create");
      toast.success("Todo berhasil ditambahkan");
      setTodoTask("");
      setTodoDueDate("");
      fetchDashboardData();
    } catch (error) {
      toast.error("Gagal menambahkan todo");
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: !todo.is_completed }),
      });

      if (!response.ok) throw new Error("Failed to update");
      fetchDashboardData();
    } catch (error) {
      toast.error("Gagal memperbarui todo");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noteTitle.trim() || null,
          content: noteContent.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to create");
      toast.success("Catatan berhasil ditambahkan");
      setNoteTitle("");
      setNoteContent("");
      fetchDashboardData();
    } catch (error) {
      toast.error("Gagal menambahkan catatan");
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Catatan berhasil dihapus");
      fetchDashboardData();
    } catch (error) {
      toast.error("Gagal menghapus catatan");
    }
  };

  const statsData = [
    {
      title: "Total Produk",
      value: stats.products,
      icon: Package,
      description: "Produk aplikasi terdaftar",
      gradient: "from-blue-500 to-cyan-500",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Klien",
      value: stats.clients,
      icon: Users,
      description: "Klien aktif",
      gradient: "from-green-500 to-emerald-500",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Kontrak",
      value: stats.contracts,
      icon: FileText,
      description: "Kontrak tahunan",
      gradient: "from-purple-500 to-pink-500",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Todo Aktif",
      value: stats.todos,
      icon: CheckSquare,
      description: "Tugas yang belum selesai",
      gradient: "from-orange-500 to-amber-500",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di v-tax Management System
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 dark:opacity-20`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} bg-opacity-10 dark:bg-opacity-20`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className={`text-3xl font-bold bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expiring Contracts Alert */}
      {expiringContracts.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-l-4 border-l-red-500">
          <CardHeader className="border-b border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-orange-500">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Kontrak Akan Berakhir</CardTitle>
                  <CardDescription>Kontrak yang akan berakhir dalam 30 hari ke depan</CardDescription>
                </div>
              </div>
              <Link href="/contracts">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-4">
            {expiringContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{contract.clients.name}</p>
                    <Badge
                      className={`${statusColors[contract.status]} hover:opacity-80 text-white text-xs`}
                    >
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Tahun: {contract.contract_year}</span>
                    <span>
                      Berakhir: {new Date(contract.end_date).toLocaleDateString("id-ID")}
                    </span>
                    {contract.contract_value && (
                      <span>{formatCurrency(contract.contract_value)}</span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={contract.days_until_expiration <= 7 ? "destructive" : "secondary"}
                  className="ml-2"
                >
                  {contract.days_until_expiration} hari lagi
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Analytics Charts */}
      {analytics && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contract Status Chart */}
          {analytics.contractStatus.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Distribusi Status Kontrak</CardTitle>
                <CardDescription>Jumlah kontrak berdasarkan status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Jumlah",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={analytics.contractStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.contractStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={statusColorMap[entry.status] || chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Contracts by Year Chart */}
          {analytics.contractsByYear.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Kontrak per Tahun</CardTitle>
                <CardDescription>Jumlah kontrak berdasarkan tahun</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Jumlah",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <BarChart data={analytics.contractsByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count">
                      {analytics.contractsByYear.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Top Products Chart */}
          {analytics.topProducts.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Produk Terlaris</CardTitle>
                <CardDescription>Top 10 produk berdasarkan jumlah klien</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Jumlah Klien",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <BarChart data={analytics.topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count">
                      {analytics.topProducts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Clients by Regency Chart */}
          {analytics.clientsByRegency.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Klien per Kabupaten/Kota</CardTitle>
                <CardDescription>Top 10 kabupaten/kota dengan klien terbanyak</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Jumlah Klien",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                >
                  <BarChart data={analytics.clientsByRegency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="regency" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count">
                      {analytics.clientsByRegency.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Todo List Section */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="border-b border-orange-200/50 dark:border-orange-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                  <CheckSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Todo List</CardTitle>
                  <CardDescription>Tugas yang perlu dikerjakan</CardDescription>
                </div>
              </div>
              <Link href="/todos">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Todo */}
            <form onSubmit={handleAddTodo} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Tambah todo baru..."
                  value={todoTask}
                  onChange={(e) => setTodoTask(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Input
                type="date"
                placeholder="Tanggal jatuh tempo (opsional)"
                value={todoDueDate}
                onChange={(e) => setTodoDueDate(e.target.value)}
                className="text-sm"
              />
            </form>

            {/* Todo List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Memuat...
                </p>
              ) : todos.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Tidak ada todo aktif
                </p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={todo.is_completed}
                      onCheckedChange={() => handleToggleTodo(todo)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{todo.task}</p>
                      {todo.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Jatuh tempo: {new Date(todo.due_date).toLocaleDateString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
          <CardHeader className="border-b border-indigo-200/50 dark:border-indigo-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                  <StickyNote className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Catatan</CardTitle>
                  <CardDescription>Catatan dan memo penting</CardDescription>
                </div>
              </div>
              <Link href="/notes">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Add Note */}
            <form onSubmit={handleAddNote} className="space-y-2">
              <Input
                placeholder="Judul catatan (opsional)"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Textarea
                  placeholder="Tulis catatan..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  className="flex-1 resize-none"
                />
                <Button type="submit" size="icon" className="self-start">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Memuat...
                </p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada catatan
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium mb-1">
                          {note.title || "Tanpa Judul"}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content || "Tidak ada isi"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.updated_at).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

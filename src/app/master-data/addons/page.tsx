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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
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

interface Addon {
  id: number;
  name: string;
  default_price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    default_price: "",
    description: "",
  });

  const fetchAddons = async () => {
    try {
      const response = await fetch("/api/addons");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAddons(data);
    } catch (error) {
      toast.error("Gagal memuat add-ons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        default_price: parseFloat(formData.default_price) || 0,
        description: formData.description || null,
      };

      if (selectedAddon) {
        const response = await fetch(`/api/addons/${selectedAddon.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update");
        toast.success("Add-on berhasil diperbarui");
      } else {
        const response = await fetch("/api/addons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create");
        toast.success("Add-on berhasil ditambahkan");
      }

      setOpen(false);
      resetForm();
      fetchAddons();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleEdit = (addon: Addon) => {
    setSelectedAddon(addon);
    setFormData({
      name: addon.name,
      default_price: addon.default_price.toString(),
      description: addon.description || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAddon) return;
    try {
      const response = await fetch(`/api/addons/${selectedAddon.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Add-on berhasil dihapus");
      setDeleteOpen(false);
      setSelectedAddon(null);
      fetchAddons();
    } catch (error) {
      toast.error("Gagal menghapus add-on");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", default_price: "", description: "" });
    setSelectedAddon(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data - Add-ons</h1>
          <p className="text-muted-foreground">
            Kelola daftar add-ons aplikasi
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Add-on
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedAddon ? "Edit Add-on" : "Tambah Add-on"}
              </DialogTitle>
              <DialogDescription>
                {selectedAddon
                  ? "Ubah informasi add-on"
                  : "Tambahkan add-on baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Add-on</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_price">Harga Default</Label>
                  <Input
                    id="default_price"
                    type="number"
                    step="0.01"
                    value={formData.default_price}
                    onChange={(e) =>
                      setFormData({ ...formData, default_price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Batal
                </Button>
                <Button type="submit">
                  {selectedAddon ? "Perbarui" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Add-on</TableHead>
              <TableHead>Harga Default</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : addons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Belum ada add-on
                </TableCell>
              </TableRow>
            ) : (
              addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium">{addon.name}</TableCell>
                  <TableCell>{formatCurrency(addon.default_price)}</TableCell>
                  <TableCell>{addon.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(addon)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedAddon(addon);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Add-on?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus add-on{" "}
              <strong>{selectedAddon?.name}</strong>? Tindakan ini tidak dapat
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


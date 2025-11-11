"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Plus, Pencil, Trash2, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/pagination-controls";
import { exportToCSV, exportToExcel, formatDateForCSV } from "@/lib/export";
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

interface Client {
  id: number;
  name: string;
  regency: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    regency: "",
    contact_person: "",
    contact_phone: "",
    address: "",
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedClients,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: clients, itemsPerPage: 10 });

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setClients(data);
    } catch (error) {
      toast.error("Gagal memuat klien");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        regency: formData.regency || null,
        contact_person: formData.contact_person || null,
        contact_phone: formData.contact_phone || null,
        address: formData.address || null,
      };

      if (selectedClient) {
        const response = await fetch(`/api/clients/${selectedClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update");
        toast.success("Klien berhasil diperbarui");
      } else {
        const response = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create");
        toast.success("Klien berhasil ditambahkan");
      }

      setOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      regency: client.regency || "",
      contact_person: client.contact_person || "",
      contact_phone: client.contact_phone || "",
      address: client.address || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedClient) return;
    try {
      const response = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Klien berhasil dihapus");
      setDeleteOpen(false);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      toast.error("Gagal menghapus klien");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      regency: "",
      contact_person: "",
      contact_phone: "",
      address: "",
    });
    setSelectedClient(null);
  };

  const handleExportCSV = () => {
    const exportData = clients.map((client) => ({
      "Nama Klien": client.name,
      "Kabupaten/Kota": client.regency || "",
      "Contact Person": client.contact_person || "",
      "No. Telepon": client.contact_phone || "",
      "Alamat": client.address || "",
      "Tanggal Dibuat": formatDateForCSV(client.created_at),
      "Tanggal Diupdate": formatDateForCSV(client.updated_at),
    }));
    exportToCSV(exportData, "klien");
    toast.success("Data klien berhasil diekspor ke CSV");
  };

  const handleExportExcel = async () => {
    const exportData = clients.map((client) => ({
      "Nama Klien": client.name,
      "Kabupaten/Kota": client.regency || "",
      "Contact Person": client.contact_person || "",
      "No. Telepon": client.contact_phone || "",
      "Alamat": client.address || "",
      "Tanggal Dibuat": formatDateForCSV(client.created_at),
      "Tanggal Diupdate": formatDateForCSV(client.updated_at),
    }));
    try {
      await exportToExcel(exportData, "klien", "Data Klien");
      toast.success("Data klien berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor data ke Excel");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Klien</h1>
          <p className="text-muted-foreground">
            Kelola data klien dan produk yang dibeli
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Klien
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedClient ? "Edit Klien" : "Tambah Klien"}
              </DialogTitle>
              <DialogDescription>
                {selectedClient
                  ? "Ubah informasi klien"
                  : "Tambahkan klien baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Klien *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regency">Kabupaten/Kota</Label>
                    <Input
                      id="regency"
                      value={formData.regency}
                      onChange={(e) =>
                        setFormData({ ...formData, regency: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">No. Telepon</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_person: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
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
                  {selectedClient ? "Perbarui" : "Tambah"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Klien</TableHead>
              <TableHead>Kabupaten/Kota</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>No. Telepon</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Belum ada klien
                </TableCell>
              </TableRow>
            ) : (
              paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-primary hover:underline"
                    >
                      {client.name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.regency || "-"}</TableCell>
                  <TableCell>{client.contact_person || "-"}</TableCell>
                  <TableCell>{client.contact_phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/clients/${client.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClient(client);
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

      {clients.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="klien"
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Klien?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus klien{" "}
              <strong>{selectedClient?.name}</strong>? Tindakan ini tidak dapat
              dibatalkan dan akan menghapus semua data terkait.
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


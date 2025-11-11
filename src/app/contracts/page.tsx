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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { statusColors } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/pagination-controls";
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

interface Contract {
  id: number;
  client_id: number;
  contract_year: number;
  status: "Draft" | "Review" | "ACC" | "Pencairan" | "Bukti Potongan Pajak";
  contract_value: number | null;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  clients: { name: string };
}

interface Client {
  id: number;
  name: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    client_id: "",
    contract_year: new Date().getFullYear().toString(),
    status: "Draft" as Contract["status"],
    contract_value: "",
    notes: "",
    start_date: "",
    end_date: "",
  });

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedContracts,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination({ data: contracts, itemsPerPage: 10 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contractsRes, clientsRes] = await Promise.all([
        fetch("/api/contracts"),
        fetch("/api/clients"),
      ]);
      setContracts(await contractsRes.json());
      setClients(await clientsRes.json());
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        client_id: parseInt(formData.client_id),
        contract_year: parseInt(formData.contract_year),
        status: formData.status,
        contract_value: formData.contract_value ? parseFloat(formData.contract_value) : null,
        notes: formData.notes || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (selectedContract) {
        const response = await fetch(`/api/contracts/${selectedContract.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update");
        toast.success("Kontrak berhasil diperbarui");
      } else {
        const response = await fetch("/api/contracts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create");
        toast.success("Kontrak berhasil ditambahkan");
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      client_id: contract.client_id.toString(),
      contract_year: contract.contract_year.toString(),
      status: contract.status,
      contract_value: contract.contract_value?.toString() || "",
      notes: contract.notes || "",
      start_date: contract.start_date || "",
      end_date: contract.end_date || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedContract) return;
    try {
      const response = await fetch(`/api/contracts/${selectedContract.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Kontrak berhasil dihapus");
      setDeleteOpen(false);
      setSelectedContract(null);
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus kontrak");
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      contract_year: new Date().getFullYear().toString(),
      status: "Draft",
      contract_value: "",
      notes: "",
      start_date: "",
      end_date: "",
    });
    setSelectedContract(null);
  };

  const handleExport = () => {
    const exportData = contracts.map((contract) => ({
      "Klien": contract.clients.name,
      "Tahun Kontrak": contract.contract_year,
      "Status": contract.status,
      "Nilai Kontrak": formatCurrencyForCSV(contract.contract_value),
      "Tanggal Mulai": formatDateForCSV(contract.start_date),
      "Tanggal Berakhir": formatDateForCSV(contract.end_date),
      "Catatan": contract.notes || "",
    }));
    exportToCSV(exportData, "kontrak");
    toast.success("Data kontrak berhasil diekspor");
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Kontrak</h1>
          <p className="text-muted-foreground">
            Kelola kontrak tahunan klien
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kontrak
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedContract ? "Edit Kontrak" : "Tambah Kontrak"}
              </DialogTitle>
              <DialogDescription>
                {selectedContract
                  ? "Ubah informasi kontrak"
                  : "Tambahkan kontrak baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Klien *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client_id: value })
                    }
                    required
                    disabled={!!selectedContract}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih klien" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contract_year">Tahun Kontrak *</Label>
                    <Input
                      id="contract_year"
                      type="number"
                      value={formData.contract_year}
                      onChange={(e) =>
                        setFormData({ ...formData, contract_year: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Contract["status"]) =>
                        setFormData({ ...formData, status: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Review">Review</SelectItem>
                        <SelectItem value="ACC">ACC</SelectItem>
                        <SelectItem value="Pencairan">Pencairan</SelectItem>
                        <SelectItem value="Bukti Potongan Pajak">Bukti Potongan Pajak</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contract_value">Nilai Kontrak</Label>
                  <Input
                    id="contract_value"
                    type="number"
                    step="0.01"
                    value={formData.contract_value}
                    onChange={(e) =>
                      setFormData({ ...formData, contract_value: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Tanggal Berakhir</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
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
                  {selectedContract ? "Perbarui" : "Tambah"}
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
              <TableHead>Klien</TableHead>
              <TableHead>Tahun</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Nilai Kontrak</TableHead>
              <TableHead>Tanggal Mulai</TableHead>
              <TableHead>Tanggal Berakhir</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Memuat...
                </TableCell>
              </TableRow>
            ) : contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Belum ada kontrak
                </TableCell>
              </TableRow>
            ) : (
              paginatedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.clients.name}</TableCell>
                  <TableCell>{contract.contract_year}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(contract.contract_value)}</TableCell>
                  <TableCell>
                    {contract.start_date
                      ? new Date(contract.start_date).toLocaleDateString("id-ID")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {contract.end_date
                      ? new Date(contract.end_date).toLocaleDateString("id-ID")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(contract)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedContract(contract);
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

      {contracts.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="kontrak"
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kontrak?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kontrak ini? Tindakan ini tidak dapat
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


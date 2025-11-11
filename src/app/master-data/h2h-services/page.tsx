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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface Bank {
  id: number;
  name: string;
}

interface H2HServiceBank {
  id: number;
  h2h_service_id: number;
  bank_id: number;
  banks: Bank;
}

interface H2HService {
  id: number;
  name: string;
  default_price: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  h2h_service_banks?: H2HServiceBank[];
}

export default function H2HServicesPage() {
  const [services, setServices] = useState<H2HService[]>([]);
  const [allBanks, setAllBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<H2HService | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    default_price: "",
    description: "",
    selectedBanks: [] as number[],
  });

  useEffect(() => {
    fetchServices();
    fetchBanks();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/h2h-services");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      toast.error("Gagal memuat jasa H2H");
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const response = await fetch("/api/banks");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAllBanks(data);
    } catch (error) {
      console.error("Failed to fetch banks");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        default_price: parseFloat(formData.default_price) || 0,
        description: formData.description || null,
      };

      if (selectedService) {
        // Update service
        const response = await fetch(`/api/h2h-services/${selectedService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to update");
        
        // Update banks
        // First, get current banks
        const currentBanksRes = await fetch(`/api/h2h-services/${selectedService.id}/banks`);
        const currentBanks = await currentBanksRes.json();
        const currentBankIds = currentBanks.map((cb: H2HServiceBank) => cb.bank_id);
        
        // Remove banks that are not selected
        const toRemove = currentBankIds.filter((id: number) => !formData.selectedBanks.includes(id));
        for (const bankId of toRemove) {
          await fetch(`/api/h2h-services/${selectedService.id}/banks?bank_id=${bankId}`, {
            method: "DELETE",
          });
        }
        
        // Add new banks
        const toAdd = formData.selectedBanks.filter((id: number) => !currentBankIds.includes(id));
        if (toAdd.length > 0) {
          await fetch(`/api/h2h-services/${selectedService.id}/banks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bank_ids: toAdd }),
          });
        }
        
        toast.success("Jasa H2H berhasil diperbarui");
      } else {
        // Create service
        const response = await fetch("/api/h2h-services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Failed to create");
        const newService = await response.json();
        
        // Add banks
        if (formData.selectedBanks.length > 0) {
          const banksResponse = await fetch(`/api/h2h-services/${newService.id}/banks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bank_ids: formData.selectedBanks }),
          });
          if (!banksResponse.ok) {
            throw new Error("Failed to add banks");
          }
        }
        
        toast.success("Jasa H2H berhasil ditambahkan");
      }

      setOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      toast.error("Terjadi kesalahan");
    }
  };

  const handleEdit = (service: H2HService) => {
    setSelectedService(service);
    const bankIds = service.h2h_service_banks?.map((sb) => sb.bank_id) || [];
    setFormData({
      name: service.name,
      default_price: service.default_price.toString(),
      description: service.description || "",
      selectedBanks: bankIds,
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    try {
      const response = await fetch(`/api/h2h-services/${selectedService.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Jasa H2H berhasil dihapus");
      setDeleteOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      toast.error("Gagal menghapus jasa H2H");
    }
  };

  const handleAddBank = async (bankName: string) => {
    if (!bankName.trim()) return;
    try {
      const response = await fetch("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: bankName.trim() }),
      });
      if (!response.ok) throw new Error("Failed to create");
      const newBank = await response.json();
      setAllBanks([...allBanks, newBank]);
      toast.success("Bank berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan bank");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", default_price: "", description: "", selectedBanks: [] });
    setSelectedService(null);
  };


  const toggleBank = (bankId: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedBanks: prev.selectedBanks.includes(bankId)
        ? prev.selectedBanks.filter((id) => id !== bankId)
        : [...prev.selectedBanks, bankId],
    }));
  };

  const [newBankName, setNewBankName] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data - Jasa H2H</h1>
          <p className="text-muted-foreground">
            Kelola daftar jasa Host-to-Host
          </p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Jasa H2H
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedService ? "Edit Jasa H2H" : "Tambah Jasa H2H"}
              </DialogTitle>
              <DialogDescription>
                {selectedService
                  ? "Ubah informasi jasa H2H"
                  : "Tambahkan jasa H2H baru"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Jasa H2H *</Label>
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
                  <Label htmlFor="default_price">Harga Default *</Label>
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
                  <Label>Bank</Label>
                  <div className="space-y-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                    {allBanks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Belum ada bank</p>
                    ) : (
                      allBanks.map((bank) => (
                        <div key={bank.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bank-${bank.id}`}
                            checked={formData.selectedBanks.includes(bank.id)}
                            onCheckedChange={() => toggleBank(bank.id)}
                          />
                          <label
                            htmlFor={`bank-${bank.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {bank.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tambah bank baru..."
                      value={newBankName}
                      onChange={(e) => setNewBankName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddBank(newBankName);
                          setNewBankName("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        handleAddBank(newBankName);
                        setNewBankName("");
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
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
                  {selectedService ? "Perbarui" : "Tambah"}
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
              <TableHead>Nama Jasa H2H</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Harga Default</TableHead>
              <TableHead>Deskripsi</TableHead>
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
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Belum ada jasa H2H
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => {
                // Handle banks - check if it's an array and has data
                const banks = service.h2h_service_banks || [];
                const hasBanks = Array.isArray(banks) && banks.length > 0;
                
                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      {hasBanks ? (
                        <div className="flex flex-wrap gap-1">
                          {banks.map((sb: H2HServiceBank) => (
                            <Badge key={sb.id} variant="secondary">
                              {sb.banks?.name || "Unknown"}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(service.default_price)}</TableCell>
                    <TableCell>{service.description || "-"}</TableCell>
                    <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedService(service);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Jasa H2H?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus jasa H2H{" "}
              <strong>{selectedService?.name}</strong>? Tindakan ini tidak dapat
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

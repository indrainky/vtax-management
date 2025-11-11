"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { statusColors } from "@/lib/constants";

interface Client {
  id: number;
  name: string;
  regency: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  address: string | null;
}

interface ClientProduct {
  id: number;
  client_id: number;
  product_id: number;
  purchase_year: number;
  purchase_price: number;
  products: { name: string };
}

interface ClientAddon {
  id: number;
  client_id: number;
  addon_id: number;
  assigned_at: string;
  addons: { name: string };
}

interface H2HServiceBank {
  id: number;
  bank_id: number;
  h2h_service_id: number;
  banks: {
    id: number;
    name: string;
  };
}

interface ClientH2HBank {
  id: number;
  client_h2h_id: number;
  bank_id: number;
  banks: {
    id: number;
    name: string;
  };
}

interface ClientH2H {
  id: number;
  client_id: number;
  h2h_service_id: number;
  assigned_at: string;
  h2h_services: { name: string };
  client_h2h_banks?: ClientH2HBank[];
}

interface Contract {
  id: number;
  client_id: number;
  contract_year: number;
  status: "Draft" | "Review" | "ACC" | "Pencairan" | "Bukti Potongan Pajak";
  contract_value: number | null;
  notes: string | null;
  start_date: string | null;
  end_date: string | null;
  updated_at: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [addons, setAddons] = useState<ClientAddon[]>([]);
  const [h2hServices, setH2hServices] = useState<ClientH2H[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allAddons, setAllAddons] = useState<any[]>([]);
  const [allH2HServices, setAllH2HServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [productOpen, setProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    product_id: "",
    purchase_year: new Date().getFullYear().toString(),
    purchase_price: "",
  });

  // Addon form
  const [addonOpen, setAddonOpen] = useState(false);
  const [addonForm, setAddonForm] = useState({ addon_id: "" });

  // H2H form
  const [h2hOpen, setH2hOpen] = useState(false);
  const [h2hForm, setH2hForm] = useState({ h2h_service_id: "" });
  const [availableBanks, setAvailableBanks] = useState<H2HServiceBank[]>([]);
  const [selectedBankIds, setSelectedBankIds] = useState<number[]>([]);

  // H2H edit form (for card info)
  const [editH2hOpen, setEditH2hOpen] = useState(false);
  const [editingH2H, setEditingH2H] = useState<ClientH2H | null>(null);
  const [editAvailableBanks, setEditAvailableBanks] = useState<H2HServiceBank[]>([]);
  const [editSelectedBankIds, setEditSelectedBankIds] = useState<number[]>([]);

  // Notes form
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [clientRes, productsRes, addonsRes, h2hRes, contractsRes, notesRes, activitiesRes, allProductsRes, allAddonsRes, allH2HRes] = await Promise.all([
        fetch(`/api/clients/${clientId}`),
        fetch(`/api/clients/${clientId}/products`),
        fetch(`/api/clients/${clientId}/addons`),
        fetch(`/api/clients/${clientId}/h2h`),
        fetch(`/api/clients/${clientId}/contracts`),
        fetch(`/api/clients/${clientId}/notes`),
        fetch(`/api/clients/${clientId}/activities`),
        fetch("/api/products"),
        fetch("/api/addons"),
        fetch("/api/h2h-services"),
      ]);

      setClient(await clientRes.json());
      setProducts(await productsRes.json());
      setAddons(await addonsRes.json());
      setH2hServices(await h2hRes.json());
      setContracts(await contractsRes.json());
      if (notesRes.ok) {
        setNotes(await notesRes.json());
      }
      if (activitiesRes.ok) {
        setActivities(await activitiesRes.json());
      }
      setAllProducts(await allProductsRes.json());
      setAllAddons(await allAddonsRes.json());
      setAllH2HServices(await allH2HRes.json());
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: parseInt(productForm.product_id),
          purchase_year: parseInt(productForm.purchase_year),
          purchase_price: parseFloat(productForm.purchase_price),
        }),
      });
      if (!response.ok) throw new Error("Failed to add");
      toast.success("Produk berhasil ditambahkan");
      setProductOpen(false);
      setProductForm({ product_id: "", purchase_year: new Date().getFullYear().toString(), purchase_price: "" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan produk");
    }
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addon_id: parseInt(addonForm.addon_id),
        }),
      });
      if (!response.ok) throw new Error("Failed to add");
      toast.success("Add-on berhasil ditambahkan");
      setAddonOpen(false);
      setAddonForm({ addon_id: "" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan add-on");
    }
  };

  const handleAddH2H = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}/h2h`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          h2h_service_id: parseInt(h2hForm.h2h_service_id),
          bank_ids: selectedBankIds,
        }),
      });
      if (!response.ok) throw new Error("Failed to add");
      toast.success("Jasa H2H berhasil ditambahkan");
      setH2hOpen(false);
      setH2hForm({ h2h_service_id: "" });
      setAvailableBanks([]);
      setSelectedBankIds([]);
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan jasa H2H");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Produk berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus produk");
    }
  };

  const handleDeleteAddon = async (id: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/addons/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Add-on berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus add-on");
    }
  };

  const handleDeleteH2H = async (id: number) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/h2h/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Jasa H2H berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus jasa H2H");
    }
  };

  const handleEditH2H = (item: ClientH2H) => {
    setEditingH2H(item);
    // Find the H2H service to get available banks
    const service = allH2HServices.find((s) => s.id === item.h2h_service_id);
    setEditAvailableBanks(service?.h2h_service_banks || []);
    // Set currently selected banks
    const currentBankIds = item.client_h2h_banks?.map((b) => b.bank_id) || [];
    setEditSelectedBankIds(currentBankIds);
    setEditH2hOpen(true);
  };

  const handleUpdateH2HBanks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingH2H) return;

    try {
      const response = await fetch(`/api/clients/${clientId}/h2h/${editingH2H.id}/banks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_ids: editSelectedBankIds,
        }),
      });
      if (!response.ok) throw new Error("Failed to update");
      toast.success("Bank berhasil diperbarui");
      setEditH2hOpen(false);
      setEditingH2H(null);
      setEditAvailableBanks([]);
      setEditSelectedBankIds([]);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui bank");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });

      if (!response.ok) throw new Error("Failed to create note");
      toast.success("Catatan berhasil ditambahkan");
      setNoteForm({ title: "", content: "" });
      setNoteOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan catatan");
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setNoteForm({ title: note.title || "", content: note.content || "" });
    setNoteOpen(true);
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;
    try {
      const response = await fetch(`/api/notes/${editingNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(noteForm),
      });

      if (!response.ok) throw new Error("Failed to update note");
      toast.success("Catatan berhasil diperbarui");
      setNoteForm({ title: "", content: "" });
      setEditingNote(null);
      setNoteOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui catatan");
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");
      toast.success("Catatan berhasil dihapus");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus catatan");
    }
  };

  const resetNoteForm = () => {
    setNoteForm({ title: "", content: "" });
    setEditingNote(null);
  };

  if (loading) {
    return <div>Memuat...</div>;
  }

  if (!client) {
    return <div>Klien tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{client.name}</h1>
          <p className="text-muted-foreground">Detail informasi klien</p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Informasi Klien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Nama:</span>
                <p className="text-sm">{client.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Kabupaten/Kota:</span>
                <p className="text-sm">{client.regency || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Contact Person:</span>
                <p className="text-sm">{client.contact_person || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">No. Telepon:</span>
                <p className="text-sm">{client.contact_phone || "-"}</p>
              </div>
              <div>
                <span className="text-sm font-medium">Alamat:</span>
                <p className="text-sm">{client.address || "-"}</p>
              </div>
            </div>
            
            {/* Tags untuk Produk, Addon, dan Jasa H2H */}
            <div className="md:col-span-1 lg:col-span-3 space-y-3">
              <div>
                <span className="text-sm font-medium mb-2 block">Produk Terpasang:</span>
                {products.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {products.map((item) => (
                      <Badge 
                        key={item.id} 
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {item.products.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada produk</p>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium mb-2 block">Add-ons Terpasang:</span>
                {addons.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {addons.map((item) => (
                      <Badge 
                        key={item.id} 
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        {item.addons.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada add-on</p>
                )}
              </div>
              
              <div>
                <span className="text-sm font-medium mb-2 block">Jasa H2H Terpasang:</span>
                {h2hServices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {h2hServices.map((item) => (
                      <div key={item.id} className="flex items-center gap-1">
                        <Badge 
                          className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
                          onClick={() => handleEditH2H(item)}
                        >
                          {item.h2h_services.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => handleEditH2H(item)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada jasa H2H</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        </Card>

      {/* Dialog Edit H2H Banks */}
      <Dialog open={editH2hOpen} onOpenChange={setEditH2hOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank untuk {editingH2H?.h2h_services.name}</DialogTitle>
            <DialogDescription>
              Pilih bank-bank yang digunakan klien untuk jasa H2H ini
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateH2HBanks}>
            <div className="space-y-4 py-4">
              {editAvailableBanks.length > 0 ? (
                <div className="space-y-2">
                  <Label>Pilih Bank yang Digunakan Klien:</Label>
                  <div className="space-y-2 p-3 border rounded-md bg-muted/50 max-h-48 overflow-y-auto">
                    {editAvailableBanks.map((bankItem) => (
                      <div key={bankItem.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-bank-${bankItem.bank_id}`}
                          checked={editSelectedBankIds.includes(bankItem.bank_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditSelectedBankIds([...editSelectedBankIds, bankItem.bank_id]);
                            } else {
                              setEditSelectedBankIds(
                                editSelectedBankIds.filter((id) => id !== bankItem.bank_id)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`edit-bank-${bankItem.bank_id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {bankItem.banks?.name || "Unknown"}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pilih bank-bank yang digunakan klien untuk jasa H2H ini
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                  Jasa H2H ini belum memiliki bank yang terhubung
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setEditH2hOpen(false);
                setEditingH2H(null);
                setEditAvailableBanks([]);
                setEditSelectedBankIds([]);
              }}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Produk</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="h2h">Jasa H2H</TabsTrigger>
          <TabsTrigger value="contracts">Kontrak</TabsTrigger>
          <TabsTrigger value="notes">Catatan</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Produk yang Dibeli</h2>
            <Dialog open={productOpen} onOpenChange={setProductOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Produk
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Produk</DialogTitle>
                  <DialogDescription>
                    Pilih produk yang dibeli oleh klien
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="product_id">Produk</Label>
                      <Select
                        value={productForm.product_id}
                        onValueChange={(value) =>
                          setProductForm({ ...productForm, product_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                        <SelectContent>
                          {allProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_year">Tahun Beli</Label>
                      <Input
                        id="purchase_year"
                        type="number"
                        value={productForm.purchase_year}
                        onChange={(e) =>
                          setProductForm({ ...productForm, purchase_year: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Harga Beli</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={productForm.purchase_price}
                        onChange={(e) =>
                          setProductForm({ ...productForm, purchase_price: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setProductOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Tambah</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Tahun Beli</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Belum ada produk
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.products.name}</TableCell>
                      <TableCell>{item.purchase_year}</TableCell>
                      <TableCell>{formatCurrency(item.purchase_price)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="addons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add-ons yang Terpasang</h2>
            <Dialog open={addonOpen} onOpenChange={setAddonOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Add-on
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Add-on</DialogTitle>
                  <DialogDescription>
                    Pilih add-on yang terpasang untuk klien
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddAddon}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="addon_id">Add-on</Label>
                      <Select
                        value={addonForm.addon_id}
                        onValueChange={(value) =>
                          setAddonForm({ addon_id: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih add-on" />
                        </SelectTrigger>
                        <SelectContent>
                          {allAddons
                            .filter((addon) => !addons.some((a) => a.addon_id === addon.id))
                            .map((addon) => (
                              <SelectItem key={addon.id} value={addon.id.toString()}>
                                {addon.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddonOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit">Tambah</Button>
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
                  <TableHead>Tanggal Terpasang</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Belum ada add-on
                    </TableCell>
                  </TableRow>
                ) : (
                  addons.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.addons.name}</TableCell>
                      <TableCell>{new Date(item.assigned_at).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAddon(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="h2h" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Jasa H2H yang Digunakan</h2>
            <Dialog open={h2hOpen} onOpenChange={setH2hOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Jasa H2H
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Jasa H2H</DialogTitle>
                  <DialogDescription>
                    Pilih jasa H2H yang digunakan klien
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddH2H}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="h2h_service_id">Jasa H2H</Label>
                      <Select
                        value={h2hForm.h2h_service_id}
                        onValueChange={(value) => {
                          setH2hForm({ h2h_service_id: value });
                          setSelectedBankIds([]);
                          // Find selected service and get its banks
                          const selectedService = allH2HServices.find(
                            (s) => s.id.toString() === value
                          );
                          setAvailableBanks(selectedService?.h2h_service_banks || []);
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jasa H2H" />
                        </SelectTrigger>
                        <SelectContent>
                          {allH2HServices
                            .filter((service) => !h2hServices.some((h) => h.h2h_service_id === service.id))
                            .map((service) => (
                              <SelectItem key={service.id} value={service.id.toString()}>
                                {service.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {availableBanks.length > 0 && (
                      <div className="space-y-2">
                        <Label>Pilih Bank yang Digunakan Klien:</Label>
                        <div className="space-y-2 p-3 border rounded-md bg-muted/50 max-h-48 overflow-y-auto">
                          {availableBanks.map((bankItem) => (
                            <div key={bankItem.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`bank-${bankItem.bank_id}`}
                                checked={selectedBankIds.includes(bankItem.bank_id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedBankIds([...selectedBankIds, bankItem.bank_id]);
                                  } else {
                                    setSelectedBankIds(
                                      selectedBankIds.filter((id) => id !== bankItem.bank_id)
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`bank-${bankItem.bank_id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {bankItem.banks?.name || "Unknown"}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Pilih bank-bank yang digunakan klien untuk jasa H2H ini
                        </p>
                      </div>
                    )}
                    {h2hForm.h2h_service_id && availableBanks.length === 0 && (
                      <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/50">
                        Jasa H2H ini belum memiliki bank yang terhubung
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setH2hOpen(false);
                      setH2hForm({ h2h_service_id: "" });
                      setAvailableBanks([]);
                      setSelectedBankIds([]);
                    }}>
                      Batal
                    </Button>
                    <Button type="submit">Tambah</Button>
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
                  <TableHead>Tanggal Terpasang</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {h2hServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Belum ada jasa H2H
                    </TableCell>
                  </TableRow>
                ) : (
                  h2hServices.map((item) => {
                    const banks = item.client_h2h_banks || [];
                    const hasBanks = Array.isArray(banks) && banks.length > 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.h2h_services.name}</TableCell>
                        <TableCell>
                          {hasBanks ? (
                            <div className="flex flex-wrap gap-1">
                              {banks.map((bankItem: ClientH2HBank) => (
                                <Badge key={bankItem.id} variant="secondary">
                                  {bankItem.banks?.name || "Unknown"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(item.assigned_at).toLocaleDateString("id-ID")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditH2H(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteH2H(item.id)}
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
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tahun Kontrak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nilai Kontrak</TableHead>
                  <TableHead>Tanggal Mulai</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Belum ada kontrak
                    </TableCell>
                  </TableRow>
                ) : (
                  contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contract_year}</TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[contract.status]} hover:opacity-80 text-white`}
                        >
                          {contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {contract.contract_value
                          ? formatCurrency(contract.contract_value)
                          : "-"}
                      </TableCell>
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
                      <TableCell>
                        <span className="text-sm">
                          {contract.notes || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Catatan Klien</h2>
            <Dialog
              open={noteOpen}
              onOpenChange={(open) => {
                setNoteOpen(open);
                if (!open) resetNoteForm();
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => resetNoteForm()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Catatan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? "Edit Catatan" : "Tambah Catatan"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNote
                      ? "Ubah informasi catatan"
                      : "Tambahkan catatan baru untuk klien ini"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={editingNote ? handleUpdateNote : handleAddNote}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="note_title">Judul (Opsional)</Label>
                      <Input
                        id="note_title"
                        value={noteForm.title}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, title: e.target.value })
                        }
                        placeholder="Judul catatan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note_content">Isi Catatan</Label>
                      <Textarea
                        id="note_content"
                        value={noteForm.content}
                        onChange={(e) =>
                          setNoteForm({ ...noteForm, content: e.target.value })
                        }
                        placeholder="Tulis catatan..."
                        rows={6}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setNoteOpen(false);
                        resetNoteForm();
                      }}
                    >
                      Batal
                    </Button>
                    <Button type="submit">
                      {editingNote ? "Perbarui" : "Tambah"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Memuat...
              </div>
            ) : notes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Belum ada catatan untuk klien ini
              </div>
            ) : (
              <div className="divide-y">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">
                          {note.title || "Tanpa Judul"}
                        </h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(note.updated_at).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditNote(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Timeline Aktivitas</h2>
            <p className="text-sm text-muted-foreground">
              Riwayat aktivitas dan perubahan untuk klien ini
            </p>
          </div>

          <div className="relative">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                Memuat...
              </div>
            ) : activities.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Belum ada aktivitas untuk klien ini
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const getActivityIcon = () => {
                    switch (activity.activity_type) {
                      case "contract_created":
                      case "contract_updated":
                      case "contract_deleted":
                        return "📄";
                      case "product_added":
                      case "product_removed":
                        return "📦";
                      case "addon_added":
                      case "addon_removed":
                        return "🔧";
                      case "h2h_added":
                      case "h2h_removed":
                        return "🔌";
                      case "note_created":
                      case "note_updated":
                      case "note_deleted":
                        return "📝";
                      case "client_created":
                      case "client_updated":
                        return "👤";
                      default:
                        return "📌";
                    }
                  };

                  const getActivityColor = () => {
                    if (activity.activity_type.includes("created") || activity.activity_type.includes("added")) {
                      return "bg-green-500";
                    } else if (activity.activity_type.includes("updated")) {
                      return "bg-blue-500";
                    } else if (activity.activity_type.includes("deleted") || activity.activity_type.includes("removed")) {
                      return "bg-red-500";
                    }
                    return "bg-gray-500";
                  };

                  return (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Timeline line */}
                      {index < activities.length - 1 && (
                        <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-border" />
                      )}
                      
                      {/* Icon */}
                      <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor()} text-white text-sm`}>
                        {getActivityIcon()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1 pb-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {activity.activity_type.replace(/_/g, " ")}
                          </Badge>
                          {activity.entity_type && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.entity_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


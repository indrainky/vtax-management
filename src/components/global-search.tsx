"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "client" | "product" | "contract" | "addon" | "h2h";
  id: number;
  title: string;
  subtitle?: string;
  url: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, productsRes, contractsRes, addonsRes, h2hRes] = await Promise.all([
          fetch("/api/clients").catch(() => null),
          fetch("/api/products").catch(() => null),
          fetch("/api/contracts").catch(() => null),
          fetch("/api/addons").catch(() => null),
          fetch("/api/h2h-services").catch(() => null),
        ]);

        const allResults: SearchResult[] = [];

        if (clientsRes?.ok) {
          const clients = await clientsRes.json();
          clients
            .filter((client: any) =>
              client.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .forEach((client: any) => {
              allResults.push({
                type: "client",
                id: client.id,
                title: client.name,
                subtitle: client.regency || undefined,
                url: `/clients/${client.id}`,
              });
            });
        }

        if (productsRes?.ok) {
          const products = await productsRes.json();
          products
            .filter((product: any) =>
              product.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .forEach((product: any) => {
              allResults.push({
                type: "product",
                id: product.id,
                title: product.name,
                url: `/master-data/products`,
              });
            });
        }

        if (contractsRes?.ok) {
          const contracts = await contractsRes.json();
          contracts
            .filter((contract: any) =>
              contract.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              contract.contract_year?.toString().includes(searchQuery)
            )
            .forEach((contract: any) => {
              allResults.push({
                type: "contract",
                id: contract.id,
                title: `${contract.clients?.name} - ${contract.contract_year}`,
                subtitle: contract.status,
                url: `/contracts`,
              });
            });
        }

        if (addonsRes?.ok) {
          const addons = await addonsRes.json();
          addons
            .filter((addon: any) =>
              addon.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .forEach((addon: any) => {
              allResults.push({
                type: "addon",
                id: addon.id,
                title: addon.name,
                url: `/master-data/addons`,
              });
            });
        }

        if (h2hRes?.ok) {
          const h2hServices = await h2hRes.json();
          h2hServices
            .filter((service: any) =>
              service.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .forEach((service: any) => {
              allResults.push({
                type: "h2h",
                id: service.id,
                title: service.name,
                url: `/master-data/h2h-services`,
              });
            });
        }

        setResults(allResults.slice(0, 10)); // Limit to 10 results
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    onOpenChange(false);
    setSearchQuery("");
    setResults([]);
  };

  const getTypeLabel = (type: SearchResult["type"]) => {
    const labels = {
      client: "Klien",
      product: "Produk",
      contract: "Kontrak",
      addon: "Add-on",
      h2h: "Jasa H2H",
    };
    return labels[type];
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    const colors = {
      client: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      product: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      contract: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      addon: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      h2h: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    };
    return colors[type];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Pencarian Global</DialogTitle>
        </DialogHeader>
        <Command className="rounded-lg border-none">
          <CommandInput
            ref={inputRef}
            placeholder="Cari klien, produk, kontrak, add-on, atau jasa H2H..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
          />
          <CommandList>
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Mencari...
              </div>
            )}
            {!loading && searchQuery && results.length === 0 && (
              <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
            )}
            {!loading && results.length > 0 && (
              <CommandGroup heading="Hasil Pencarian">
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          getTypeColor(result.type)
                        )}
                      >
                        {getTypeLabel(result.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}


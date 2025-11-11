"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [restoring, setRestoring] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);

  const handleBackup = async () => {
    try {
      setBackingUp(true);
      const response = await fetch("/api/database/backup");

      if (!response.ok) {
        throw new Error("Failed to create backup");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vtax-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Backup berhasil dibuat dan diunduh");
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Gagal membuat backup");
    } finally {
      setBackingUp(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/json") {
        toast.error("File harus berformat JSON");
        return;
      }
      setRestoreFile(file);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) {
      toast.error("Pilih file backup terlebih dahulu");
      return;
    }

    try {
      setRestoring(true);
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);

      const response = await fetch("/api/database/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backupData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to restore backup");
      }

      const result = await response.json();
      toast.success("Backup berhasil di-restore");
      console.log("Restore results:", result);
      setRestoreFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("restore-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error("Gagal me-restore backup");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan backup database
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Backup Database */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Backup Database</CardTitle>
                <CardDescription>
                  Unduh backup database dalam format JSON
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Fitur Backup</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Export semua data dari database</li>
                    <li>Format JSON yang mudah dibaca</li>
                    <li>Dapat digunakan untuk migrasi ke database lain</li>
                    <li>Menyertakan timestamp dan versi backup</li>
                  </ul>
                </div>
              </div>
            </div>
            <Button
              onClick={handleBackup}
              disabled={backingUp}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {backingUp ? "Membuat Backup..." : "Buat Backup"}
            </Button>
          </CardContent>
        </Card>

        {/* Restore Database */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <Upload className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Restore Database</CardTitle>
                <CardDescription>
                  Restore database dari file backup JSON
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">Peringatan</p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Restore akan menimpa data yang sudah ada</li>
                    <li>Pastikan sudah membuat backup sebelum restore</li>
                    <li>Proses restore tidak dapat dibatalkan</li>
                    <li>Data yang tidak ada di backup akan tetap ada</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <input
                id="restore-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="restore-file">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Pilih File Backup
                  </span>
                </Button>
              </label>
              {restoreFile && (
                <p className="text-sm text-muted-foreground">
                  File: {restoreFile.name}
                </p>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!restoreFile || restoring}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {restoring ? "Mengembalikan..." : "Restore Database"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Restore</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin me-restore database dari file backup?
                    Tindakan ini akan menimpa data yang sudah ada dan tidak dapat
                    dibatalkan. Pastikan Anda sudah membuat backup terlebih dahulu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestore}>
                    Ya, Restore Sekarang
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


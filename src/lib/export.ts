/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param headers - Optional custom headers mapping { key: "Display Name" }
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<string, string>
): void {
  if (data.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  // Get all keys from first object
  const keys = Object.keys(data[0]);

  // Create CSV header row
  const headerRow = keys
    .map((key) => {
      const header = headers?.[key] || key;
      return `"${header}"`;
    })
    .join(",");

  // Create CSV data rows
  const dataRows = data.map((row) => {
    return keys
      .map((key) => {
        const value = row[key];
        // Handle null/undefined
        if (value === null || value === undefined) return '""';
        // Handle objects (like nested objects)
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",");
  });

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join("\n");

  // Create blob and download
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date for CSV export
 */
export function formatDateForCSV(date: string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID");
}

/**
 * Format currency for CSV export
 */
export function formatCurrencyForCSV(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.toString();
}

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the Excel sheet (default: "Sheet1")
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = "Sheet1"
): Promise<void> {
  if (data.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  // Dynamic import xlsx to avoid SSR issues
  const XLSX = await import("xlsx");

  // Convert data to worksheet format
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths (optional, for better formatting)
  const maxWidth = 50;
  const wscols = Object.keys(data[0]).map(() => ({ wch: maxWidth }));
  worksheet["!cols"] = wscols;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  // Create blob and download
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

interface BackupData {
  version?: string;
  timestamp?: string;
  tables: Record<string, any[]>;
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const backupData: BackupData = body;

    if (!backupData.tables || typeof backupData.tables !== "object") {
      return NextResponse.json(
        { error: "Invalid backup format" },
        { status: 400 }
      );
    }

    const results: Record<string, { success: number; errors: number }> = {};

    // Restore data for each table
    for (const [tableName, data] of Object.entries(backupData.tables)) {
      if (!Array.isArray(data) || data.length === 0) {
        results[tableName] = { success: 0, errors: 0 };
        continue;
      }

      try {
        // Delete existing data first (optional - you might want to merge instead)
        // Uncomment if you want to clear existing data before restore
        // await supabase.from(tableName).delete().neq("id", 0);

        // Insert data in batches to avoid timeout
        const batchSize = 100;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < data.length; i += batchSize) {
          const batch = data.slice(i, i + batchSize);
          const { error } = await supabase.from(tableName).upsert(batch, {
            onConflict: "id",
          });

          if (error) {
            console.error(`Error restoring ${tableName} batch:`, error);
            errorCount += batch.length;
          } else {
            successCount += batch.length;
          }
        }

        results[tableName] = { success: successCount, errors: errorCount };
      } catch (error) {
        console.error(`Error restoring ${tableName}:`, error);
        results[tableName] = { success: 0, errors: data.length };
      }
    }

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully",
      results,
      backupInfo: {
        version: backupData.version,
        timestamp: backupData.timestamp,
      },
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}


import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get all tables data
    const tables = [
      "products",
      "addons",
      "h2h_services",
      "banks",
      "h2h_service_banks",
      "clients",
      "client_products",
      "client_addons",
      "client_h2h",
      "client_h2h_banks",
      "contracts",
      "todos",
      "notes",
      "activity_log",
    ];

    const backup: {
      version: string;
      timestamp: string;
      tables: Record<string, any[]>;
      schema?: string;
    } = {
      version: "1.4.0",
      timestamp: new Date().toISOString(),
      tables: {},
    };

    // Fetch data from each table
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select("*");
        if (error) {
          console.error(`Error fetching ${table}:`, error);
          backup.tables[table] = [];
        } else {
          backup.tables[table] = data || [];
        }
      } catch (error) {
        console.error(`Error fetching ${table}:`, error);
        backup.tables[table] = [];
      }
    }

    // Convert to JSON string for download
    const jsonString = JSON.stringify(backup, null, 2);

    // Return as downloadable file
    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="vtax-backup-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}


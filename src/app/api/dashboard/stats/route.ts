import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get counts
    const [productsResult, clientsResult, contractsResult, todosResult] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("contracts").select("id", { count: "exact", head: true }),
      supabase.from("todos").select("id", { count: "exact", head: true }).eq("is_completed", false),
    ]);

    return NextResponse.json({
      products: productsResult.count || 0,
      clients: clientsResult.count || 0,
      contracts: contractsResult.count || 0,
      todos: todosResult.count || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}


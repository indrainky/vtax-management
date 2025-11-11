import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("contracts")
      .select("*")
      .eq("client_id", id)
      .order("contract_year", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch client contracts" },
      { status: 500 }
    );
  }
}



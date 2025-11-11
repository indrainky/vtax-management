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
      .from("activity_log")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(100); // Limit to last 100 activities

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch client activities" },
      { status: 500 }
    );
  }
}


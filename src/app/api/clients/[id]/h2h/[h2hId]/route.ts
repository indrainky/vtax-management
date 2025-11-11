import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; h2hId: string }> }
) {
  try {
    const { h2hId } = await params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("client_h2h")
      .delete()
      .eq("id", h2hId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete client H2H service" },
      { status: 500 }
    );
  }
}


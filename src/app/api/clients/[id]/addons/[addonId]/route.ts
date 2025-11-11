import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  try {
    const { addonId } = await params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("client_addons")
      .delete()
      .eq("id", addonId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete client addon" },
      { status: 500 }
    );
  }
}


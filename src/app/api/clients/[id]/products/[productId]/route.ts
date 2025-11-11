import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  try {
    const { productId } = await params;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("client_products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete client product" },
      { status: 500 }
    );
  }
}


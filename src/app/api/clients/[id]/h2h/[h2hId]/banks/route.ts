import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; h2hId: string }> }
) {
  try {
    const { h2hId } = await params;
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { bank_ids } = body;

    // Delete existing banks for this client_h2h
    const { error: deleteError } = await supabase
      .from("client_h2h_banks")
      .delete()
      .eq("client_h2h_id", parseInt(h2hId));

    if (deleteError) throw deleteError;

    // Insert new banks if any
    if (bank_ids && Array.isArray(bank_ids) && bank_ids.length > 0) {
      const bankInserts = bank_ids.map((bankId: number) => ({
        client_h2h_id: parseInt(h2hId),
        bank_id: bankId,
      }));

      const { error: insertError } = await supabase
        .from("client_h2h_banks")
        .insert(bankInserts);

      if (insertError) throw insertError;
    }

    // Fetch updated banks
    const { data: clientBanks, error: fetchError } = await supabase
      .from("client_h2h_banks")
      .select(`
        id,
        client_h2h_id,
        bank_id,
        banks (
          id,
          name
        )
      `)
      .eq("client_h2h_id", parseInt(h2hId));

    if (fetchError) throw fetchError;

    return NextResponse.json({ client_h2h_banks: clientBanks || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update client H2H banks" },
      { status: 500 }
    );
  }
}


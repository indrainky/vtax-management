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
      .from("client_h2h")
      .select("*, h2h_services(*)")
      .eq("client_id", id);

    if (error) throw error;

    // Fetch banks selected by client for each H2H service
    if (data && data.length > 0) {
      const dataWithBanks = await Promise.all(
        data.map(async (item: any) => {
          const { data: clientBanks, error: banksError } = await supabase
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
            .eq("client_h2h_id", item.id);

          if (banksError) {
            return {
              ...item,
              client_h2h_banks: [],
            };
          }

          return {
            ...item,
            client_h2h_banks: clientBanks || [],
          };
        })
      );

      return NextResponse.json(dataWithBanks);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch client H2H services" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { h2h_service_id, bank_ids } = body;

    // Insert client_h2h first
    const { data: clientH2H, error: insertError } = await supabase
      .from("client_h2h")
      .insert([{ h2h_service_id: parseInt(h2h_service_id), client_id: parseInt(id) }])
      .select("*, h2h_services(*)")
      .single();

    if (insertError) throw insertError;

    // Insert selected banks if any
    if (clientH2H && bank_ids && Array.isArray(bank_ids) && bank_ids.length > 0) {
      const bankInserts = bank_ids.map((bankId: number) => ({
        client_h2h_id: clientH2H.id,
        bank_id: bankId,
      }));

      const { error: banksError } = await supabase
        .from("client_h2h_banks")
        .insert(bankInserts);

      if (banksError) {
        // If bank insert fails, we should still return the client_h2h data
        console.error("Failed to insert banks:", banksError);
      }
    }

    // Fetch the banks that were inserted
    if (clientH2H) {
      const { data: clientBanks, error: fetchBanksError } = await supabase
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
        .eq("client_h2h_id", clientH2H.id);

      if (!fetchBanksError && clientBanks) {
        return NextResponse.json(
          {
            ...clientH2H,
            client_h2h_banks: clientBanks,
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      {
        ...clientH2H,
        client_h2h_banks: [],
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add H2H service to client" },
      { status: 500 }
    );
  }
}


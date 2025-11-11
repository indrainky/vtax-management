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
      .from("h2h_service_banks")
      .select(`
        id,
        bank_id,
        h2h_service_id,
        banks (
          id,
          name
        )
      `)
      .eq("h2h_service_id", id);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch banks" },
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
    
    // body.bank_ids adalah array of bank IDs
    const { bank_ids } = body;
    
    if (!Array.isArray(bank_ids)) {
      return NextResponse.json(
        { error: "bank_ids must be an array" },
        { status: 400 }
      );
    }

    if (bank_ids.length === 0) {
      return NextResponse.json({ data: [] }, { status: 201 });
    }

    // Insert multiple relations
    const relations = bank_ids.map((bank_id: number) => ({
      h2h_service_id: parseInt(id),
      bank_id: bank_id,
    }));

    const { data, error } = await supabase
      .from("h2h_service_banks")
      .insert(relations)
      .select(`
        id,
        bank_id,
        h2h_service_id,
        banks (
          id,
          name
        )
      `);

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add banks" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get("bank_id");

    if (!bankId) {
      return NextResponse.json(
        { error: "bank_id is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("h2h_service_banks")
      .delete()
      .eq("h2h_service_id", id)
      .eq("bank_id", bankId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove bank" },
      { status: 500 }
    );
  }
}


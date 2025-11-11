import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // First, get all services
    const { data: services, error: servicesError } = await supabase
      .from("h2h_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (servicesError) {
      throw servicesError;
    }

    if (!services || services.length === 0) {
      return NextResponse.json([]);
    }

    // Then, get all banks for each service
    const servicesWithBanks = await Promise.all(
      services.map(async (service) => {
        const { data: banks, error: banksError } = await supabase
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
          .eq("h2h_service_id", service.id);

        if (banksError) {
          return {
            ...service,
            h2h_service_banks: [],
          };
        }

        return {
          ...service,
          h2h_service_banks: banks || [],
        };
      })
    );

    return NextResponse.json(servicesWithBanks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch H2H services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { data, error } = await supabase
      .from("h2h_services")
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create H2H service" },
      { status: 500 }
    );
  }
}


import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Get contracts that are expiring within 30 days
    const { data, error } = await supabase
      .from("contracts")
      .select("*, clients(name)")
      .not("end_date", "is", null)
      .lte("end_date", thirtyDaysFromNow.toISOString().split("T")[0])
      .gte("end_date", today.toISOString().split("T")[0])
      .order("end_date", { ascending: true });

    if (error) throw error;

    // Calculate days until expiration
    const contractsWithDays = (data || []).map((contract) => {
      const endDate = new Date(contract.end_date);
      const daysUntilExpiration = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        ...contract,
        days_until_expiration: daysUntilExpiration,
      };
    });

    return NextResponse.json(contractsWithDays);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expiring contracts" },
      { status: 500 }
    );
  }
}


import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    // Get contract status distribution
    const { data: contracts, error: contractsError } = await supabase
      .from("contracts")
      .select("status");

    if (contractsError) throw contractsError;

    // Count contracts by status
    const statusCounts: Record<string, number> = {};
    (contracts || []).forEach((contract) => {
      statusCounts[contract.status] = (statusCounts[contract.status] || 0) + 1;
    });

    // Get contracts by year
    const { data: contractsByYear, error: yearError } = await supabase
      .from("contracts")
      .select("contract_year, contract_value");

    if (yearError) throw yearError;

    // Group by year and calculate total value
    const yearData: Record<number, { count: number; totalValue: number }> = {};
    (contractsByYear || []).forEach((contract) => {
      const year = contract.contract_year;
      if (!yearData[year]) {
        yearData[year] = { count: 0, totalValue: 0 };
      }
      yearData[year].count += 1;
      yearData[year].totalValue += Number(contract.contract_value || 0);
    });

    // Get clients by regency
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("regency");

    if (clientsError) throw clientsError;

    // Count clients by regency
    const regencyCounts: Record<string, number> = {};
    (clients || []).forEach((client) => {
      const regency = client.regency || "Tidak Diketahui";
      regencyCounts[regency] = (regencyCounts[regency] || 0) + 1;
    });

    // Get top products by client count
    const { data: clientProducts, error: productsError } = await supabase
      .from("client_products")
      .select("product_id, products(name)");

    if (productsError) throw productsError;

    // Count products by usage
    const productCounts: Record<string, { name: string; count: number }> = {};
    (clientProducts || []).forEach((cp: any) => {
      const productId = cp.product_id;
      const productName = cp.products?.name || `Product ${productId}`;
      if (!productCounts[productId]) {
        productCounts[productId] = { name: productName, count: 0 };
      }
      productCounts[productId].count += 1;
    });

    return NextResponse.json({
      contractStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      contractsByYear: Object.entries(yearData)
        .map(([year, data]) => ({
          year: Number(year),
          count: data.count,
          totalValue: data.totalValue,
        }))
        .sort((a, b) => a.year - b.year),
      clientsByRegency: Object.entries(regencyCounts)
        .map(([regency, count]) => ({
          regency,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10
      topProducts: Object.entries(productCounts)
        .map(([id, data]) => ({
          id: Number(id),
          name: data.name,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}


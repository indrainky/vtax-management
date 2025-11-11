import { Sidebar } from "@/components/sidebar";

export default async function MasterDataLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already protects this route
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}


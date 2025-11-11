"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if signed in
    const checkAuth = async () => {
      // This will be handled by middleware or client-side redirect
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignedOut>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">v-tax Management</h1>
          <p className="text-muted-foreground">
            Aplikasi web internal untuk manajemen klien dan kontrak
          </p>
          <SignInButton>
            <Button size="lg">Masuk</Button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <RedirectToDashboard />
      </SignedIn>
    </div>
  );
}

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.push("/dashboard");
  }, [router]);
  return (
    <div className="text-center">
      <p>Mengarahkan ke dashboard...</p>
    </div>
  );
}

import { ReactNode } from "react";
import { Header } from "./header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}

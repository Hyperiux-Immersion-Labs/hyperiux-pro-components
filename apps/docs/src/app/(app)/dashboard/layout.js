import { DashboardShell } from "@/components/Dashboard/DashboardShell";
import { VaultLayout } from "@/components/layout/VaultLayout";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }) {
  return (
    <VaultLayout>
    <DashboardShell>
      {children}
    </DashboardShell>
    </VaultLayout>
  );
}

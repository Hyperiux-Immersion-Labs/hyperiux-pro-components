import { DashboardShell } from "@/components/Dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }) {
  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}

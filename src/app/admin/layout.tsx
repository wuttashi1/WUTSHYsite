import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider, ConfirmProvider } from "@/components/admin/ui";

export const metadata = {
  title: "Admin — WUTSHY",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminShell>{children}</AdminShell>
      </ConfirmProvider>
    </ToastProvider>
  );
}

import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <AdminSidebar />
          <div className="md:ml-60">{children}</div>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

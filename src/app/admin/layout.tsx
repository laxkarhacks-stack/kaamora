import { AdminSidebar } from "@/components/admin/sidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

import AdminAuthGuard from "./AdminAuthGuard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}

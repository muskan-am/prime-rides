import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import AdminEmailLogsClient from "@/components/admin/AdminEmailLogsClient";

export default async function AdminEmailLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <AdminEmailLogsClient />;
}

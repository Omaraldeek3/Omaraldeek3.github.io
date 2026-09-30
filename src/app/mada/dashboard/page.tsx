import type { Metadata } from "next";
import { Suspense } from "react";
import Dashboard, { DashboardLoading } from "@/mada/dashboard";

export const metadata: Metadata = {
  title: "مساحة العمل",
  description: "مساحة واحدة لتنظيم مشاريعك ومهامك ودليل فريقك مع مدى.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

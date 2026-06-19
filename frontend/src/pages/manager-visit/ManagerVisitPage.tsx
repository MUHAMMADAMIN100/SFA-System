import { VisitForm } from "@/features/create-visit";
import { PageHeader } from "@/shared/ui";

export function ManagerVisitPage() {
  return (
    <>
      <PageHeader title="Новый визит" />
      <VisitForm />
    </>
  );
}

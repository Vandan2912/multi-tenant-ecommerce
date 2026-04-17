import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewPageForm } from "@/components/admin/NewPageForm";

export default async function NewPageRoute({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { preset } = await searchParams;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Page</h1>
      <p className="text-sm text-gray-400 mb-8">
        Pick a title and slug — you can configure sections on the next screen.
      </p>
      <NewPageForm preset={preset} />
    </div>
  );
}

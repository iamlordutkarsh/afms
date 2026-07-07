import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { CategoriesSection } from "./categories-section";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rows = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((s) => [s.key, s.value]));
  const categories = await prisma.category.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });

  return (
    <div className="max-w-2xl space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <SettingsForm
        initial={{
          associationName: settings.associationName ?? "",
          upiId: settings.upiId ?? "",
          upiPayeeName: settings.upiPayeeName ?? "",
          receiptPrefix: settings.receiptPrefix ?? "RCT",
          fiscalYearStartMonth: Number(settings.fiscalYearStartMonth ?? 4),
        }}
      />

      <CategoriesSection
        initial={categories.map((c) => ({ id: c.id, name: c.name, type: c.type, isActive: c.isActive }))}
      />
    </div>
  );
}

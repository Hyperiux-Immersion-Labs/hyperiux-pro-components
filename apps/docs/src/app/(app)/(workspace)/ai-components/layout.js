import { getAiCatalogue } from "@/lib/ai-catalogue";
import AiComponentsBody from "./AiComponentsBody";

export default async function Layout({ children }) {
  const { totals } = await getAiCatalogue();

  return (
    <div className="h-fit w-full text-foreground">
      <AiComponentsBody
        stats={[
          [totals.effects, "Effects"],
          [totals.free, "Free"],
          [totals.pro, "Pro"],
          [totals.categories, "Categories"],
          [totals.templates, "Templates"],
        ]}
      >
        {children}
      </AiComponentsBody>
    </div>
  );
}

import { getAllPrivateEffects } from "@/lib/registry";

export const metadata = {
  title: "All Demo Links (Test)",
  robots: { index: false, follow: false },
};

function groupByCategory(effects) {
  const groups = {};

  for (const effect of effects) {
    const category = effect.categorySlug || effect.category || "other";
    if (!groups[category]) groups[category] = [];
    groups[category].push(effect);
  }

  for (const category of Object.keys(groups)) {
    groups[category].sort((a, b) =>
      (a.title || a.name).localeCompare(b.title || b.name)
    );
  }

  return groups;
}

export default function TestDemosPage() {
  const effects = getAllPrivateEffects();
  const groups = groupByCategory(effects);
  const categories = Object.keys(groups).sort();

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold md:text-4xl">
          All Demo Links
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {effects.length} effects across {categories.length} categories -
          every link opens in a new tab.
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="text-lg font-medium uppercase tracking-wide text-white/70">
                {category}{" "}
                <span className="text-white/40">
                  ({groups[category].length})
                </span>
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {groups[category].map((effect) => (
                  <li key={effect.name}>
                    <a
                      href={effect.previewUrl || `/demo/${effect.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate rounded-md px-2 py-1.5 text-sm text-white/80 underline-offset-4 hover:bg-white/5 hover:text-white hover:underline"
                    >
                      {effect.title || effect.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

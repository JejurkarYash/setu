const features = [
  {
    title: "Unified access",
    description: "Connect your applications to multiple AI providers through one consistent interface.",
  },
  {
    title: "Clear observability",
    description: "Understand requests, latency, errors, and usage before they become production surprises.",
  },
  {
    title: "Spend control",
    description: "Track model costs by project and make informed decisions as your usage grows.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand">
            Everything in one place
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            The infrastructure layer for your AI products.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-3 leading-7 text-text-secondary">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

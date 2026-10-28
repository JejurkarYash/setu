import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="rounded-2xl border border-brand/30 bg-brand-muted/30 px-6 py-16 text-center sm:px-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to build on a stronger foundation?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-secondary">
          Start exploring your AI infrastructure with Setu.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-brand px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-brand-hover"
        >
          Open dashboard
        </Link>
      </div>
    </section>
  );
}

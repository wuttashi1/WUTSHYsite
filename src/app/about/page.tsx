import { getSiteSettings } from "@/lib/queries";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata = {
  title: "About — WUTSHY",
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const { about, faq } = settings.content;

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-black/40">
              {about.label}
            </span>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              {about.title}
            </h1>
            <p className="mt-6 leading-relaxed text-black/60">{about.paragraph_1}</p>
            <p className="mt-4 leading-relaxed text-black/60">{about.paragraph_2}</p>
          </div>

          <div>
            <SectionHeader label={faq.label} title={faq.title} />
            <div className="divide-y divide-black/10">
              {faq.items.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer items-center justify-between font-medium transition-colors hover:text-black/70">
                    {item.question}
                    <span className="ml-4 text-black/30 transition-transform group-open:rotate-180">
                      ↓
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-black/50">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

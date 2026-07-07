interface LegalDocumentProps {
  title: string;
  body: string;
}

export function LegalDocument({ title, body }: LegalDocumentProps) {
  const paragraphs = body.split(/\n\n+/).filter(Boolean);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-black/65 md:text-base">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

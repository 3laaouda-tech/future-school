const values = [
  { icon: "🌟", title: "Curiosity first", text: "Questions matter more than perfect answers." },
  { icon: "🤝", title: "Community", text: "Teachers, families, and students grow together." },
  { icon: "🌤️", title: "Joy in learning", text: "A happy classroom is where real learning happens." },
];

export default function About() {
  return (
    <>
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-12 text-center">
        <p className="font-body text-sm font-bold uppercase tracking-wide text-coral">
          About us
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          A school built around every child's story
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-ink/70">
          Future School started with a simple idea: children learn best when
          they feel safe, seen, and curious. Today, we carry that same idea
          into every classroom, every day.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-marigold/20 text-2xl">
                {value.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {value.title}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/70">{value.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

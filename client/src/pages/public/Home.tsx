import { Link } from "react-router-dom";

const journeyStops = [
  { icon: "🌱", label: "Early Years" },
  { icon: "📚", label: "Primary" },
  { icon: "🎨", label: "Secondary" },
  { icon: "🚀", label: "Bright Future" },
];

const features = [
  {
    icon: "❤️",
    title: "Caring Teachers",
    text: "Every child is known by name, and taught at their own pace.",
  },
  {
    icon: "🧩",
    title: "Hands-on Learning",
    text: "We learn by doing — projects, experiments, and real curiosity.",
  },
  {
    icon: "🏡",
    title: "Safe & Happy Campus",
    text: "A warm, welcoming place where kids look forward to their day.",
  },
];

const stats = [
  { value: "500+", label: "Students" },
  { value: "40+", label: "Teachers" },
  { value: "15", label: "Years of care" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-body text-sm font-bold tracking-wide text-coral uppercase">
              Welcome to Future School
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
              We grow today's curiosity into tomorrow's confidence.
            </h1>
            <p className="mt-4 max-w-md font-body text-ink/70">
              From first steps to big dreams, Future School walks with every
              child through a joyful, hands-on learning journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink shadow-sm transition-transform hover:scale-105"
              >
                Log in to your account
              </Link>
              <Link
                to="/contact"
                className="rounded-full border-2 border-ink/10 bg-white px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105"
              >
                Get in touch
              </Link>
            </div>
          </div>

          {/* Signature element: the learning journey path */}
          <div className="rounded-3xl bg-white/60 p-8">
            <p className="mb-6 font-body text-sm font-bold text-ink/60">
              Your child's journey with us
            </p>
            <div className="flex items-end justify-between">
              {journeyStops.map((stop, i) => (
                <div key={stop.label} className="flex flex-col items-center">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full bg-sun-cream text-2xl shadow-sm ${
                      i % 2 === 1 ? "mb-4" : ""
                    }`}
                  >
                    {stop.icon}
                  </div>
                  <p className="mt-2 w-16 text-center font-body text-xs font-semibold text-ink/70">
                    {stop.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t-2 border-dashed border-ink/20" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white/60">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-6 px-6 py-10 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-semibold text-sky-teal">
                {stat.value}
              </p>
              <p className="font-body text-sm text-ink/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center font-display text-3xl font-semibold text-ink">
          Why families choose us
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl bg-white p-8 shadow-sm transition-transform hover:-translate-y-1"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/20 text-2xl">
                {feature.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 font-body text-sm text-ink/70">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-coral px-8 py-12 text-center text-white">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Ready to join our family?
          </h2>
          <p className="mt-2 font-body text-white/90">
            Reach out and let's talk about your child's next chapter.
          </p>
          <Link
            to="/contact"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-body font-bold text-coral transition-transform hover:scale-105"
          >
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}

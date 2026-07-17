export default function Contact() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="text-center">
        <p className="font-body text-sm font-bold uppercase tracking-wide text-coral">
          Contact us
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink">
          We'd love to hear from you
        </h1>
        <p className="mt-4 font-body text-ink/70">
          Questions about admissions or daily life at school? Reach out any time.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl bg-white p-8 shadow-sm">
          <div>
            <p className="font-body text-sm font-bold text-ink/50">Email</p>
            <p className="font-body text-ink">hello@futureschool.edu</p>
          </div>
          <div>
            <p className="font-body text-sm font-bold text-ink/50">Phone</p>
            <p className="font-body text-ink">+962 6 000 0000</p>
          </div>
          <div>
            <p className="font-body text-sm font-bold text-ink/50">Address</p>
            <p className="font-body text-ink">Amman, Jordan</p>
          </div>
        </div>

        {/* Note: not wired to the backend yet — just the UI for now */}
        <form className="space-y-4 rounded-3xl bg-white p-8 shadow-sm">
          <div>
            <label htmlFor="name" className="font-body text-sm font-semibold text-ink/70">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="font-body text-sm font-semibold text-ink/70">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            />
          </div>
          <div>
            <label htmlFor="message" className="font-body text-sm font-semibold text-ink/70">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              className="mt-1 w-full rounded-xl border border-ink/10 bg-sun-cream px-4 py-2 font-body"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-full bg-marigold px-6 py-3 font-body font-bold text-ink transition-transform hover:scale-105"
          >
            Send message
          </button>
        </form>
      </div>
    </section>
  );
}

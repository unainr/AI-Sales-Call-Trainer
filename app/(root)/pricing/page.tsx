// app/pricing/page.tsx
import { PricingTable } from "@clerk/nextjs"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

const PricingPage = async () => {
  return (
    <main className="min-h-screen ">

      {/* ── Full-width Banner ── */}
      <div
        className="relative overflow-hidden px-6 pt-12 pb-10"
        style={{ background: "linear-gradient(135deg,#1a0505 0%,#3b0a0a 50%,#1a0808 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(239,68,68,.45),transparent 70%)" }} />
        <div className="absolute -bottom-12 left-1/4 w-72 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(220,38,38,.2),transparent 70%)" }} />
        <div className="absolute top-6 -left-10 w-44 h-44 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(248,113,113,.15),transparent 70%)" }} />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-4 text-center my-7">
         

          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white/60 border border-white/10">
            Pricing
          </span>

          <h1
            className="text-[36px] text-white leading-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Level up your sales game
          </h1>

          <p className="text-[13px] text-white/35 max-w-sm leading-relaxed">
            Practice with an AI prospect. Get honest feedback after every call.
            Close more deals.
          </p>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col gap-10">

        <PricingTable />

        {/* FAQ */}
        <div className="max-w-xl mx-auto w-full flex flex-col gap-3 pb-10">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 text-center mb-1">
            FAQ
          </p>
          {[
            {
              q: "What counts as a call?",
              a: "Every session you start with the AI prospect counts as one call, regardless of how long it lasts.",
            },
            {
              q: "What happens when I hit my limit?",
              a: "You'll be prompted to upgrade. All your existing sessions and feedback are always kept — nothing is ever deleted.",
            },
            {
              q: "What counts as an agent?",
              a: "Each unique configuration you create (product + industry + role + goal) is one agent.",
            },
            {
              q: "Can I cancel anytime?",
              a: "Yes. Cancel from your profile settings. You keep full access until the end of your billing period.",
            },
            {
              q: "What payment methods are accepted?",
              a: "All major credit and debit cards via Stripe. Checkout is handled securely by Clerk.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-2xl p-5 bg-white dark:bg-zinc-900 ring-1 ring-black/6 dark:ring-white/6"
            >
              <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">{q}</p>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}

export default PricingPage
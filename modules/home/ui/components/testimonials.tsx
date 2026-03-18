"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

const testimonials = [
  {
    quote: "VoxCloser completely changed how our team communicates. We close deals 40% faster.",
    author: "Sarah Lee",
    role: "VP of Sales, TechCorp"
  },
  {
    quote: "Incredible voice recognition and speed. It feels like having a dedicated AI assistant on every call.",
    author: "James Carter",
    role: "Founder, StartupX"
  },
  {
    quote: "The cleanest AI voice tool we’ve used. The integrations and response times are simply unmatched.",
    author: "Emily Watson",
    role: "RevOps Manager, Acme Inc."
  }
]

export function Testimonials() {
  return (
    <section className="relative py-32 bg-background overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute bottom-0 right-0 w-200 h-100 bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 space-y-20">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Loved by <span className="text-red-600 dark:text-red-500">Sales Teams</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Don't just take our word for it—hear from the professionals building their success with VoxCloser.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-linear-to-br from-red-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
              
              <div className="relative h-full bg-card/40 backdrop-blur-sm border border-border/50 group-hover:border-red-500/30 rounded-3xl p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <Quote className="w-10 h-10 text-red-500/20 mb-6 group-hover:text-red-500/40 transition-colors" />
                
                <p className="text-lg leading-relaxed text-foreground/90 font-medium mb-8">
                  "{t.quote}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-red-400 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold">{t.author}</h4>
                    <p className="text-sm text-red-600/80 dark:text-red-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

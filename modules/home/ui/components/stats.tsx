"use client"

import { motion } from "framer-motion"

const stats = [
  { number: "50K+", label: "Active Users" },
  { number: "1M+", label: "Messages Processed" },
  { number: "99.9%", label: "Uptime" },
  { number: "120+", label: "Countries" }
]

export function StatsSection() {
  return (
    <section className="relative py-24 bg-red-600 dark:bg-red-900 border-y border-red-500/20 overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-linear-to-r from-red-400 to-transparent blur-3xl transform -skew-x-12" />
        <div className="absolute top-0 -right-1/4 w-1/2 h-full bg-linear-to-l from-red-800 to-transparent blur-3xl transform skew-x-12" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center divide-x-0 md:divide-x divide-red-400/30">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-2"
            >
              <h4 className="text-4xl md:text-5xl font-black text-white drop-shadow-md tracking-tighter">
                {stat.number}
              </h4>
              <p className="text-red-100/80 font-medium tracking-wide text-sm uppercase md:text-base">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

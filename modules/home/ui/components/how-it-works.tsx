"use client"

import { motion } from "framer-motion"
import { Mic, Brain, Reply } from "lucide-react"

const steps = [
  {
    title: "Record with VoxCloser",
    desc: "Capture voice instantly with crystal clear audio processing.",
    icon: Mic
  },
  {
    title: "AI Analysis",
    desc: "Our neural networks analyze the intent, emotion, and context.",
    icon: Brain
  },
  {
    title: "Smart Response",
    desc: "Receive intelligent, high-converting replies in milliseconds.",
    icon: Reply
  }
]

export function HowItWorks() {
  return (
    <section className="relative mb-20  bg-zinc-50 dark:bg-zinc-950/50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container relative z-10 mx-auto px-4 space-y-20">

        <div className="text-center space-y-6 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            How <span className="text-red-600 dark:text-red-500">VoxCloser</span> Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            A seamless three-step process to elevate your sales communication from standard to exceptional.
          </motion.p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-18 left-[15%] right-[15%] h-0.5 bg-linear-to-r from-red-500/20 via-red-500 to-red-500/20" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative text-center space-y-6 group"
              >
                {/* Step Number Badge */}
                <div className="absolute lg:-top-6 lg:-right-4 right-0 -top-4 text-[120px] font-black leading-none text-red-500/5 dark:text-red-500/10 -z-10 group-hover:text-red-500/10 dark:group-hover:text-red-500/20 transition-colors duration-500 pointer-events-none">
                  {i + 1}
                </div>

                {/* Icon Container */}
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  <div className="relative w-full h-full rounded-2xl bg-background border-2 border-red-500/20 flex items-center justify-center shadow-lg group-hover:border-red-500/50 group-hover:-translate-y-1 transition-all duration-300">
                    <Icon className="w-10 h-10 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-2xl tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto text-[15px]">
                    {step.desc}
                  </p>
                </div>

              </motion.div>
            )
          })}

        </div>

      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Mic, Zap, Shield, MessageSquare, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Mic,
    title: "Voice Capture",
    desc: "Capture and process voice input with high accuracy."
  },
  {
    icon: Zap,
    title: "Fast Processing",
    desc: "Lightning fast responses powered by modern AI."
  },
  {
    icon: Shield,
    title: "Secure Conversations",
    desc: "End-to-end privacy and encrypted communication."
  },
  {
    icon: MessageSquare,
    title: "Smart Replies",
    desc: "Generate contextual replies instantly."
  }
]

export function FeaturesSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 bg-red-500/10 dark:bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 space-y-20">
        
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium tracking-wide"
          >
            <Sparkles className="w-4 h-4" />
            Advanced Capabilities
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Powerful Features for <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 to-rose-400 dark:from-red-500 dark:to-red-500">Winning Sales</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground"
          >
            Everything you need to communicate smarter, close deals faster, and understand your clients better than ever before.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, type: "spring", bounce: 0.4 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-linear-to-b from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" />
                
                <div className="relative h-full bg-card/40 backdrop-blur-xl border border-border/50 group-hover:border-red-500/50 rounded-3xl p-8 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all duration-500 flex flex-col items-start gap-6">
                  
                  <div className="p-4 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>

                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

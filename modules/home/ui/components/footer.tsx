import Image from "next/image"
import Link from "next/link"
import { Twitter, Linkedin, Github, ArrowUpRight, MapPin, Mail, Phone } from "lucide-react"

const currentYear = new Date().getFullYear()

export const Footer = () => {
  return (
    <footer className="relative  pt-20 md:pt-24 pb-10 md:pb-12 overflow-hidden border-t border-red-500/20">

      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-100 md:w-125 h-100 md:h-125 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-112.5 md:w-150 h-100 md:h-125 bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4">

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16 md:mb-20">

          {/* Brand */}
          <div className="space-y-5 lg:max-w-xs">
            <div className="flex items-center gap-2">
              {/* Dark mode: logo.svg | Light mode: logo1.svg */}
              <Image
                src="/logo.svg"
                alt="VoxCloser"
                width={120}
                height={36}
                className="dark:block hidden"
                priority
              />
              <Image
                src="/logo1.svg"
                alt="VoxCloser"
                width={120}
                height={36}
                className="block dark:hidden"
                priority
              />
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Elevating sales communication through intelligent voice capture and AI-powered conversations.
            </p>

            
          </div>

          {/* Platform */}
          <div className="space-y-5">
            <h4 className="text-base md:text-lg font-semibold">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: "Home",    href: "/" },
                { label: "New Call", href: "/new-call" },
                { label: "Pricing", href: "/pricing" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-zinc-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    {item.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-5">
            <h4 className="text-base md:text-lg font-semibold">Resources</h4>
            <ul className="space-y-3">
              {["Documentation", "API Reference", "Blog", "Help Center"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-zinc-400 hover:text-red-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    {item}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h4 className="text-base md:text-lg font-semibold">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-zinc-400 text-sm">
                <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                <span>San Francisco, CA</span>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <a href="mailto:hello@voxcloser.com" className="hover:text-white transition-colors">
                  hello@voxcloser.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-zinc-400 text-sm">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <a href="tel:+15551234567" className="hover:text-white transition-colors">
                  +1 (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
          <p className="text-zinc-500 text-xs md:text-sm">
            &copy; {currentYear} VoxCloser. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm">
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-zinc-500 hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>

        <div className="mt-6 text-end text-[10px] text-zinc-300 tracking-widest">
          built by <span className="opacity-60">unain</span>
        </div>

      </div>
    </footer>
  )
}
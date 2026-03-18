import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneIcon, Sparkle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const HomeHero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Spline background */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://my.spline.design/motiontrails-mQJiWP02BoJRJj7QScWZ8Yil/"
          width="100%"
          height="100%"
          className="h-full w-full border-0"
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col-reverse items-center gap-8 px-6 pt-12 text-center sm:px-10 md:flex-row md:items-center md:justify-between md:px-16 md:text-left">
        {/* Text Content */}
        <div className="max-w-2xl">
          <Badge
            variant="secondary"
            className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 italic"
          >
            <Sparkle data-icon="inline-start" />
            AI VOICE SALES TRAINING
          </Badge>

          <h1 className="mb-6 text-4xl text-white font-bold leading-tight lg:text-6xl">
            PRACTICE SALES CALLS
            <span className="block">WITH AI VOICE AGENTS</span>
          </h1>

          <p className="mb-10 max-w-xl text-base leading-relaxed">
            Create custom voice agents, choose voice personas, and run realistic
            sales calls in a live call interface. Get instant feedback after
            every conversation to improve your closing skills.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4 md:justify-start">
            <Link href="/new-call">
              <Button size="lg" variant={"neon"} className="p-4 rounded-full">
                <PhoneIcon /> START A CALL
              </Button>
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative animate-pulse-scale transition-transform duration-500">
          <div className="relative h-70 w-52.5 sm:h-90 sm:w-67.5 lg:h-120 lg:w-90 xl:h-135 xl:w-101.25">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2812%29-AUzcUJl45XueiOf0D1t9cvkzHg1wce.png"
              alt="Gaming VR Headset"
              fill
              loading="lazy"
              className="object-contain transition-all duration-500"
              style={{
                filter:
                  "drop-shadow(0 0 50px rgba(239, 68, 68, 0.8)) drop-shadow(0 0 100px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 150px rgba(239, 68, 68, 0.4))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
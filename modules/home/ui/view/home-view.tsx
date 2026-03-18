import { CallForm } from "@/modules/calls/ui/components/call-form"
import { HomeHero } from "./home-hero"
import { FeaturesSection } from "../components/featured"
import { HowItWorks } from "../components/how-it-works"
import { StatsSection } from "../components/stats"
import { Testimonials } from "../components/testimonials"
import { Footer } from "../components/footer"

export const HomeView = () => {
  return (
   <>
   <HomeHero/>
   <FeaturesSection/>
   <HowItWorks/>
   <StatsSection/>
   <Testimonials/>
   </>
  )
}

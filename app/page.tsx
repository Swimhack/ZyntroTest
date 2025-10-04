import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import TrustBadges from '@/components/TrustBadges'
import Services from '@/components/Services'
import Process from '@/components/Process'
import Testimonial from '@/components/Testimonial'
import Compliance from '@/components/Compliance'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <TrustBadges />
      <Services />
      <Process />
      <Testimonial />
      <Compliance />
      <Footer />
    </main>
  )
}

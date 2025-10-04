'use client'

export default function Hero() {
  const handleRequestDemo = () => {
    // In a real app, this would open a modal or navigate to a demo request form
    console.log('Request Demo clicked')
  }

  const handleViewTests = () => {
    // In a real app, this would navigate to tests catalog
    console.log('View Tests clicked')
  }

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 md:py-24 lg:py-32" aria-labelledby="hero-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <h1 
            id="hero-heading" 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Modern Diagnostics Portal
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Streamline your laboratory operations with our comprehensive LIMS platform. 
            Test catalog, sample tracking, and secure result delivery — all in one place.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA */}
            <button
              onClick={handleRequestDemo}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all transform hover:scale-105"
              aria-label="Request a demo of ClarityLab Portal"
            >
              Request Demo
            </button>

            {/* Secondary CTA */}
            <button
              onClick={handleViewTests}
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg shadow-md border-2 border-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all"
              aria-label="View available tests"
            >
              View Tests
            </button>
          </div>

          {/* Additional value proposition */}
          <p className="mt-8 text-sm text-gray-500">
            Trusted by diagnostic laboratories nationwide
          </p>
        </div>
      </div>
    </section>
  )
}

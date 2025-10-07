export default function Compliance() {
  const certifications = [
    {
      name: 'CLIA Certified',
      description: 'Clinical Laboratory Improvement Amendments',
    },
    {
      name: 'CAP Accredited',
      description: 'College of American Pathologists',
    },
    {
      name: 'HIPAA Compliant',
      description: 'Health Insurance Portability and Accountability Act',
    },
  ]

  return (
    <section className="py-12 bg-gray-900 text-white" aria-label="Compliance and certifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Certified & Compliant
          </h2>
          <p className="text-gray-300">
            Meeting the highest standards in laboratory diagnostics
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {certifications.map((cert, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center px-4 py-4"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary-600 flex items-center justify-center mb-3">
                <svg
                  className="w-8 h-8 md:w-10 md:h-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="font-semibold text-lg mb-1">{cert.name}</p>
              <p className="text-sm text-gray-400">{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Process() {
  const steps = [
    {
      number: '01',
      title: 'Order Placement',
      description: 'Healthcare providers submit test orders through our secure portal with patient information and test selections.',
    },
    {
      number: '02',
      title: 'Sample Processing',
      description: 'Samples are tracked in real-time through collection, transport, and analysis with automated updates at each stage.',
    },
    {
      number: '03',
      title: 'Results Delivery',
      description: 'Certified results are delivered securely via encrypted PDF with instant notifications to authorized recipients.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-white" aria-labelledby="process-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 id="process-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A streamlined workflow designed for efficiency and accuracy
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (desktop only) */}
              {index < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-primary-200"
                  style={{ transform: 'translateX(-50%)' }}
                  aria-hidden="true"
                />
              )}

              {/* Step Card */}
              <article className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 text-white text-2xl font-bold mb-6">
                  {step.number}
                </div>

                {/* Step Content */}
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

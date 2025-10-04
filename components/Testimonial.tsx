export default function Testimonial() {
  return (
    <section className="py-16 md:py-24 bg-white" aria-label="Customer testimonial">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-8 md:p-12 lg:p-16 text-white">
          {/* Quote Icon */}
          <svg
            className="w-12 h-12 md:w-16 md:h-16 text-primary-200 mb-6"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>

          {/* Testimonial Text */}
          <blockquote className="mb-8">
            <p className="text-xl md:text-2xl leading-relaxed font-medium mb-6">
              ClarityLab transformed our laboratory operations. The intuitive interface and real-time tracking 
              have significantly improved our turnaround times and client satisfaction. It&apos;s exactly what modern 
              diagnostics labs need.
            </p>
          </blockquote>

          {/* Author Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-primary-200 flex items-center justify-center">
                <span className="text-primary-700 text-xl font-bold" aria-hidden="true">DR</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-lg">Dr. Rebecca Martinez</p>
              <p className="text-primary-100">Laboratory Director, MedPath Diagnostics</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

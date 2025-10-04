export default function TrustBadges() {
  const badges = [
    { name: 'ISO Certified', icon: '✓' },
    { name: 'HIPAA Compliant', icon: '🔒' },
    { name: 'Cloud Secure', icon: '☁️' },
    { name: '24/7 Support', icon: '🛟' },
  ]

  return (
    <section className="bg-gray-50 py-12" aria-label="Trust badges">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-2" aria-hidden="true">{badge.icon}</div>
              <p className="text-sm md:text-base font-medium text-gray-700 text-center">
                {badge.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"

export default function NotFoundPage() {
  return (
    <div className="container mx-auto px-5 py-16">
      <div className="mx-auto max-w-lg rounded-lg border-l-4 border-red-500 bg-[#1a1a1a] p-8 text-center">
        <div className="mb-4 text-6xl text-red-400">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-white">404 - Not Found</h1>
        <p className="mb-6 text-gray-300">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center rounded bg-gradient-to-r from-[#00ff9d] to-[#00b8ff] px-6 py-3 font-semibold text-[#050505] transition-all hover:shadow-lg hover:shadow-[#00ff9d]/20"
        >
          <i className="fas fa-home mr-2"></i> Return Home
        </Link>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#ff3e3e] mx-auto mb-4"></div>
        <p className="text-white">Loading gateway...</p>
      </div>
    </div>
  )
}

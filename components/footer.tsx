export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#030303] py-6">
      <div className="container mx-auto px-5">
        <div className="text-center">
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} NEXUS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

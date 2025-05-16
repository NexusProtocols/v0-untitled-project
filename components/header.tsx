"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState, useRef } from "react"
import { usePathname } from "next/navigation"

export default function Header() {
  const { user, logout } = useAuth()
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLLIElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  // Check for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // List of admin usernames
  const adminUsernames = ["admin", "owner", "nexus", "volt", "Nexus", "Voltrex", "Furky", "Ocean"]

  useEffect(() => {
    if (user) {
      // Load user profile picture if available
      const userProfileData = localStorage.getItem(`nexus_profile_${user.username}`)
      if (userProfileData) {
        const parsedProfile = JSON.parse(userProfileData)
        setProfilePicture(parsedProfile.profilePicture || null)
      }

      // Check if user is admin
      const isUserAdmin = adminUsernames.includes(user.username)
      setUserIsAdmin(isUserAdmin)
    } else {
      // Check for admin token in localStorage
      const adminToken = localStorage.getItem(
        "nexus_admin_token_Do_Not_Share_Leave_Console_Do_Not_Copy----_____-----3258ujaefhih328v6ha fhhag nFB@&F WDHB G#T*&HAF< #GQY* AKJFEB@*F ASLQ#*R(sdfb3ut93",
      )
      if (adminToken) {
        setUserIsAdmin(true)
      }
    }
  }, [user])

  // Handle dropdown mouse events with delay
  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
      dropdownTimeoutRef.current = null
    }
    setDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false)
    }, 300) // 300ms delay before closing
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  // Check if a nav item is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030303]/90 py-4 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-5">
        <Link href="/" className="flex items-center text-3xl font-bold tracking-tighter text-[#ff3e3e]">
          NEXUS<span className="text-white">.</span>
        </Link>

        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-full bg-[rgba(255,62,62,0.1)] text-[#ff3e3e] transition-all hover:bg-[rgba(255,62,62,0.2)] hover:scale-110"
            aria-label="Toggle mobile menu"
          >
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
          </button>
        )}

        {/* Desktop Navigation */}
        <nav className={`${isMobile ? "hidden" : "block"}`}>
          <ul className="flex flex-wrap justify-center gap-2">
            <li>
              <Link
                href="/"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/") ? "text-[#ff3e3e]" : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-home mr-2"></i> Home
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/scripts"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/scripts")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-code mr-2"></i> Scripts
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/scripts") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/key-generator"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/key-generator")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-key mr-2"></i> Key
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/key-generator") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <a
                href="https://discord.gg/ZWCqcuxAv3"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
              >
                <i className="fab fa-discord mr-2 text-[#5865F2]"></i> Discord
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 group-hover:w-full`}
                ></span>
              </a>
            </li>
            <li>
              <Link
                href="/premium-key"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/premium-key")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-crown mr-2"></i> Premium Key
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/premium-key") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/executors"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/executors")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-terminal mr-2"></i> Executors
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/executors") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/submit-script"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/submit-script")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-upload mr-2"></i> Submit Script
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/submit-script") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/roblox-client-example"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/roblox-client-example")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-file-code mr-2"></i> Client Example
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/roblox-client-example") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            {userIsAdmin && (
              <li>
                <Link
                  href="/upload-keys"
                  className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                    ${
                      isActive("/upload-keys")
                        ? "text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                >
                  <i className="fas fa-upload mr-2"></i> Upload Keys
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/upload-keys") ? "w-full" : "group-hover:w-full"}`}
                  ></span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/support"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/support")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-question-circle mr-2"></i> Support
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/support") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/manage-gateways"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/manage-gateways")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-cog mr-2"></i> Manage Gateways
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/manage-gateways") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            <li>
              <Link
                href="/create-gateway"
                className={`nav-item flex items-center rounded px-5 py-2.5 text-sm font-medium transition-all relative group
                  ${
                    isActive("/create-gateway")
                      ? "text-[#ff3e3e]"
                      : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                  }`}
              >
                <i className="fas fa-plus-circle mr-2"></i> Create Gateway
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-[#ff3e3e] transition-all duration-300 ${isActive("/create-gateway") ? "w-full" : "group-hover:w-full"}`}
                ></span>
              </Link>
            </li>
            {user ? (
              <li
                ref={dropdownRef}
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="nav-item flex items-center gap-2 rounded px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[rgba(255,62,62,0.1)]">
                  {profilePicture ? (
                    <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-[#ff3e3e]/30">
                      <img
                        src={profilePicture || "/placeholder.svg"}
                        alt={user.username}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#ff3e3e] border-2 border-[#ff3e3e]/30 shadow-md">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.username}</span>
                  <i className="fas fa-chevron-down ml-1 text-xs"></i>
                </button>
                <div
                  className={`dropdown-animation absolute right-0 top-full z-50 mt-1 min-w-[200px] rounded border border-white/10 bg-[#030303] py-1 shadow-lg ${
                    dropdownOpen ? "block" : "hidden"
                  }`}
                >
                  <Link
                    href={`/profile/${user.username}`}
                    className={`nav-item flex w-full items-center px-4 py-2 text-left text-sm hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e] ${isActive(`/profile/${user.username}`) ? "text-[#ff3e3e]" : "text-white"}`}
                  >
                    <i className="fas fa-user mr-2"></i> My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className={`nav-item flex w-full items-center px-4 py-2 text-left text-sm hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e] ${isActive("/settings") ? "text-[#ff3e3e]" : "text-white"}`}
                  >
                    <i className="fas fa-cog mr-2"></i> Settings
                  </Link>
                  <Link
                    href="/upload-scripts"
                    className={`nav-item flex w-full items-center px-4 py-2 text-left text-sm hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e] ${isActive("/upload-scripts") ? "text-[#ff3e3e]" : "text-white"}`}
                  >
                    <i className="fas fa-upload mr-2"></i> Upload Scripts
                  </Link>
                  {userIsAdmin && (
                    <Link
                      href="/admin-dashboard"
                      className={`nav-item flex w-full items-center px-4 py-2 text-left text-sm hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e] ${isActive("/admin-dashboard") ? "text-[#ff3e3e]" : "text-white"}`}
                    >
                      <i className="fas fa-shield-alt mr-2"></i> Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="nav-item flex w-full items-center px-4 py-2 text-left text-sm text-white hover:bg-[rgba(255,0,0,0.1)] hover:text-red-400"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                  </button>
                </div>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className={`nav-item button-glow flex items-center rounded border border-[#ff3e3e] bg-[rgba(255,62,62,0.1)] px-5 py-2.5 text-sm font-medium transition-all ${isActive("/login") ? "text-[#ff3e3e] border-[#ff3e3e]" : "text-[#ff3e3e] hover:bg-[rgba(255,62,62,0.2)]"}`}
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i> Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className={`nav-item button-glow flex items-center rounded border border-[#ff3e3e] bg-[rgba(255,62,62,0.1)] px-5 py-2.5 text-sm font-medium transition-all ${isActive("/signup") ? "text-[#ff3e3e] border-[#ff3e3e]" : "text-[#ff3e3e] hover:bg-[rgba(255,62,62,0.2)]"}`}
                  >
                    <i className="fas fa-user-plus mr-2"></i> Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation Sidebar */}
        {isMobile && (
          <div
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-screen w-72 bg-[#0a0a0a] shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
              mobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ paddingTop: "72px" }}
          >
            <div className="h-full overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-[#ff3e3e] scrollbar-track-[#1a1a1a]">
              <ul className="space-y-1 px-3">
                <li>
                  <Link
                    href="/"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-home mr-3 w-5 text-center"></i> Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/scripts"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/scripts")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-code mr-3 w-5 text-center"></i> Scripts
                  </Link>
                </li>
                <li>
                  <Link
                    href="/key-generator"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/key-generator")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-key mr-3 w-5 text-center"></i> Key Generator
                  </Link>
                </li>
                <li>
                  <a
                    href="https://discord.gg/ZWCqcuxAv3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      false
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fab fa-discord mr-3 w-5 text-center text-[#5865F2]"></i> Discord
                  </a>
                </li>
                <li>
                  <Link
                    href="/premium-key"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/premium-key")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-crown mr-3 w-5 text-center"></i> Premium Key
                  </Link>
                </li>
                <li>
                  <Link
                    href="/executors"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/executors")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-terminal mr-3 w-5 text-center"></i> Executors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submit-script"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/submit-script")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-upload mr-3 w-5 text-center"></i> Submit Script
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roblox-client-example"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/roblox-client-example")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-file-code mr-3 w-5 text-center"></i> Client Example
                  </Link>
                </li>
                {userIsAdmin && (
                  <li>
                    <Link
                      href="/upload-keys"
                      className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                        isActive("/upload-keys")
                          ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                          : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                      }`}
                    >
                      <i className="fas fa-upload mr-3 w-5 text-center"></i> Upload Keys
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/support"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/support")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-question-circle mr-3 w-5 text-center"></i> Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manage-gateways"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/manage-gateways")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-cog mr-3 w-5 text-center"></i> Manage Gateways
                  </Link>
                </li>
                <li>
                  <Link
                    href="/create-gateway"
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                      isActive("/create-gateway")
                        ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                        : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                    }`}
                  >
                    <i className="fas fa-plus-circle mr-3 w-5 text-center"></i> Create Gateway
                  </Link>
                </li>

                {user ? (
                  <>
                    <li className="border-t border-white/10 pt-2 mt-2">
                      <div className="flex items-center px-4 py-3">
                        {profilePicture ? (
                          <div className="h-10 w-10 overflow-hidden rounded-full mr-3 border-2 border-[#ff3e3e]/30">
                            <img
                              src={profilePicture || "/placeholder.svg"}
                              alt={user.username}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a1a1a] text-[#ff3e3e] mr-3 border-2 border-[#ff3e3e]/30 shadow-md">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-white font-medium">{user.username}</span>
                      </div>
                    </li>
                    <li>
                      <Link
                        href={`/profile/${user.username}`}
                        className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                          isActive(`/profile/${user.username}`)
                            ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                            : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                        }`}
                      >
                        <i className="fas fa-user mr-3 w-5 text-center"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                          isActive("/settings")
                            ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                            : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                        }`}
                      >
                        <i className="fas fa-cog mr-3 w-5 text-center"></i> Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/upload-scripts"
                        className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                          isActive("/upload-scripts")
                            ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                            : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                        }`}
                      >
                        <i className="fas fa-upload mr-3 w-5 text-center"></i> Upload Scripts
                      </Link>
                    </li>
                    {userIsAdmin && (
                      <li>
                        <Link
                          href="/admin-dashboard"
                          className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all transform hover:scale-105 ${
                            isActive("/admin-dashboard")
                              ? "bg-[rgba(255,62,62,0.15)] text-[#ff3e3e]"
                              : "text-white hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                          }`}
                        >
                          <i className="fas fa-shield-alt mr-3 w-5 text-center"></i> Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li className="px-3 pt-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all transform hover:scale-105 hover:bg-[rgba(255,0,0,0.1)] hover:text-red-400"
                      >
                        <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="border-t border-white/10 pt-2 mt-2">
                      <Link
                        href="/login"
                        className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all transform hover:scale-105 hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                      >
                        <i className="fas fa-sign-in-alt mr-3 w-5 text-center"></i> Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/signup"
                        className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-white transition-all transform hover:scale-105 hover:bg-[rgba(255,62,62,0.1)] hover:text-[#ff3e3e]"
                      >
                        <i className="fas fa-user-plus mr-3 w-5 text-center"></i> Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Add a semi-transparent overlay when mobile menu is open */}
        {mobileMenuOpen && isMobile && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)} />
        )}
      </div>
    </header>
  )
}

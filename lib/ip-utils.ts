// Utility function to fetch the user's IP address
export async function getUserIP(): Promise<string | null> {
  try {
    // Use a public API to get the user's IP address
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error("Error fetching IP address:", error)
    return null
  }
}

// Function to store the user's IP in their profile
export async function storeUserIP(username: string): Promise<void> {
  try {
    const ip = await getUserIP()
    if (!ip) return

    // Get the user data
    const userData = JSON.parse(localStorage.getItem(`nexus_user_${username}`) || "{}")

    // Update the IP address
    userData.ip = ip

    // Save back to localStorage
    localStorage.setItem(`nexus_user_${username}`, JSON.stringify(userData))

    // Also update the profile if it exists
    const profileData = localStorage.getItem(`nexus_profile_${username}`)
    if (profileData) {
      const profile = JSON.parse(profileData)
      profile.ip = ip
      localStorage.setItem(`nexus_profile_${username}`, JSON.stringify(profile))
    }
  } catch (error) {
    console.error("Error storing IP address:", error)
  }
}

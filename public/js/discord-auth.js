// Discord authentication helper functions

/**
 * Initiates Discord OAuth flow
 */
function linkDiscordAccount() {
  // Discord OAuth URL
  const discordAuthUrl =
    "https://discord.com/oauth2/authorize?client_id=1366950971334459484&redirect_uri=https%3A%2F%2Fv0-hi-sigma-fawn.vercel.app%2Fdiscord%2Fcallback&response_type=code&scope=identify%20guilds%20guilds.join%20email"

  // Open Discord authorization in a new window
  window.location.href = discordAuthUrl
}

/**
 * Processes Discord authentication code
 * @param {string} code - The authorization code from Discord
 * @returns {Promise<Object>} - Discord user data
 */
async function processDiscordAuth(code) {
  // In a real implementation, you would send this to your backend
  // For this demo, we'll simulate the process

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate Discord user data
        const discordUser = {
          id: "discord_" + Math.random().toString(36).substring(2, 10),
          username: "Discord_User_" + Math.floor(Math.random() * 1000),
          email: "discord_user@example.com",
          verified: true,
        }

        resolve(discordUser)
      } catch (error) {
        reject(error)
      }
    }, 1000)
  })
}

/**
 * Updates user profile with Discord data
 * @param {Object} discordUser - Discord user data
 */
function updateUserWithDiscordData(discordUser) {
  const currentUser = localStorage.getItem("nexus_current_user")

  if (!currentUser) {
    throw new Error("Not logged in")
  }

  // Update user data with Discord info
  const userData = JSON.parse(localStorage.getItem(`nexus_user_${currentUser}`) || "{}")
  userData.discord_id = discordUser.id
  userData.discord_username = discordUser.username
  localStorage.setItem(`nexus_user_${currentUser}`, JSON.stringify(userData))

  return true
}

export const validateScript = (code: string): string[] => {
  const errors: string[] = []

  // Check script length (now allowing up to 1000 lines)
  const lines = code.split("\n")
  if (lines.length > 1000) {
    errors.push(`Script is too long (${lines.length}/1000 lines)`)
  }

  // Check if script contains required keywords
  const requiredKeywords = ["loadstring", "local", "luarmor"]
  const hasRequiredKeyword = requiredKeywords.some((keyword) => code.toLowerCase().includes(keyword.toLowerCase()))

  if (!hasRequiredKeyword) {
    errors.push(`Script must contain at least one of the following keywords: ${requiredKeywords.join(", ")}`)
  }

  // Check for banned words
  const bannedWords = [
    "workink",
    "lootdest",
    "lootlabs",
    "linkvertise",
    "eval(",
    "Function(",
    "setTimeout(",
    "setInterval(",
    "document.cookie",
    "localStorage.setItem",
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase()

    // Skip comment lines
    if (line.startsWith("--")) continue

    // Check for banned words
    for (const word of bannedWords) {
      if (line.includes(word.toLowerCase())) {
        errors.push(`Line ${i + 1}: Contains banned word "${word}". Script is not allowed.`)
      }
    }

    // Check for raw links (http:// or https://)
    const hasLink = /https?:\/\/[^\s]+/.test(line)

    // If the line contains a link but no valid Lua keyword, reject the script
    if (hasLink && !/(loadstring|require|local|then|if)/.test(line)) {
      errors.push(
        `Line ${i + 1}: Contains a link without a valid keyword (loadstring, require, local, then, or if). Script is not allowed.`,
      )
    }

    // Check for potential XSS attacks
    if (line.includes("<script>") || line.includes("</script>") || line.includes("javascript:")) {
      errors.push(`Line ${i + 1}: Contains potentially malicious code. Script is not allowed.`)
    }
  }

  // Return any errors found
  return errors
}

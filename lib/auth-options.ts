import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Try to get user from database
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          })

          if (user && user.password === credentials.password) {
            // In production, use proper password hashing
            return {
              id: user.id,
              name: user.username,
              email: user.email,
            }
          }
        } catch (dbError) {
          console.error("Database error:", dbError)

          // Fallback to localStorage if database fails
          try {
            const userKey = `nexus_user_${credentials.username}`
            const userData = localStorage.getItem(userKey)

            if (userData) {
              const user = JSON.parse(userData)

              if (user.password === credentials.password) {
                return {
                  id: credentials.username,
                  name: credentials.username,
                  email: user.email,
                }
              }
            }
          } catch (error) {
            console.error("Error checking localStorage:", error)
          }
        }

        return null
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "nexus-secret-key",
}

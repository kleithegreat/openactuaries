import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export async function getRequiredServerSession() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  return session
}

export async function getServerSessionUser() {
  const session = await getServerSession(authOptions)
  return session?.user
} 
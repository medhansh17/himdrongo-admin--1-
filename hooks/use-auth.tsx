"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api-service"
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies"

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  admin: Admin | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!admin

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = getCookie("accessToken")
      if (!token) {
        setLoading(false)
        return
      }

      const response = await apiService.getProfile()
      setAdmin(response.data.admin)
    } catch (error) {
      // Token might be expired, try to refresh
      await tryRefreshToken()
    } finally {
      setLoading(false)
    }
  }

  const tryRefreshToken = async () => {
    try {
      const refreshToken = getCookie("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token")
      }

      const response = await apiService.refreshToken(refreshToken)
      setCookie("accessToken", response.data.accessToken)
      setCookie("refreshToken", response.data.refreshToken)

      // Get profile with new token
      const profileResponse = await apiService.getProfile()
      setAdmin(profileResponse.data.admin)
    } catch (error) {
      // Refresh failed, clear tokens
      deleteCookie("accessToken")
      deleteCookie("refreshToken")
      setAdmin(null)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)

      setCookie("accessToken", response.data.accessToken)
      setCookie("refreshToken", response.data.refreshToken)
      setAdmin(response.data.admin)

      router.push("/dashboard")
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed")
    }
  }

  const logout = async () => {
    try {
      const refreshToken = getCookie("refreshToken")
      if (refreshToken) {
        await apiService.logout(refreshToken)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      deleteCookie("accessToken")
      deleteCookie("refreshToken")
      setAdmin(null)
      router.push("/")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

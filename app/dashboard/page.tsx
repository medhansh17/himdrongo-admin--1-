"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiService } from "@/lib/api-service"
import { toast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import StatisticsCards from "@/components/statistics-cards"
import DriversList from "@/components/drivers-list"
import SearchBar from "@/components/search-bar"
import { Loader2 } from "lucide-react"

interface Statistics {
  totalDrivers: number
  completelyVerified: number
  pendingVerifications: {
    personalInfo: number
    personalDocuments: number
    vehicleDetails: number
    bankDetails: number
    emergencyDetails: number
  }
  verificationProgress: {
    completed: number
    pending: number
    completionRate: string
  }
}

interface PendingVerification {
  driverId: string
  phoneNumber: string
  firstName: string
  lastName: string
  createdAt: string
  pendingSections: {
    personalInfo: boolean
    personalDocuments: boolean
    vehicleDetails: boolean
    bankDetails: boolean
    emergencyDetails: boolean
  }
}

export default function DashboardPage() {
  const { admin, loading: authLoading } = useAuth()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [pendingDrivers, setPendingDrivers] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!authLoading && admin) {
      fetchDashboardData()
    }
  }, [authLoading, admin])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, pendingResponse] = await Promise.all([
        apiService.getStatistics(),
        apiService.getPendingVerifications(),
      ])

      setStatistics(statsResponse.data.statistics)
      setPendingDrivers(pendingResponse.data.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      fetchDashboardData()
      return
    }

    try {
      const response = await apiService.searchDrivers(query)
      const searchResults = response.data.data.drivers.map((driver: any) => ({
        driverId: driver.id,
        phoneNumber: driver.phoneNumber,
        firstName: driver.firstName,
        lastName: driver.lastName,
        createdAt: driver.createdAt,
        pendingSections: {
          personalInfo: !driver.personalInfoVerified,
          personalDocuments: !driver.personalDocsVerified,
          vehicleDetails: !driver.vehicleDetailsVerified,
          bankDetails: !driver.bankDetailsVerified,
          emergencyDetails: !driver.emergencyDetailsVerified,
        },
      }))
      setPendingDrivers(searchResults)
    } catch (error: any) {
      toast({
        title: "Search Error",
        description: error.message || "Failed to search drivers",
        variant: "destructive",
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader admin={admin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage driver verifications and monitor system statistics</p>
        </div>

        {statistics && <StatisticsCards statistics={statistics} />}

        <div className="mt-8">
          <div className="mb-6">
            <SearchBar onSearch={handleSearch} />
          </div>

          <DriversList
            drivers={pendingDrivers}
            title={searchQuery ? `Search Results (${pendingDrivers.length})` : "Pending Verifications"}
            onRefresh={fetchDashboardData}
          />
        </div>
      </main>
    </div>
  )
}

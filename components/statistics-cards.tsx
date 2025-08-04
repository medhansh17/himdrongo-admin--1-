"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface StatisticsCardsProps {
  statistics: {
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
}

export default function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const totalPending = Object.values(statistics.pendingVerifications).reduce((sum, count) => sum + count, 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalDrivers}</div>
          <p className="text-xs text-muted-foreground">Registered drivers in system</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified Drivers</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{statistics.completelyVerified}</div>
          <p className="text-xs text-muted-foreground">Completely verified drivers</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
          <Clock className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{statistics.verificationProgress.pending}</div>
          <p className="text-xs text-muted-foreground">Drivers awaiting verification</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{statistics.verificationProgress.completionRate}%</div>
          <p className="text-xs text-muted-foreground">Overall verification rate</p>
        </CardContent>
      </Card>
    </div>
  )
}

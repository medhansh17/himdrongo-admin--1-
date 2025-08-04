"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, User, Phone, Calendar, AlertCircle } from "lucide-react"

interface Driver {
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

interface DriversListProps {
  drivers: Driver[]
  title: string
  onRefresh: () => void
}

export default function DriversList({ drivers, title, onRefresh }: DriversListProps) {
  const router = useRouter()

  const getPendingCount = (pendingSections: Driver["pendingSections"]) => {
    return Object.values(pendingSections).filter(Boolean).length
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDriverClick = (driverId: string) => {
    router.push(`/driver/${driverId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            {title}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {drivers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No drivers found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drivers.map((driver) => {
              const pendingCount = getPendingCount(driver.pendingSections)

              return (
                <div
                  key={driver.driverId}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleDriverClick(driver.driverId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {driver.firstName} {driver.lastName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {driver.phoneNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(driver.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {driver.pendingSections.personalInfo && <Badge variant="secondary">Personal Info</Badge>}
                        {driver.pendingSections.personalDocuments && <Badge variant="secondary">Documents</Badge>}
                        {driver.pendingSections.vehicleDetails && <Badge variant="secondary">Vehicle</Badge>}
                        {driver.pendingSections.bankDetails && <Badge variant="secondary">Bank Details</Badge>}
                        {driver.pendingSections.emergencyDetails && <Badge variant="secondary">Emergency</Badge>}
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="destructive" className="mb-2">
                        {pendingCount} Pending
                      </Badge>
                      <div className="text-sm text-gray-500">Click to verify</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

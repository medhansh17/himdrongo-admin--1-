"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { apiService } from "@/lib/api-service"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, User, Phone, Mail, MapPin, Car, CreditCard, UserCheck } from "lucide-react"
import VerificationSection from "@/components/verification-section"

interface Driver {
  id: string
  phoneNumber: string
  firstName: string
  lastName: string
  email?: string
  address?: string
  personalInfoVerified: boolean
  personalDocsVerified: boolean
  vehicleDetailsVerified: boolean
  bankDetailsVerified: boolean
  emergencyDetailsVerified: boolean
  personalDocuments?: any
  vehicleDetails?: any
  bankDetails?: any
  emergencyDetails?: any
}

export default function DriverDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { admin } = useAuth()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)

  const driverId = params.id as string

  useEffect(() => {
    if (admin && driverId) {
      fetchDriverDetails()
    }
  }, [admin, driverId])

  const fetchDriverDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getDriverDetails(driverId)
      setDriver(response.data.driver)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch driver details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (section: string, verified: boolean, reason?: string) => {
    try {
      setVerifying(section)

      let response
      switch (section) {
        case "personalInfo":
          response = await apiService.verifyPersonalInfo(driverId, verified, reason)
          break
        case "personalDocuments":
          response = await apiService.verifyPersonalDocuments(driverId, {
            overallVerified: verified,
            reason,
          })
          break
        case "vehicleDetails":
          response = await apiService.verifyVehicleDetails(driverId, verified, reason)
          break
        case "bankDetails":
          response = await apiService.verifyBankDetails(driverId, verified, reason)
          break
        case "emergencyDetails":
          response = await apiService.verifyEmergencyDetails(driverId, verified, reason)
          break
        default:
          throw new Error("Invalid section")
      }

      toast({
        title: "Success",
        description: `${section} ${verified ? "verified" : "rejected"} successfully`,
      })

      // Refresh driver details
      await fetchDriverDetails()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      })
    } finally {
      setVerifying(null)
    }
  }

  const handleBulkVerification = async (verificationData: any) => {
    try {
      setVerifying("bulk")
      await apiService.verifyAll(driverId, verificationData)

      toast({
        title: "Success",
        description: "Bulk verification completed successfully",
      })

      await fetchDriverDetails()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Bulk verification failed",
        variant: "destructive",
      })
    } finally {
      setVerifying(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Driver Not Found</h2>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">
                  {driver.firstName} {driver.lastName}
                </h3>
                <div className="space-y-2 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {driver.phoneNumber}
                  </div>
                  {driver.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {driver.email}
                    </div>
                  )}
                  {driver.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {driver.address}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Verification Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Personal Info</span>
                    <Badge variant={driver.personalInfoVerified ? "default" : "destructive"}>
                      {driver.personalInfoVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Documents</span>
                    <Badge variant={driver.personalDocsVerified ? "default" : "destructive"}>
                      {driver.personalDocsVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vehicle</span>
                    <Badge variant={driver.vehicleDetailsVerified ? "default" : "destructive"}>
                      {driver.vehicleDetailsVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bank Details</span>
                    <Badge variant={driver.bankDetailsVerified ? "default" : "destructive"}>
                      {driver.bankDetailsVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Emergency</span>
                    <Badge variant={driver.emergencyDetailsVerified ? "default" : "destructive"}>
                      {driver.emergencyDetailsVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Sections */}
          <div className="lg:col-span-2 space-y-6">
            <VerificationSection
              title="Personal Information"
              icon={<User className="h-5 w-5" />}
              verified={driver.personalInfoVerified}
              data={{
                "First Name": driver.firstName,
                "Last Name": driver.lastName,
                "Phone Number": driver.phoneNumber,
                Email: driver.email || "Not provided",
                Address: driver.address || "Not provided",
              }}
              onVerify={(verified, reason) => handleVerification("personalInfo", verified, reason)}
              loading={verifying === "personalInfo"}
            />

            <VerificationSection
              title="Personal Documents"
              icon={<UserCheck className="h-5 w-5" />}
              verified={driver.personalDocsVerified}
              data={driver.personalDocuments || {}}
              onVerify={(verified, reason) => handleVerification("personalDocuments", verified, reason)}
              loading={verifying === "personalDocuments"}
            />

            <VerificationSection
              title="Vehicle Details"
              icon={<Car className="h-5 w-5" />}
              verified={driver.vehicleDetailsVerified}
              data={driver.vehicleDetails || {}}
              onVerify={(verified, reason) => handleVerification("vehicleDetails", verified, reason)}
              loading={verifying === "vehicleDetails"}
            />

            <VerificationSection
              title="Bank Details"
              icon={<CreditCard className="h-5 w-5" />}
              verified={driver.bankDetailsVerified}
              data={driver.bankDetails || {}}
              onVerify={(verified, reason) => handleVerification("bankDetails", verified, reason)}
              loading={verifying === "bankDetails"}
            />

            <VerificationSection
              title="Emergency Details"
              icon={<Phone className="h-5 w-5" />}
              verified={driver.emergencyDetailsVerified}
              data={driver.emergencyDetails || {}}
              onVerify={(verified, reason) => handleVerification("emergencyDetails", verified, reason)}
              loading={verifying === "emergencyDetails"}
            />

            {/* Bulk Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Bulk Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() =>
                      handleBulkVerification({
                        personalInfo: true,
                        personalDocuments: true,
                        vehicleDetails: true,
                        bankDetails: true,
                        emergencyDetails: true,
                      })
                    }
                    disabled={verifying === "bulk"}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {verifying === "bulk" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify All Sections
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleBulkVerification({
                        personalInfo: false,
                        personalDocuments: false,
                        vehicleDetails: false,
                        bankDetails: false,
                        emergencyDetails: false,
                      })
                    }
                    disabled={verifying === "bulk"}
                  >
                    {verifying === "bulk" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reject All Sections
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

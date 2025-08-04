"use client";

import type React from "react";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface VerificationSectionProps {
  title: string;
  icon: React.ReactNode;
  verified: boolean;
  data: Record<string, any>;
  onVerify: (verified: boolean, reason?: string) => void;
  loading: boolean;
}

export default function VerificationSection({
  title,
  icon,
  verified,
  data,
  onVerify,
  loading,
}: VerificationSectionProps) {
  const [showActions, setShowActions] = useState(false);
  const [reason, setReason] = useState("");
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleVerify = (isVerified: boolean) => {
    onVerify(isVerified, reason);
    setShowActions(false);
    setReason("");
  };

  const isImageUrl = (value: any): boolean => {
    if (typeof value !== "string") return false;
    return (
      value.includes("amazonaws.com") ||
      value.includes("s3.") ||
      value.includes("cloudinary.com") ||
      value.includes("firebasestorage.googleapis.com") ||
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$|&)/i.test(value)
    );
  };

  const openImageViewer = (imageUrl: string, allImages: string[]) => {
    setImageUrls(allImages);
    setCurrentImageIndex(allImages.indexOf(imageUrl));
    setImageViewerOpen(true);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : imageUrls.length - 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev < imageUrls.length - 1 ? prev + 1 : 0
      );
    }
  };

  const renderValue = (value: any, key: string) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (value === null || value === undefined) {
      return "Not provided";
    }

    if (isImageUrl(value)) {
      // Get all image URLs from the current data for navigation
      const allImages = Object.values(data).filter(isImageUrl) as string[];

      return (
        <div className="space-y-3">
          {/* Always show fallback content with option to view in modal */}
          <div
            className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-gray-200 hover:border-gray-400 transition-colors group"
            onClick={() => openImageViewer(value, allImages)}
          >
            <div className="text-center">
              <ZoomIn className="h-8 w-8 mx-auto mb-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
              <span className="font-medium">Click to view image</span>
              <p className="text-xs text-gray-400 mt-1">
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </p>
            </div>
          </div>

          {/* Hyperlink to view image in new tab */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(value, "_blank")}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View in new tab
            </button>
          </div>
        </div>
      );
    }

    return String(value);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <Badge variant={verified ? "default" : "destructive"}>
              {verified ? "Verified" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Data Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </Label>
                  <div
                    className={`text-sm text-gray-900 ${
                      isImageUrl(value) ? "" : "bg-gray-50 p-2 rounded"
                    }`}
                  >
                    {renderValue(value, key)}
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Actions */}
            {!verified && (
              <div className="pt-4 border-t">
                {!showActions ? (
                  <Button
                    onClick={() => setShowActions(true)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Review & Verify
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor={`reason-${title}`}>
                        Reason (Optional)
                      </Label>
                      <Textarea
                        id={`reason-${title}`}
                        placeholder="Add a reason for verification/rejection..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVerify(true)}
                        disabled={loading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Verify
                      </Button>

                      <Button
                        onClick={() => handleVerify(false)}
                        disabled={loading}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>

                      <Button
                        onClick={() => {
                          setShowActions(false);
                          setReason("");
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Viewer Dialog */}
      <Dialog open={imageViewerOpen} onOpenChange={setImageViewerOpen}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation Buttons */}
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage("prev")}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={() => navigateImage("next")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {imageUrls.length > 1 && (
              <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {imageUrls.length}
              </div>
            )}

            {/* Main Image */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {imageUrls[currentImageIndex] && (
                <img
                  src={imageUrls[currentImageIndex]}
                  alt={`Document ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    // Show error message or fallback
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-white text-center">
                          <p class="mb-4">Unable to load image</p>
                          <button 
                            onclick="window.open('${imageUrls[currentImageIndex]}', '_blank')"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 mx-auto"
                          >
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            Open in new tab
                          </button>
                        </div>
                      `;
                    }
                  }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

'use client'
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function UserNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-1" />
            <div>
              <AlertTitle>User not found</AlertTitle>
              <AlertDescription>
                The user you are looking for does not exist or an unexpected
                error occurred.
              </AlertDescription>
            </div>
          </Alert>

          <div className="flex justify-center mt-6">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
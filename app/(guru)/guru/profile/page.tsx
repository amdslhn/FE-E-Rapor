"use client"
import UserProfileForm from "@/components/profile/user-profile-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function SiswaProfile() {
  return (
    <ProtectedRoute requiredRoles={["guru"]}>
      <div>
        <UserProfileForm />
      </div>
    </ProtectedRoute>
  )
}
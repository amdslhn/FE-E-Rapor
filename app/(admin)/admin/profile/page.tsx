"use client"
import UserProfileForm from "@/components/profile/user-profile-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminProfile() {
  return (
    <ProtectedRoute requiredRoles={["admin"]}>
      <div className="p-6">
        <UserProfileForm />
      </div>
    </ProtectedRoute>
  )
}
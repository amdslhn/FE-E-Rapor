"use client"
import UserProfileForm from "@/components/profile/user-profile-form"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminProfile() {
  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <div>
        <UserProfileForm />
      </div>
    </ProtectedRoute>
  )
}
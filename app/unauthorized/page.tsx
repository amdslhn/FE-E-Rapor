"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Access Denied</h1>
        <p className="text-center text-muted-foreground mb-6">
          Anda tidak memiliki akses ke halaman ini. Silahkan hubungi administrator.
        </p>
        <Link href="/">
          <Button className="w-full">Kembali ke Dashboard</Button>
        </Link>
      </Card>
    </div>
  )
}

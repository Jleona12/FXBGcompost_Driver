import AdminLayout from '@/components/admin/AdminLayout'

export const metadata = {
  title: 'Admin - FXBG Compost',
  description: 'Admin dashboard for FXBG Compost route management',
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}

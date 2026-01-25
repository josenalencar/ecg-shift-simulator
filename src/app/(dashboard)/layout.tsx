import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile fetch error:', error)
    }
    profile = data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header profile={profile} />
      <main>{children}</main>
    </div>
  )
}

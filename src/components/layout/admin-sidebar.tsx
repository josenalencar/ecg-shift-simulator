'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, FileImage, Users, Mail, BarChart3, Settings, LogOut, GraduationCap } from 'lucide-react'

const navigation = [
  { name: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { name: 'Casos de ECG', href: '/admin/ecgs', icon: FileImage },
  { name: 'Usuários', href: '/admin/users', icon: Users },
  { name: 'E-mails', href: '/admin/emails', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white">Painel Admin</h2>
      </div>
      <nav className="mt-4 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-gray-800 text-white border-l-4 border-blue-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <GraduationCap className="h-5 w-5" />
          Modo Estudante
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  )
}

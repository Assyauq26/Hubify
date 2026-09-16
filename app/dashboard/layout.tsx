import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('id, name')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(8)

  return <AppShell email={user.email} workspaces={workspaces ?? []}>{children}</AppShell>
}

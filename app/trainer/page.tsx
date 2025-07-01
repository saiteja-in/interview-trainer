// app/trainer/page.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button' // We'll create this server action
import { updateUserRole } from '@/actions/login'

const JOB_ROLES = [
  'FRONTEND_DEVELOPER',
  'BACKEND_DEVELOPER',
  'DATA_SCIENTIST',
  'PRODUCT_MANAGER',
  'UX_DESIGNER'
] as const

export default function TrainerPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedRole, setSelectedRole] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        await updateUserRole(selectedRole)
        router.push('/trainer/v1')
      } catch (error) {
        console.error('Error saving role:', error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Select Your Target Role</h1>
          <p className="text-muted-foreground">
            Choose the role you're preparing for to get tailored interview questions
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {JOB_ROLES.map((role) => (
            <Button
              key={role}
              type="button"
              variant={selectedRole === role ? 'default' : 'outline-solid'}
              onClick={() => setSelectedRole(role)}
            >
              {role.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>

        <input type="hidden" name="role" value={selectedRole} />

        <Button
          type="submit"
          className="w-full"
          disabled={!selectedRole || isPending}
        >
          {isPending ? 'Saving...' : 'Start Practice'}
        </Button>
      </form>
    </div>
  )
}
import React from 'react'
import SettingsPage from './SettingsPage'
import { currentUser } from '@/lib/auth'
import { ExtendedUser } from '@/schemas'

const page =async () => {
    const user=await currentUser() as ExtendedUser |undefined;
  return (
    <SettingsPage user={user} />
  )
}

export default page

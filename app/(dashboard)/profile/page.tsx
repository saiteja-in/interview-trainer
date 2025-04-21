// import React from 'react'
// import SettingsPage from './SettingsPage'
// import { currentUser } from '@/lib/auth'
// import { ExtendedUser } from '@/schemas'

// const page =async () => {
//     const user=await currentUser() as ExtendedUser |undefined;
//   return (
//     <SettingsPage user={user} />
//   )
// }

// export default page

import type { Metadata } from "next"
import ProfilePageClient from "./ProfilePageClient"

export const metadata: Metadata = {
  title: "Profile | InterviewAI",
  description: "Manage your profile and settings",
}

export default function ProfilePage() {
  return <ProfilePageClient />
}

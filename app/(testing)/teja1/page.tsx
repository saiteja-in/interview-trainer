import React from 'react'
import { caller } from '@/lib/trpc/server';

const Page = async () => {
  const greeting = await caller.hello({ text: "saiteja" })
  return (
    <div className='min-h-screen flex items-center justify-center'>
      {greeting.greeting} (fetching from server)
    </div>
  )
}

export default Page;
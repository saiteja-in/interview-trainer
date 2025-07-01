"use client"
import { useTRPC } from '@/lib/trpc/client';
import { useQuery } from '@tanstack/react-query';
import React from 'react'

const page = () => {
  const trpc = useTRPC();
  const {data}= useQuery(trpc.hello.queryOptions({text:"Sai teja"}))
  return (
    <div className='text-blue-600 text-6xl flex items-center justify-center min-h-screen font-mono'>
      {data?.greeting}
    </div>
  )
}

export default page
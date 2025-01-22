// import { auth } from "@/auth";
// import { SessionProvider } from "next-auth/react";

// export default async function ProtectedLayout({
// 	children,
// }: { children: React.ReactNode }) {
// 	const session = await auth();

// 	return (
// 		<SessionProvider session={session}>
// 			{children}
// 		</SessionProvider>
// 	);
// }

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { ModeToggle } from '../_components/ModeToggle'

export default async function layout({
	children,
}: { children: React.ReactNode })
{
  return (
	<div className='min-h-screen flex flex-col'>
		<nav className="container py-4 px-10 flex justify-between ">
        <Link 
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-fit"
          )} 
          href="/"
        >
          Home
        </Link>
		<ModeToggle/>
		</nav>
		<main className="flex-1 flex items-center justify-center">
        <div className="container flex items-center justify-center">
          {children}
        </div>
      </main>
	</div>
  )
}


'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Button } from '@/components/ui/button'
const navbar = ({isAdmin}) => {
  return (
    <nav className='fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4'>

  
<div className='bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 dark:shadow-none dark:shadow-black/20 transition-all duration-200 hover:bg-white/15 dark:hover:bg-black/15'>
  <div className='px-6 py-4 flex justify-between items-center'>
    <Link href={'/'} className='flex items-center gap-2'>
      <Image src={"/logo.svg"} alt="Vercel Logo" width={42} height={42} />
      <span className='font-bold text-2xl tracking-widest text-amber-300'>Leetcode</span>
    </Link>
    <div className='flex flex-row items-center gap-x-4'>
      <Link href={'/profile'} className='text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400'>Profile</Link>
      <Link href={'/problems'} className='text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400'>Problems</Link>
      <Link href={'/about'} className='text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-amber-600 cursor-pointer dark:hover:text-amber-400'>About</Link>
    </div>
    <div className='flex items-center gap-4'>
      <ModeToggle/>
      <SignedIn>
        {isAdmin && (
          <Link href={'/create-problem'}>
            <Button variant={'outline'}>Create Problem</Button>
          </Link>
        )}
        <UserButton />
      </SignedIn>
      <SignedOut>
        <div className='flex items-center gap-2'>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm" className='text-sm font-medium bg-amber-400 hover:bg-amber-500 text-white'>
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  </div>
</div>
    </nav>
  )
}

export default navbar

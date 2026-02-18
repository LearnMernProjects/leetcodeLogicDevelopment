import React from 'react'
import { currentUser } from '@clerk/nextjs/server'; 
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { currentUserRole } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ModeToggle } from '@/components/ui/mode-toggle';
import CreateProblemForm from '@/modules/problems/components/create-problem-form';
const CreateProblemPage = async() => {
    const user = await currentUser();
    const userRole = await currentUserRole();
    if (userRole !== "ADMIN") {
        return redirect('/');
    }
  return (
    <section className='flex flex-col items-center justify-center container mx-4 mt-24 mb-4'>
        <div className='flex flex-row justify-between items-center w-full'>
            <Link href={"/create-problem"}>
            <Button variant={"outline"} size={"icon"} 
            >
                <ArrowLeft className="size-4"/>

                </Button></Link>
                <h1 className='text-3xl font-bold text-amber-400'>Welcome {user?.firstName}! Create a Problem</h1>
                <ModeToggle/>
                <div/>
                <CreateProblemForm/>
        </div>
      
    </section>
  )
}

export default CreateProblemPage

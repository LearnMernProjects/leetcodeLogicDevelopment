import React from "react";
 import Navbar from "../../modules/home/components/navbar";
 import { currentUserRole } from "@/lib/session";

const RootLayout=async({children}) => {
  const userRole = await currentUserRole();
  const isAdmin = userRole === 'ADMIN';
    return(
        <main className="flex flex-col min-h-screen max-h-screen relative">
            <Navbar isAdmin={isAdmin} />
            <div className="absolute inset-0 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px, transparent_1px)] bg-[size:16px_16px] pointer-events-none -z-10"/>
            <div className="flex-1 flex flex-col px-4 pb-4 relative z-10">
                {children}
            </div>
        </main>
    )
};
export default RootLayout;
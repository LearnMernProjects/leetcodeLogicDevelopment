import React from "react";

const AuthLayout = ({ children }) => {
  return(
    <main className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <div className="w-full max-w-md">
        {children}
      </div>
    </main>
  )
}
export default AuthLayout;
'use client'

import AppHeader from './app-header'

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start flex-initial">
      <AppHeader />
      <div className="mt-16 p-4 min-h-screen w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

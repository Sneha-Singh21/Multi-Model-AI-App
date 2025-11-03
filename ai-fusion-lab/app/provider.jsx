import React from 'react'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from './_components/AppSidebar.jsx'
import AppHeader from './_components/AppHeader.jsx'

const Provider = ({ children, ...props }) => {
  return (
    <NextThemesProvider 
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}>
        <SidebarProvider>
          <AppSidebar />
          <div className='w-full'>
             <AppHeader />
            {children}
          </div>
        </SidebarProvider>
    </NextThemesProvider>  
  )
}

export default Provider;
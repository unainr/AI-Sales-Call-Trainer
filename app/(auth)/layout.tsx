import { LayeredText } from '@/modules/home/ui/components/text-3d'
import { LayoutType } from '@/types'
import Image from 'next/image'
import React from 'react'

const Layout = ({children}:LayoutType) => {
  return (
     <div className="grid min-h-svh lg:grid-cols-2 dark:bg-[#212126] overflow-hidden ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
       
        <div className="flex flex-1 items-center justify-center ">
          <div className="w-full max-w-md">
           {children}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block ">
       <LayeredText/>
      </div>
    </div>
  )
}

export default Layout
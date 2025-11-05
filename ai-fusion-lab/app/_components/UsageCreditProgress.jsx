import { Progress } from '@/components/ui/progress'
import React from 'react'

const UsageCreditProgress = () => {
  return (
    <div className='p-3 mb-5 border rounded-2xl flex flex-col gap-2'>
        <h2 className='font-bold text-xl'>Free Plan</h2>
        <p className='text-gray-400 text-sm'>0/5 messages Used</p>
        <Progress value={33} />
    </div>
  )
}

export default UsageCreditProgress
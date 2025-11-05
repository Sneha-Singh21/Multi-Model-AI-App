import { Button } from '@/components/ui/button';
import { Mic, Paperclip, Send } from 'lucide-react';
import React from 'react'
import AiMultiModels from './AiMultiModels.jsx';

const ChatInputBox = () => {
  return (
    <div className='relative min-h-screen'>
        {/* Page Content */}
        <div>
            <AiMultiModels />
        </div>
        {/* Fixed Chat Input */}
        <div className='fixed flex mb-2 justify-center bottom-0 left-0 w-full px-4 pb-4  border-gray-200 dark:border-gray-900'>
            <div className='w-full border dark:bg-gray-300 dark:text-gray-800 rounded-xl shadow-md max-w-3xl px-4 py-2'>
                <input type="text" placeholder="Ask me anything..." className='border-0 outline-none'/> 
                <div className='mt-3 flex justify-between items-center'>
                    <Button variant={'ghost'} size={'icon'}>
                        <Paperclip className='h-5 w-5' />
                    </Button>
                    <div className='flex gap-2'>
                        <Button variant={'ghost'} size={'icon'}><Mic className='h-5 w-5' /></Button>
                        <Button size={'icon'} className='bg-blue-700 hover:bg-blue-800 text-white'><Send className='h-5 w-5' /></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ChatInputBox;
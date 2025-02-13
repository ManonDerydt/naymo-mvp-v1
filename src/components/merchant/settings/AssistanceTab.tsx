import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui'
import FAQ from './FAQ'
import HelpSection from './HelpSection'
import CustomerSupport from './CustomerSupport'

const AssistanceTab = () => {
  return (
    <div className="space-y-8 max-w-3xl">
      <FAQ />
      <HelpSection />
      <CustomerSupport />
    </div>
  )
}

export default AssistanceTab
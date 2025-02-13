import { Button } from '@/components/ui'

interface SuccessMessageProps {
  title: string
  message: string
  buttonText: string
  onButtonClick: () => void
}

const SuccessMessage = ({ title, message, buttonText, onButtonClick }: SuccessMessageProps) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      <Button
        onClick={onButtonClick}
        className="mt-6"
      >
        {buttonText}
      </Button>
    </div>
  )
}

export default SuccessMessage
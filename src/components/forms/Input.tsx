import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = ({ label, name, error, className, ...props }: InputProps) => (
  <div className="space-y-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={name}
      name={name}
      className={cn(
        "block w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm",
        "focus:ring-2 focus:ring-primary-500 focus:border-transparent",
        "placeholder:text-gray-400",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
  </div>
)

export default Input
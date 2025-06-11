import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'

interface FileUploadProps {
  label: string
  multiple?: boolean
  maxFiles?: number
  accept?: string
  onChange?: (files: File[]) => void
  error?: string
}

const FileUpload = ({
  label,
  multiple = false,
  maxFiles = 1,
  accept = "image/*",
  onChange,
  error // Ajout de error dans les props déstructurées
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (multiple && selectedFiles.length + files.length > maxFiles) {
      alert(`Vous ne pouvez pas uploader plus de ${maxFiles} fichiers`)
      return
    }

    const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles
    setFiles(newFiles)

    // Generate previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)

    if (onChange) {
      onChange(newFiles)
    }
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newPreviews)
    if (onChange) {
      onChange(newFiles)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>} {/* Affichage de l'erreur */}
      </div>

      <div
        className={cn(
          "relative border-2 border-dashed border-gray-300 rounded-lg p-6",
          "hover:border-primary-500 transition-colors duration-200",
          "flex flex-col items-center justify-center gap-4",
          "min-h-[200px]",
          error && "border-red-500" // Bordure rouge si erreur
        )}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-10 h-10 text-gray-400" />
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mb-2"
          >
            Sélectionner des fichiers
          </Button>
          <p className="text-sm text-gray-500">
            ou glissez-déposez vos fichiers ici
          </p>
          {multiple && (
            <p className="text-xs text-gray-400 mt-1">
              Maximum {maxFiles} fichiers
            </p>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload

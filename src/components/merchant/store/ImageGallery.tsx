import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Image {
  src: string
  alt: string
}

interface ImageGalleryProps {
  images: Image[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const handlePrevious = () => {
    setSelectedImage(current => 
      current === null ? null : current === 0 ? images.length - 1 : current - 1
    )
  }

  const handleNext = () => {
    setSelectedImage(current => 
      current === null ? null : current === images.length - 1 ? 0 : current + 1
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className="rounded-lg aspect-square object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedImage(index)}
          />
        ))}
      </div>

      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
          
          <button
            onClick={handlePrevious}
            className="absolute left-4 text-white hover:text-gray-300"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <img
            src={images[selectedImage].src}
            alt={images[selectedImage].alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          
          <button
            onClick={handleNext}
            className="absolute right-4 text-white hover:text-gray-300"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  )
}

export default ImageGallery
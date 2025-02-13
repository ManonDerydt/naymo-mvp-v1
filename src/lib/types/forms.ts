export interface FormData {
  company_name: string
  business_type: string
  owner_name: string
  owner_birthdate: string
  address: string
  city: string
  postal_code: string
  media: {
    logo: File | null
    cover_photo: File | null
    store_photos: File[]
  }
}
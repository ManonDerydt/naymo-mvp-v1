export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8
}

export const validatePostalCode = (postalCode: string): boolean => {
  const frenchPostalCodeRegex = /^[0-9]{5}$/
  return frenchPostalCodeRegex.test(postalCode)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const frenchPhoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/
  return frenchPhoneRegex.test(phone)
}
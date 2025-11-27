import DOMPurify from 'dompurify'

/**
 * Sanitization utilities using DOMPurify
 * Prevents XSS attacks by cleaning user inputs
 */

/**
 * Sanitize a string, removing all HTML tags and scripts
 * Use for text inputs (names, emails, messages)
 */
export const sanitizeText = (input: string): string => {
  if (!input) return ''
  // Remove all HTML - plain text only
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim()
}

/**
 * Sanitize email - lowercase + remove HTML
 */
export const sanitizeEmail = (email: string): string => {
  return sanitizeText(email).toLowerCase()
}

/**
 * Sanitize phone - remove HTML and keep only valid phone characters
 */
export const sanitizePhone = (phone: string): string => {
  const cleaned = sanitizeText(phone)
  // Keep only digits, +, -, (, ), and spaces
  return cleaned.replace(/[^\d+\-() ]/g, '')
}

/**
 * Sanitize name - remove HTML and special characters except accents/hyphens
 */
export const sanitizeName = (name: string): string => {
  const cleaned = sanitizeText(name)
  // Allow letters (including accented), spaces, hyphens, and apostrophes
  return cleaned.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, '')
}

/**
 * Sanitize a general user input (questions, messages)
 * Allows basic formatting but no scripts
 */
export const sanitizeUserInput = (input: string): string => {
  if (!input) return ''
  // Allow minimal safe tags for formatting if needed
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],  // No HTML allowed for user inputs
    ALLOWED_ATTR: []
  }).trim()
}

/**
 * Sanitize URL - validate and clean
 */
export const sanitizeUrl = (url: string): string => {
  const cleaned = sanitizeText(url)
  try {
    const parsed = new URL(cleaned)
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return ''
    }
    return parsed.href
  } catch {
    return ''
  }
}

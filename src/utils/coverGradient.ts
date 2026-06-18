/** 12 warm cream gradients for save card covers, selected by title hash */
const GRADIENTS = [
  'from-amber-100 to-yellow-50',
  'from-orange-50 to-amber-100',
  'from-yellow-100 to-orange-50',
  'from-cream-200 to-amber-100',
  'from-cream-300 to-cream-100',
  'from-amber-50 to-cream-200',
  'from-yellow-50 to-amber-50',
  'from-cream-100 to-yellow-100',
  'from-orange-100 to-cream-100',
  'from-cream-200 to-orange-50',
  'from-amber-100 to-cream-50',
  'from-yellow-100 to-cream-200',
]

export function getCoverGradient(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

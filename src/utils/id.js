let counter = Date.now()

export function uid(prefix = 'id') {
  counter += 1
  return `${prefix}-${counter.toString(36)}`
}

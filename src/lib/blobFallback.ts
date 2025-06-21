let localBlob: Record<string, any> = {}

export async function getJsonBlobFallback(key: string) {
  console.log('[💾] Reading local fallback blob:', key)
  return localBlob[key]
}

export async function writeJsonBlobFallback(key: string, value: any) {
  console.log('[💾] Writing local fallback blob:', key)
  localBlob[key] = value
}

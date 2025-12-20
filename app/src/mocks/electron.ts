// Mock electron module for browser environment
export const shell = {
  openExternal: (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  },
}

export default {
  shell,
}

/**
 * Safe message string from RTK Query / fetch errors (no `any`).
 */
export function getRtkErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data: unknown }).data;
    if (data && typeof data === 'object' && 'message' in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
        return message.join(' ');
      }
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

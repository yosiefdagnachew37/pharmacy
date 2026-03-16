/**
 * Extracts a readable error message from an Axios/API error response.
 * Handles NestJS class-validator array messages (e.g., { message: ["field must be..."] })
 */
export function extractErrorMessage(error: any, fallback = 'An unexpected error occurred.'): string {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  // NestJS with a global filter often nests the response in another 'message' field
  if (data.message && typeof data.message === 'object' && !Array.isArray(data.message)) {
    if (data.message.message) {
      if (Array.isArray(data.message.message)) return data.message.message.join('\n');
      return data.message.message;
    }
  }

  if (Array.isArray(data.message)) {
    return data.message.join('\n');
  }

  if (typeof data.message === 'string') {
    return data.message;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  if (typeof data === 'string') {
    return data;
  }

  return error?.message || fallback;
}

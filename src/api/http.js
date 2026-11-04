
const BASE_URL = "https://jsonplaceholder.typicode.com";

const TIMEOUT = 8000;

// Custom error class
export class HttpError extends Error {
  constructor(status, message, data) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

// Reusable request function
export async function request(
  path,
  { method = "GET", body, headers = {}, signal } = {}
) {
  const timeoutSignal = AbortSignal.timeout(TIMEOUT);

  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal: combinedSignal,
    headers: {
      Accept: "application/json",
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Handle responses without a body
  if (response.status === 204) {
    if (!response.ok) {
      throw new HttpError(response.status, "Request failed", null);
    }
    return null;
  }

  // Read the response body only once
  const contentType = response.headers.get("content-type");
  const isJSON = contentType?.includes("application/json");

  const data = isJSON
    ? await response.json()
    : await response.text();

  // Handle HTTP errors
  if (!response.ok) {
    throw new HttpError(
      response.status,
      data?.message || `Request failed (${response.status})`,
      data
    );
  }

  return data;
}

// API methods
export const api = {
  get: (path, options) =>
    request(path, options),

  post: (path, body) =>
    request(path, { method: "POST", body }),

  put: (path, body) =>
    request(path, { method: "PUT", body }),

  patch: (path, body) =>
    request(path, { method: "PATCH", body }),

  del: (path) =>
    request(path, { method: "DELETE" }),
};

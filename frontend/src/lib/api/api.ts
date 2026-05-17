import { useAuthStore } from "@/store/authStore";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

type ApiRequestOptions = RequestInit & {
  /**
   * auth:
   * - true / undefined: dołącz token, jeśli istnieje
   * - false: nie dołączaj tokena
   */
  auth?: boolean;
};

type ApiErrorResponse = {
  detail?: string | { msg?: string }[];
  message?: string;
};

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const errorData = data as ApiErrorResponse;

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    if (Array.isArray(errorData.detail)) {
      const message = errorData.detail
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ");

      if (message) {
        return message;
      }
    }

    if (typeof errorData.message === "string") {
      return errorData.message;
    }
  }

  return fallback;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { auth = true, headers, ...restOptions } = options;

  const token = useAuthStore.getState().token;
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const isFormData = restOptions.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const contentType = response.headers.get("content-type");
  const data: unknown = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      useAuthStore.getState().logout();
    }

    throw new Error(getErrorMessage(data, `API error ${response.status}`));
  }

  return data as T;
}

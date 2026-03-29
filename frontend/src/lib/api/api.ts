import { useAuthStore } from "@/store/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = false, headers, ...restOptions } = options;
  const token = useAuthStore.getState().token;

  console.log("API_URL:", API_URL);
  console.log("ENDPOINT:", endpoint);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...restOptions,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
  });

  const contentType = response.headers.get("content-type");
  let data: unknown = null;

  if (contentType?.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data !== null && "detail" in data
        ? String((data as { detail?: string }).detail)
        : "Wystąpił błąd API"
    );
  }

  return data as T;
}
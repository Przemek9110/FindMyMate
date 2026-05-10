import { apiFetch } from "./api";

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  username?: string;
  email: string;
  password: string;
};

type BackendUser = {
  id: number;
  email: string;
};

type CreateUserResponse = BackendUser & {
  message: string;
};

export type AuthResponse = {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
};

export function login(payload: LoginPayload) {
  return new Promise<AuthResponse>((resolve, reject) => {
    setTimeout(() => {
      if (!payload.email || !payload.password) {
        reject(new Error("Email i haslo sa wymagane"));
        return;
      }

      resolve({
        user: {
          id: "1",
          username: payload.email.split("@")[0],
          email: payload.email,
        },
        token: "mock-token-123",
      });
    }, 500);
  });
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (!payload.email || !payload.password) {
    throw new Error("Email i haslo sa wymagane");
  }

  const user = await apiFetch<CreateUserResponse>("/users", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  return {
    user: {
      id: String(user.id),
      username: payload.username?.trim() || user.email.split("@")[0],
      email: user.email,
    },
    token: "mock-token-123",
  };
}

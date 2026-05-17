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

type TokenResponse = {
  access_token: string;
  token_type: string;
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

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (!payload.email || !payload.password) {
    throw new Error("E-mail i hasło są wymagane.");
  }

  const token = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const user = await apiFetch<BackendUser>("/auth/me", {
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
    },
  });

  return {
    user: {
      id: String(user.id),
      username: user.email.split("@")[0],
      email: user.email,
    },
    token: token.access_token,
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (!payload.email || !payload.password) {
    throw new Error("E-mail i hasło są wymagane.");
  }

  const user = await apiFetch<CreateUserResponse>("/users", {
    method: "POST",
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  const token = await apiFetch<TokenResponse>("/auth/login", {
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
    token: token.access_token,
  };
}

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
  username: string;
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

function mapBackendUser(user: BackendUser): AuthResponse["user"] {
  return {
    id: String(user.id),
    username: user.username || user.email.split("@")[0],
    email: user.email,
  };
}

function buildAuthorizationHeader(token: TokenResponse): string {
  const tokenType = token.token_type || "Bearer";

  return `${tokenType.charAt(0).toUpperCase()}${tokenType.slice(1)} ${
    token.access_token
  }`;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  if (!payload.email || !payload.password) {
    throw new Error("E-mail i hasło są wymagane.");
  }

  const token = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  const user = await apiFetch<BackendUser>("/auth/me", {
    auth: false,
    headers: {
      Authorization: buildAuthorizationHeader(token),
    },
  });

  return {
    user: mapBackendUser(user),
    token: token.access_token,
  };
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  if (!payload.email || !payload.password) {
    throw new Error("E-mail i hasło są wymagane.");
  }

  await apiFetch<CreateUserResponse>("/users", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    }),
  });

  const token = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  const user = await apiFetch<BackendUser>("/auth/me", {
    auth: false,
    headers: {
      Authorization: buildAuthorizationHeader(token),
    },
  });

  return {
    user: mapBackendUser(user),
    token: token.access_token,
  };
}

export type UpdateCredentialsPayload = {
  username: string;
  current_password: string;
  new_password: string;
};

export async function updateCredentials(
  payload: UpdateCredentialsPayload
): Promise<AuthResponse["user"]> {
  if (!payload.username.trim()) {
    throw new Error("Nazwa użytkownika jest wymagana.");
  }

  if (!payload.current_password.trim()) {
    throw new Error("Aktualne hasło jest wymagane.");
  }

  if (!payload.new_password.trim()) {
    throw new Error("Nowe hasło jest wymagane.");
  }

  const user = await apiFetch<BackendUser>("/auth/credentials", {
    method: "PUT",
    auth: true,
    body: JSON.stringify({
      username: payload.username.trim(),
      current_password: payload.current_password,
      new_password: payload.new_password,
    }),
  });

  return mapBackendUser(user);
}

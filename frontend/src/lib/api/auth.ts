type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
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
        reject(new Error("Email i hasło są wymagane"));
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

export function register(payload: RegisterPayload) {
  return new Promise<AuthResponse>((resolve, reject) => {
    setTimeout(() => {
      if (!payload.username || !payload.email || !payload.password) {
        reject(new Error("Wszystkie pola są wymagane"));
        return;
      }

      resolve({
        user: {
          id: "1",
          username: payload.username,
          email: payload.email,
        },
        token: "mock-token-123",
      });
    }, 500);
  });
}
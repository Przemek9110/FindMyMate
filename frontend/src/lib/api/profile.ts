export type Profile = {
  username: string;
  bio: string;
  interests: string[];
};

const mockProfile: Profile = {
  username: "MateuszK",
  bio: "Programista fullstack, lubię budować aplikacje webowe i testować nowe technologie. Po godzinach siłownia i gaming.",
  interests: ["Node.js", "React", "Gaming", "Siłownia", "Technologia"],
};

// fake GET
export async function getProfile(): Promise<Profile> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockProfile), 500);
  });
}

// fake UPDATE
export async function updateProfile(updated: Profile): Promise<Profile> {
  return new Promise((resolve) => {
    setTimeout(() => {
      Object.assign(mockProfile, updated);
      resolve(mockProfile);
    }, 500);
  });
}
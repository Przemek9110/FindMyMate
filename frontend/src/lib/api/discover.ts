type DiscoverUser = {
  id: string;
  username: string;
  bio: string;
  interests: string[];
  likedYou: boolean;
};

type ReactionType = "like" | "pass";

const mockUsers: DiscoverUser[] = [
  {
    id: "1",
    username: "AniaTravel",
    bio: "Uwielbiam podróże i fotografię. Szukam osób do wspólnych wypadów.",
    interests: ["Podróże", "Fotografia", "Kultura"],
    likedYou: true,
  },
  {
    id: "2",
    username: "CodeNina",
    bio: "Frontend dev, UI/UX lover. Minimalizm i dobre projekty to moje życie.",
    interests: ["React", "Design", "Figma"],
    likedYou: false,
  },
  {
    id: "3",
    username: "MarekFit",
    bio: "Lubię aktywny tryb życia, siłownię i dobre jedzenie.",
    interests: ["Siłownia", "Dietetyka", "Podróże"],
    likedYou: true,
  },
];

export async function getDiscoverUsers(): Promise<DiscoverUser[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockUsers), 400);
  });
}

export async function sendReaction(
  userId: string,
  reaction: ReactionType
): Promise<{ success: boolean }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock reaction saved:", { userId, reaction });
      resolve({ success: true });
    }, 300);
  });
}

export type { DiscoverUser, ReactionType };
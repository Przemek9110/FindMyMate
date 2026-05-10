const PROFILE_PHOTO_PREFIX = "findmymate-profile-photo";

export function getProfilePhotoKey(userId: string | number) {
  return `${PROFILE_PHOTO_PREFIX}:${userId}`;
}

export function getProfilePhoto(userId: string | number) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(getProfilePhotoKey(userId));
}

export function saveProfilePhoto(userId: string | number, photo: string) {
  window.localStorage.setItem(getProfilePhotoKey(userId), photo);
}

export function removeProfilePhoto(userId: string | number) {
  window.localStorage.removeItem(getProfilePhotoKey(userId));
}

const PROFILE_GENDER_KEY = "athome.profileGender";
const PROFILE_AVATAR_KEY = "athome.profileAvatar";

export type ProfileGender = "male" | "female";

export function getStoredProfileAvatar(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(PROFILE_AVATAR_KEY) || null;
}

export function storeProfileAvatar(url: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (url) {
    localStorage.setItem(PROFILE_AVATAR_KEY, url);
  } else {
    localStorage.removeItem(PROFILE_AVATAR_KEY);
  }

  window.dispatchEvent(new Event("athome-profile-changed"));
}

export function getStoredProfileGender(): ProfileGender {
  if (typeof window === "undefined") {
    return "male";
  }

  return localStorage.getItem(PROFILE_GENDER_KEY) === "female"
    ? "female"
    : "male";
}

export function storeProfileGender(gender: ProfileGender) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PROFILE_GENDER_KEY, gender);
  window.dispatchEvent(new Event("athome-profile-changed"));
}

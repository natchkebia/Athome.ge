const PROFILE_GENDER_KEY = "athome.profileGender";

export type ProfileGender = "male" | "female";

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

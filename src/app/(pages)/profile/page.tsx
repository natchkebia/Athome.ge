import { Suspense } from "react";
import ProfilePage from "@/components/profile/ProfilePage";
import AtHomeLoader from "@/components/shared/AtHomeLoader";

export default function Profile() {
  return (
    <Suspense fallback={<AtHomeLoader variant="page" />}>
      <ProfilePage />
    </Suspense>
  );
}

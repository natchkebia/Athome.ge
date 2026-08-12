"use client";

import { useEffect } from "react";

export default function SocialAuthCallbackPage() {
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const searchParams = new URLSearchParams(window.location.search);
    const params = hashParams.toString() ? hashParams : searchParams;

    window.opener?.postMessage(
      {
        type: "athome-social-auth",
        params: params.toString(),
      },
      window.location.origin
    );

    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("athome-social-auth");
      channel.postMessage({
        type: "athome-social-auth",
        params: params.toString(),
      });
      channel.close();
    }

    window.close();
  }, []);

  return null;
}

export type SocialAuthProvider = "google" | "facebook";

function openSocialPopup(url: string) {
  return new Promise<URLSearchParams>((resolve, reject) => {
    const channel =
      typeof BroadcastChannel === "undefined"
        ? null
        : new BroadcastChannel("athome-social-auth");
    const width = 520;
    const height = 680;
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;
    const viewportWidth =
      window.innerWidth ?? document.documentElement.clientWidth;
    const viewportHeight =
      window.innerHeight ?? document.documentElement.clientHeight;
    const left = dualScreenLeft + Math.max((viewportWidth - width) / 2, 0);
    const top = dualScreenTop + Math.max((viewportHeight - height) / 2, 0);
    const popup = window.open(
      url,
      "athome-social-auth",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (!popup) {
      reject(new Error("Popup ვერ გაიხსნა. ბრაუზერში popup-ები დაუშვი."));
      return;
    }

    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("ავტორიზაციის დრო ამოიწურა"));
    }, 120000);
    const interval = window.setInterval(() => {
      try {
        if (popup.closed) {
          cleanup(false);
          reject(new Error("ავტორიზაცია გაუქმდა"));
        }
      } catch {
        // Some OAuth providers isolate their popup with COOP while it is on
        // their origin. The same-origin callback/BroadcastChannel still
        // delivers the final result, so a blocked `closed` read is harmless.
      }
    }, 500);

    function cleanup(closePopup = true) {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
      channel?.close();
      if (closePopup) {
        try {
          if (!popup?.closed) popup?.close();
        } catch {
          // The provider may temporarily block cross-origin popup access.
        }
      }
    }

    function resolveParams(rawParams: unknown) {
      cleanup();
      const params = new URLSearchParams(String(rawParams ?? ""));
      const providerError =
        params.get("error_description") ??
        params.get("error_message") ??
        params.get("error");

      if (providerError) reject(new Error(providerError));
      else resolve(params);
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "athome-social-auth") return;
      resolveParams(event.data.params);
    }

    window.addEventListener("message", handleMessage);
    if (channel) {
      channel.onmessage = (event) => {
        if (event.data?.type === "athome-social-auth") {
          resolveParams(event.data.params);
        }
      };
    }
  });
}

export async function getSocialAuthToken(provider: SocialAuthProvider) {
  const redirectUri = `${window.location.origin}/auth/social-callback`;

  if (provider === "google") {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google-ით შესვლა დროებით მიუწვდომელია");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: crypto.randomUUID(),
      prompt: "select_account",
    });
    const response = await openSocialPopup(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
    const token = response.get("id_token");
    if (!token) throw new Error("Google token არ დაბრუნდა");
    return token;
  }

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  if (!appId) {
    throw new Error("Facebook-ით შესვლა დროებით მიუწვდომელია");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "email,public_profile",
    auth_type: "rerequest",
    display: "popup",
  });
  const response = await openSocialPopup(
    `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
  );
  const token = response.get("access_token");
  if (!token) throw new Error("Facebook token არ დაბრუნდა");
  return token;
}

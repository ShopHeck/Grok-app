"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function ExtensionSync() {
  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ExtensionSync] Auth state changed:", event, !!session);

      if (session) {
        // Construct the session data structure expected by auth-bridge.js
        const sessionData = {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: {
            id: session.user.id,
            email: session.user.email,
          },
        };

        // Write to localStorage under a key ending in '-auth-token' so auth-bridge.js finds it
        localStorage.setItem("sb-writescore-auth-token", JSON.stringify(sessionData));
      } else {
        localStorage.removeItem("sb-writescore-auth-token");
      }

      // Notify the content script (auth-bridge.js) immediately
      window.postMessage({ type: "WRITESCORE_SESSION_CHANGED" }, "*");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}

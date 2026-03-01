import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Role = "none" | "user" | "admin";
type AuthRequirement = "none" | "user" | "admin";

type UseAuthCheckOptions = { require: AuthRequirement };
export type AuthStatus = { authenticated: boolean; role: Role } | null;

export function useAuthCheck({ require }: UseAuthCheckOptions): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    console.log("[useAuthCheck] Hook mounted. Require:", require);

    (async () => {
      try {
        console.log("[useAuthCheck] Fetching /api/frontendRedirect...");
        let res = await fetch("http://localhost:3000/api/frontendRedirect", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ require }),
        });

        console.log("[useAuthCheck] Response status:", res.status);

        // Om token har gått ut → försök refresh
        if (res.status === 401) {
          console.log("[useAuthCheck] Token expired, trying refresh...");
          const r = await fetch("http://localhost:3000/api/refreshAccessToken", {
            method: "POST",
            credentials: "include",
          });
          console.log("[useAuthCheck] Refresh response status:", r.status);

          if (r.ok) {
            console.log("[useAuthCheck] Refresh successful, retrying frontendRedirect...");
            res = await fetch("http://localhost:3000/api/frontendRedirect", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ require }),
            });
            console.log("[useAuthCheck] Retried frontendRedirect status:", res.status);
          }
        }

        if (!alive) {
          console.log("[useAuthCheck] Component unmounted before response");
          return;
        }

        if (res.ok) {
          const data = (await res.json()) as {
            authenticated: boolean;
            role: Role;
            success: boolean;
          };
          console.log("[useAuthCheck] FrontendRedirect data:", data);

          setStatus({ authenticated: data.authenticated, role: data.role });

          // Redirect: från / → /dashboard om inloggad och require = none
          if (require === "none" && data.authenticated) {
            console.log("[useAuthCheck] User is authenticated → navigating to /dashboard");
            navigate("/dashboard", { replace: true });
          }

          return;
        }

        console.log("[useAuthCheck] Fetch not OK, require !== none?", require !== "none");

        // Om sidan kräver auth men fetch misslyckades → markera utloggad och redirect
        if (require !== "none") {
          console.log("[useAuthCheck] User not authenticated → navigating to /");
          setStatus({ authenticated: false, role: "none" });
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("[useAuthCheck] Error during auth check:", error);
        if (alive && require !== "none") {
          console.log("[useAuthCheck] Setting status to logged out and navigating /");
          setStatus({ authenticated: false, role: "none" });
          navigate("/", { replace: true });
        }
      }
    })();

    return () => {
      console.log("[useAuthCheck] Cleanup, setting alive = false");
      alive = false;
    };
  }, [require, navigate]);

  return status;
}
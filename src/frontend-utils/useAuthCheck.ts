import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type Role = "None" | "User" | "Admin";
type AuthRequirement = "None" | "User" | "Admin";

type UseAuthCheckOptions = { require: AuthRequirement };
export type AuthStatus = { authenticated: boolean; role: Role } | null;

export function useAuthCheck({ require }: UseAuthCheckOptions): AuthStatus {
  const [status, setStatus] = useState<AuthStatus>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        let res = await fetch("http://localhost:3000/api/frontendRedirect", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ require }),
          signal, // ✅ kopplar signalen till fetchen
        });
        
        // Om token har gått ut → försök refresh
        if (res.status === 401 || require === "None") {
          const r = await fetch("http://localhost:3000/api/refreshAccessToken", {
            method: "POST",
            credentials: "include",
          });

          if (r.ok) {
            res = await fetch("http://localhost:3000/api/frontendRedirect", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ require }),
              signal, // ✅ signal även här
            });
          }
        }

        if (res.ok) {
          const data = (await res.json()) as {
            authenticated: boolean;
            role: Role;
            success: boolean;
          };

          setStatus({ authenticated: data.authenticated, role: data.role });

          // Redirect: från / → /dashboard om inloggad och require = none
          if (require === "None" && data.authenticated) {
            navigate("/dashboard", { replace: true });
          }

          return;
        }

        // Om sidan kräver auth men fetch misslyckades → markera utloggad och redirect
        if (require !== "None") {
          setStatus({ authenticated: false, role: "None" });
          navigate("/", { replace: true });
        }
      } catch (err: unknown) {
        // Om fetch avbröts → gör inget
        if ((err as { name?: string }).name === "AbortError") return;

        // Annars: markera utloggad och redirect
        if (require !== "None") {
          setStatus({ authenticated: false, role: "None" });
          navigate("/", { replace: true });
        }
      }
    })();

    // Cleanup: avbryt fetchen om komponenten unmountas
    return () => {
      controller.abort();
    };
  }, [require, navigate]);

  return status;
}
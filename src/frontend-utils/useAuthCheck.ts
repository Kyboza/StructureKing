// TypeScript
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

type AuthRequirement = "none" | "user" | "admin";

type UseAuthCheckOptions = { require: AuthRequirement };

export function useAuthCheck({ require }: UseAuthCheckOptions) {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        let res = await fetch("/api/frontendRedirect", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ require }),
        });

        // Försök refresh vid 401 (valfritt)
        if (res.status === 401) {
          const r = await fetch("/api/refreshAccessToken", { method: "POST", credentials: "include" });
          if (r.ok) {
            res = await fetch("/api/frontendRedirect", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ require }),
            });
          }
        }

        if (!alive) return;

        if (res.ok) {
          const data = (await res.json()) as {
            authenticated: boolean;
            role: "none" | "user" | "admin";
            success: boolean;
          };

          // Om sidan “inte får vara inloggad” (require: "none") och vi ÄR inloggade,
          // välj själv policy: skicka till dashboard.
          if (require === "none" && data.authenticated) {
            navigate("/dashboard", { replace: true });
          }
          // Annars: allt okej, låt sidan rendera
          return;
        }

        // 401 eller 403 → skicka till login
        if (require !== "none") {
          navigate("/login", { replace: true });
        }
      } catch {
        if (alive && require !== "none") {
          navigate("/login", { replace: true });
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [navigate, require]);
}
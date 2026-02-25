// frontend/hooks/useAuthCheck.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthCheck(shouldBeLoggedIn: boolean) {
  const navigate = useNavigate();
  useEffect(() => {
    const verify = async () => {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      if (!res.ok) navigate("/login");
    };
    verify();
  }, [navigate]);
}
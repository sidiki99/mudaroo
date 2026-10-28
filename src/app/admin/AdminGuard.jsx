
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./components/api";


export default function AdminGuard({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const result = await api("/me");

        console.log("ME API RESPONSE:", result);

        const user =
          result?.user ??
          result?.data?.user ??
          result?.data ??
          result;

        if (!active) return;

        if (user?.role === "admin") {
          setStatus("authorized");
          return;
        }

        setStatus("denied");
        router.replace("/");
      } catch (error) {
        console.error("Admin authentication error:", error);

        if (!active) return;

        setStatus("denied");

        if (error.status === 401) {
          router.replace("/login?redirect=/admin/dashboard");
        } else {
          router.replace("/");
        }
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  if (status === "loading") {
    return <p className="p-6">Checking admin access...</p>;
  }

  if (status !== "authorized") {
    return null;
  }

  return children;
}
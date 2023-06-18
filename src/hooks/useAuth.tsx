import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const TOKENKEY = "token";
// TODO enable user to choose stay sign in
// function getLocalValue(key: strin): string | undefined {}

// function setLocalKey(key: string, value: string) {}

export function useAuth({
  noExistRedirectTo: redirectTo,
  redirectAfterSet: redirectIfExist,
}: {
  noExistRedirectTo?: string;
  redirectAfterSet?: string;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const hasWindow = typeof window !== undefined;
  function getSessionValue(key: string): string | null {
    return sessionStorage.getItem(key);
  }
  async function setSessionKey(value: string) {
    if (value === "") {
      sessionStorage.removeItem(TOKENKEY);
      setToken(null);
    } else {
      sessionStorage.setItem(TOKENKEY, value);
      setToken(token);
    }
    if (redirectIfExist) {
      await router.push(redirectIfExist);
    }
  }

  useEffect(() => {
    const f = async () => {
      const token = getSessionValue(TOKENKEY);
      setToken(token);
      if (token === null && redirectTo) {
        await router.push(redirectTo);
      }
    };
    if (!hasWindow) return;
    void f();
  }, [hasWindow, router, redirectTo, redirectIfExist, token]);

  return {
    token,
    setToken: setSessionKey,
  };
}

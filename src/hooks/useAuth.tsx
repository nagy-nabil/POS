import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const TOKENKEY = "token";
// TODO enable user to choose stay sign in
// function getLocalValue(key: strin): string | undefined {}

// function setLocalKey(key: string, value: string) {}

/**
 * control storage for `auth`, you can check is the user signed or not from here, and can change the stored token,
 * * Note -> by setting token to empty string (`""`) the token will be removed,
 * * also you can specifiy a url to direct the user to after set the token or if no token
 * @returns
 */
export function useAuth({
  noExistRedirectTo,
  redirectAfterSet,
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
    if (redirectAfterSet) {
      await router.push(redirectAfterSet);
    }
  }

  useEffect(() => {
    const f = async () => {
      const token = getSessionValue(TOKENKEY);
      setToken(token);
      if (token === null && noExistRedirectTo) {
        await router.push(noExistRedirectTo);
      }
    };
    if (!hasWindow) return;
    f().catch((e) => {
      throw e;
    });
  }, [hasWindow, router, noExistRedirectTo, redirectAfterSet, token]);

  return {
    token,
    isSignedIn: token !== null,
    setToken: setSessionKey,
  };
}

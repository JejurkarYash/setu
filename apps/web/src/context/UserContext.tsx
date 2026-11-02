import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { fetchUserProfile, type UserProfile } from "../api/userApi";

interface UserContextValue {
  user: UserProfile | null;
  isLoadingUser: boolean;
  userError: string | null;
  fetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoadingUser(true);
    setUserError(null);

    try {
      setUser(await fetchUserProfile());
    } catch (error) {
      setUserError(
        error instanceof Error ? error.message : "Failed to load your profile",
      );
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    void fetchUser();
  }, [fetchUser, location.pathname]);

  return (
    <UserContext.Provider
      value={{ user, isLoadingUser, userError, fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

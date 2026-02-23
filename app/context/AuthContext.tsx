'use client'

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ApiGetUser } from "@/app/types/apiGetUser";

type UserData = ApiGetUser["data"];

type AuthContextType = {
    user: UserData;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ProviderProps = {
    children: ReactNode;
};

//Provider
export default function AuthProvider({ children }: ProviderProps) {
    const [user, setUser] = useState<UserData>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/db", {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Error getting user data");
            }

            const data = await res.json();
            setUser(data);
        } catch (err) {
            setUser(null);
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, error, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

//Custom hook
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}

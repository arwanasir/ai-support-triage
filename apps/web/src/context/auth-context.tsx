'use client'

import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
    id: string,
    name: string,
    email: string,
    role: "admin" | "agent"
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
}

const MOCK_USER: User = {
    id: "",
    name: "",
    email: "",
    role: "agent"

}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(MOCK_USER);

    const login = () => setUser(MOCK_USER);
    const logout = () => setUser(null)

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within the AuthProvider")
    }
    return context;
}
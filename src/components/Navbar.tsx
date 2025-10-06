"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me", { credentials: "include" });
                setIsLoggedIn(res.ok);
            } catch {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            setIsLoggedIn(false);
            router.push("/");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 flex justify-between items-center h-16">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-lg sm:text-xl font-bold text-gray-900  transition-colors duration-300"
                >
                    🔐 Password Vault
                </Link>

                {/* Controls */}
                <div className="flex items-center gap-4">
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-md bg-red-500 text-white text-sm hover:bg-red-600 transition-colors duration-200"
                        >
                            Logout
                        </button>
                    )}
                    {/* <ThemeToggle /> */}
                </div>
            </div>
        </nav>
    );
}

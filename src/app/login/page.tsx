"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaSpinner, FaExclamationCircle } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const router = useRouter();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";
        if (!password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to login");
            }

            toast.success("Logged in successfully! Redirecting...");
            setEmail("");
            setPassword("");
            setErrors({});
            router.push("/dashboard");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed");
            setErrors({ email: err instanceof Error ? err.message : "Login failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6 transform transition-all hover:scale-[1.02] duration-300"
                aria-label="Login form"
            >
                <h1 className="text-2xl font-bold text-gray-900 text-center">Log In to Your Account</h1>

                {/* Email Input */}
                <div className="relative">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.email ? "border-red-500" : "border-gray-300"
                            } bg-gray-50 text-gray-900 placeholder-gray-400`}
                        disabled={loading}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <div id="email-error" className="absolute text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FaExclamationCircle />
                            {errors.email}
                        </div>
                    )}
                </div>

                {/* Password Input */}
                <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.password ? "border-red-500" : "border-gray-300"
                            } bg-gray-50 text-gray-900 placeholder-gray-400`}
                        disabled={loading}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                    />
                    {errors.password && (
                        <div id="password-error" className="absolute text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FaExclamationCircle />
                            {errors.password}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    aria-label="Submit login form"
                >
                    {loading && <FaSpinner className="animate-spin" />}
                    {loading ? "Logging in..." : "Log In"}
                </button>

                {/* Footer Link */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Don’t have an account?{" "}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Sign up
                    </a>
                </p>
            </form>
        </div>
    );
}
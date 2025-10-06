"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";  
export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });  
        if (res.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleRedirect = () => {
    if (isLoggedIn) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Navbar />

     <main className="min-h-screen flex flex-col items-center justify-center bg-gray-200   text-black   px-6 transition-colors duration-300">
  {/* Hero */}
  <section className="text-center max-w-2xl mt-20">
    <h1 className="text-4xl font-bold mb-4">🔐 Password Vault</h1>
     
    <div className="flex gap-4 justify-center">
      <Link
        href={isLoggedIn ? "/dashboard" : "/signup"}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Get Started
      </Link>
      <Link
        href={isLoggedIn ? "/dashboard" : "/login"}
        className="px-6 py-3 bg-blue-600   rounded-lg  text-white   hover:bg-blue-700 transition-colors"
      >
        Login
      </Link>
    </div>
  </section>

  {/* Features */}
  <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl">
    {[
      { icon: "🔑", title: "Password Generator", desc: "Customizable length & rules." },
      { icon: "🔐", title: "Encrypted Vault", desc: "Your data never leaves unencrypted." },
      { icon: "🖱️", title: "Copy & Auto-Clear", desc: "Clipboard clears in 10s." },
      { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes anytime." },
    ].map((f, i) => (
      <div key={i} className="p-6 border rounded-lg bg-white   shadow transition-colors">
        <div className="text-3xl mb-2">{f.icon}</div>
        <h3 className="text-xl font-semibold mb-1">{f.title}</h3>
        <p className="text-sm">{f.desc}</p>
      </div>
    ))}
  </section>

  {/* CTA */}
  <section className="mt-20 text-center">
    <h2 className="text-2xl font-bold mb-4">Ready to secure your passwords?</h2>
    <Link
      href={isLoggedIn ? "/dashboard" : "/signup"}
      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Create Free Account
    </Link>
  </section>
</main>

    </>
  );
}

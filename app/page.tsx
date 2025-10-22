"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
        } else {
          setError("Please check your email to confirm your account");
        }
      }
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #0088a9 75%, #00587a 100%)" }}>
      <div className="w-full max-w-md">
        {/* Dalyan Header */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-8 border-white shadow-2xl mx-auto mb-4">
            <img src="/dalyan-tombs.jpeg" alt="Dalyan" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 leading-tight" style={{ textShadow: "3px 3px 6px rgba(0,0,0,0.4)" }}>
            <span className="whitespace-nowrap">🇹🇷 Dalyan Quiz</span>
            <br />
            <span className="whitespace-nowrap">Night 🇹🇷</span>
          </h1>
          <p className="text-xl text-white font-bold drop-shadow-md">
            Hoş geldiniz! Welcome!
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full border-4 border-orange-400 shadow-2xl bg-white">
          <CardHeader className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-b-4 border-white rounded-t-lg">
            <CardTitle className="text-3xl font-bold text-center text-white drop-shadow-lg">
              {isLogin ? "🔐 Sign In" : "✨ Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-white text-lg font-medium">
              {isLogin ? "Welcome back to quiz night!" : "Join the quiz night fun!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAuth} className="space-y-5">
              <div className="space-y-2">
                <label className="text-base font-bold text-gray-900" htmlFor="email">
                  📧 Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-lg font-medium border-2 border-orange-300 focus:border-orange-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-gray-900" htmlFor="password">
                  🔑 Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="text-lg font-medium border-2 border-orange-300 focus:border-orange-500"
                />
                <p className="text-sm text-gray-600 font-medium">Minimum 6 characters</p>
              </div>
              {error && (
                <div className="text-base font-bold text-red-700 bg-red-100 p-3 rounded-lg border-2 border-red-300">
                  ⚠️ {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl py-6 border-4 border-white shadow-xl" 
                disabled={loading}
                size="lg"
              >
                {loading ? "⏳ Loading..." : isLogin ? "🚀 Sign In" : "✨ Sign Up"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-lg font-bold text-orange-600 hover:text-orange-800 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up →" : "← Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white text-lg font-bold drop-shadow-lg">
            🎯 Create amazing quiz nights with AI-powered questions!
          </p>
        </div>
      </div>
    </div>
  );
}

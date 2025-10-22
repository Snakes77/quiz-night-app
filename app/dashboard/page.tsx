"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Quiz } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    loadQuizzes();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/");
    } else {
      setUser(session.user);
    }
  };

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error("Error loading quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const { error } = await supabase
        .from("quizzes")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert("Failed to delete quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #0088a9 75%, #00587a 100%)" }}>
      {/* Turkish-themed Header */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 shadow-xl border-b-8 border-white">
        <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img src="/dalyan-tombs.jpeg" alt="Dalyan" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white drop-shadow-lg" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
                🇹🇷 Dalyan Quiz Night 🇹🇷
              </h1>
              <p className="text-xl text-white font-medium mt-1 drop-shadow-md">
                Hoş geldiniz! {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="text-lg font-bold bg-white text-red-700 border-3 border-white hover:bg-red-50 px-6 py-3"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">

        <div className="mb-8">
          <Link href="/quiz/new">
            <Button size="lg" className="text-xl font-bold px-10 py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-xl border-2 border-white">
              ✨ Create New Quiz ✨
            </Button>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                No quizzes yet. Create your first quiz to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-2xl transition-all hover:scale-105 bg-white border-4 border-orange-400 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b-4 border-orange-300">
                  <CardTitle className="text-2xl text-gray-900 font-bold">{quiz.name}</CardTitle>
                  <CardDescription className="text-base text-gray-900 font-medium">
                    📅 Created {new Date(quiz.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <Link href={`/quiz/${quiz.id}`}>
                    <Button variant="default" className="w-full text-base font-bold py-6 bg-blue-600 hover:bg-blue-700 border-2 border-blue-800">
                      ✏️ Edit Quiz
                    </Button>
                  </Link>
                  <Link href={`/quiz/${quiz.id}/present`}>
                    <Button variant="secondary" className="w-full text-base font-bold py-6 bg-green-600 hover:bg-green-700 text-white border-2 border-green-800">
                      🎬 Present Mode
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full text-base font-bold py-6 border-2 border-red-800"
                    onClick={() => handleDelete(quiz.id)}
                  >
                    🗑️ Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

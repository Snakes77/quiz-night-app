"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Quiz, type Round, type Question } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuizWithRounds = Quiz & {
  rounds: (Round & { questions: Question[] })[];
};

export default function ViewQuiz({ params }: { params: Promise<{ id: string }> }) {
  const [quiz, setQuiz] = useState<QuizWithRounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizId, setQuizId] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    params.then(p => {
      setQuizId(p.id);
      loadQuiz(p.id);
    });
  }, [params]);

  const loadQuiz = async (id: string) => {
    try {
      // Load quiz
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) throw quizError;

      // Load rounds
      const { data: roundsData, error: roundsError } = await supabase
        .from("rounds")
        .select("*")
        .eq("quiz_id", id)
        .order("round_number");

      if (roundsError) throw roundsError;

      // Load questions for each round
      const roundsWithQuestions = await Promise.all(
        roundsData.map(async (round) => {
          const { data: questions, error: questionsError } = await supabase
            .from("questions")
            .select("*")
            .eq("round_id", round.id)
            .order("question_number");

          if (questionsError) throw questionsError;

          return { ...round, questions };
        })
      );

      setQuiz({ ...quizData, rounds: roundsWithQuestions });
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Failed to load quiz");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #0088a9 75%, #00587a 100%)" }}>
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 shadow-xl border-b-8 border-white p-6 mb-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">🇹🇷 {quiz.name}</h1>
            <p className="text-xl text-white font-medium mt-2 drop-shadow-md">
              📅 Created {new Date(quiz.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push("/dashboard")} variant="outline" size="lg" className="text-base font-bold bg-white text-red-700 border-2 border-white hover:bg-red-50 px-6">
              ← Back to Dashboard
            </Button>
            <Link href={`/quiz/${quiz.id}/present`}>
              <Button size="lg" className="text-base font-bold bg-green-600 hover:bg-green-700 border-2 border-white px-6">🎬 Start Presentation</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">

        {/* Print Buttons */}
        <div className="mb-8 bg-white rounded-xl p-6 shadow-2xl border-4 border-orange-400">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🖨️ Print Handouts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/quiz/${quiz.id}/print/answer-sheet`} target="_blank">
              <Button size="lg" className="w-full text-base font-bold bg-blue-600 hover:bg-blue-700 border-2 border-blue-800">
                📄 Team Answer Sheets
              </Button>
            </Link>
            <Link href={`/quiz/${quiz.id}/print/picture-round`} target="_blank">
              <Button size="lg" className="w-full text-base font-bold bg-purple-600 hover:bg-purple-700 border-2 border-purple-800">
                🖼️ Picture Round Grid
              </Button>
            </Link>
            <Link href={`/quiz/${quiz.id}/print/master-sheet`} target="_blank">
              <Button size="lg" className="w-full text-base font-bold bg-red-600 hover:bg-red-700 border-2 border-red-800">
                📋 Quiz Master Sheet
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-700 mt-4 font-medium">
            💡 Tip: Print answer sheets for each team, picture rounds for everyone, and keep the master sheet for yourself!
          </p>
        </div>

        <div className="space-y-8">
          {quiz.rounds.map((round, roundIdx) => (
            <Card key={round.id} className="bg-white border-4 border-orange-400 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b-4 border-orange-300">
                <CardTitle className="text-3xl text-gray-900 font-bold">
                  🎯 Round {round.round_number}: {round.theme}
                </CardTitle>
                <div className="text-lg text-gray-900 font-bold">
                  📝 {round.questions.length} questions
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {round.questions.map((question, qIdx) => (
                    <div
                      key={question.id}
                      className="border-l-8 border-blue-600 pl-6 py-4 bg-blue-50 rounded-r-lg shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900">
                            ❓ Q{question.question_number}: {question.question_text}
                          </div>
                          <div className="text-green-800 font-bold text-lg mt-2 bg-green-100 p-2 rounded">
                            ✅ A: {question.answer_text}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <span className="text-base font-bold bg-purple-500 text-white px-3 py-1 rounded-full shadow">
                              {question.type}
                            </span>
                            {question.spotify_preview_url && (
                              <span className="text-base font-bold bg-green-500 text-white px-3 py-1 rounded-full shadow">
                                🎵 Spotify preview
                              </span>
                            )}
                            {question.youtube_video_id && (
                              <span className="text-base font-bold bg-red-500 text-white px-3 py-1 rounded-full shadow">
                                🎬 YouTube clip ({question.youtube_start_seconds}s-
                                {question.youtube_end_seconds}s)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

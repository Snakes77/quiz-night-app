"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Quiz, type Round, type Question } from "@/lib/supabase";

type QuizWithRounds = Quiz & {
  rounds: (Round & { questions: Question[] })[];
};

export default function PrintPictureRound({ params }: { params: Promise<{ id: string }> }) {
  const [quiz, setQuiz] = useState<QuizWithRounds | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    params.then(p => {
      loadQuiz(p.id);
    });
  }, [params]);

  const loadQuiz = async (id: string) => {
    try {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (quizError) throw quizError;

      const { data: roundsData, error: roundsError } = await supabase
        .from("rounds")
        .select("*")
        .eq("quiz_id", id)
        .order("round_number");

      if (roundsError) throw roundsError;

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

  useEffect(() => {
    // Auto-print when page loads
    if (!loading && quiz) {
      setTimeout(() => window.print(), 1000);
    }
  }, [loading, quiz]);

  if (loading || !quiz) {
    return <div className="p-8">Loading...</div>;
  }

  const pictureRounds = quiz.rounds.filter(r => r.questions.some(q => q.image_url));

  if (pictureRounds.length === 0) {
    return (
      <div className="p-8">
        <p>No picture rounds found in this quiz.</p>
      </div>
    );
  }

  return (
    <div className="print-container">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
        @media screen {
          .print-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
        }
      `}</style>

      {pictureRounds.map((round, roundIdx) => (
        <div key={round.id} className={roundIdx > 0 ? "page-break" : ""}>
          <div className="p-6 bg-white">
            {/* Header */}
            <div className="border-4 border-red-600 p-4 mb-4 bg-gradient-to-r from-red-50 to-orange-50">
              <h1 className="text-3xl font-bold text-center text-red-700">
                🇹🇷 {quiz.name} 🇹🇷
              </h1>
              <h2 className="text-2xl font-bold text-center text-orange-600 mt-2">
                Round {round.round_number}: {round.theme}
              </h2>
            </div>

            {/* Team Name */}
            <div className="mb-4 border-2 border-orange-400 p-3 bg-orange-50">
              <label className="text-xl font-bold text-gray-900">Team Name:</label>
              <div className="border-b-2 border-gray-400 mt-1 h-10"></div>
            </div>

            {/* Picture Grid (2x5) */}
            <div className="grid grid-cols-2 gap-4">
              {round.questions.filter(q => q.image_url).map((question, qIdx) => (
                <div key={question.id} className="border-4 border-blue-400 p-2 bg-blue-50">
                  <div className="text-center font-bold text-xl mb-2 text-gray-900">
                    {question.question_number}
                  </div>
                  <div className="bg-white p-1 mb-2">
                    <img
                      src={question.image_url}
                      alt={`Picture ${question.question_number}`}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <label className="text-sm font-bold">Answer:</label>
                    <div className="border-b-2 border-gray-600 mt-1 h-8"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center text-gray-600 text-sm border-t-2 pt-2">
              <p>Dalyan Quiz Night • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

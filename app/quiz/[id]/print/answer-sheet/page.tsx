"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Quiz, type Round, type Question } from "@/lib/supabase";

type QuizWithRounds = Quiz & {
  rounds: (Round & { questions: Question[] })[];
};

export default function PrintAnswerSheet({ params }: { params: Promise<{ id: string }> }) {
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
      setTimeout(() => window.print(), 500);
    }
  }, [loading, quiz]);

  if (loading || !quiz) {
    return <div className="p-8">Loading...</div>;
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

      {/* Team Answer Sheet */}
      <div className="p-8 bg-white">
        {/* Header */}
        <div className="border-4 border-red-600 p-6 mb-6 bg-gradient-to-r from-red-50 to-orange-50">
          <h1 className="text-4xl font-bold text-center text-red-700 mb-2">
            🇹🇷 {quiz.name} 🇹🇷
          </h1>
          <div className="text-center text-xl font-bold text-gray-800">Dalyan Quiz Night</div>
        </div>

        {/* Team Name */}
        <div className="mb-8 border-2 border-orange-400 p-4 bg-orange-50">
          <label className="text-2xl font-bold text-gray-900">Team Name:</label>
          <div className="border-b-2 border-gray-400 mt-2 h-12"></div>
        </div>

        {/* Rounds - Dynamic Layout */}
        {quiz.rounds.map((round, roundIdx) => {
          const questionCount = round.questions.length;
          const useCompactLayout = questionCount > 10;
          const columnsCount = useCompactLayout ? 4 : 2;

          return (
            <div key={round.id} className="mb-6">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-2 mb-3 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">
                    Round {round.round_number}: {round.theme}
                  </h2>
                  <p className="text-sm">({questionCount} questions)</p>
                </div>
                <div className="bg-white text-gray-900 px-4 py-2 rounded font-bold">
                  Score: ____
                </div>
              </div>

              <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columnsCount}, 1fr)` }}>
                {round.questions.map((question) => (
                  <div key={question.id} className="flex items-center">
                    <div className="w-8 text-base font-bold text-gray-700">{question.question_number}.</div>
                    <div className="flex-1 border-b-2 border-gray-400 h-8"></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm border-t-2 pt-4">
          <p>Good luck! • Dalyan Quiz Night • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

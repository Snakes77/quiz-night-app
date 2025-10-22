"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Quiz, type Round, type Question } from "@/lib/supabase";

type QuizWithRounds = Quiz & {
  rounds: (Round & { questions: Question[] })[];
};

export default function PrintMasterSheet({ params }: { params: Promise<{ id: string }> }) {
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

      const { data: roundsData, error: roundsError} = await supabase
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
            page-break-after: always;
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

      <div className="p-6 bg-white">
        {/* Header */}
        <div className="border-4 border-red-600 p-4 mb-6 bg-gradient-to-r from-red-50 to-orange-50">
          <h1 className="text-4xl font-bold text-center text-red-700 mb-2">
            🇹🇷 {quiz.name} - QUIZ MASTER SHEET 🇹🇷
          </h1>
          <div className="text-center text-xl font-bold text-gray-800">
            Questions & Answers • Dalyan Quiz Night
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Rounds */}
        {quiz.rounds.map((round, roundIdx) => (
          <div key={round.id} className="mb-8">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-3 mb-4">
              <h2 className="text-2xl font-bold">
                Round {round.round_number}: {round.theme}
              </h2>
              <p className="text-base">({round.questions.length} questions)</p>
            </div>

            <div className="space-y-4">
              {round.questions.map((question) => (
                <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                  <div className="font-bold text-lg text-gray-900 mb-1">
                    Q{question.question_number}: {question.question_text}
                  </div>
                  <div className="bg-green-100 border-l-4 border-green-600 pl-3 py-2 mt-2">
                    <span className="font-bold text-green-800">ANSWER:</span>{" "}
                    <span className="text-green-900 font-bold text-lg">
                      {question.answer_text}
                    </span>
                  </div>
                  {question.image_url && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      🖼️ Picture question
                    </div>
                  )}
                  {question.youtube_video_id && (
                    <div className="mt-2 text-sm text-gray-600 italic">
                      🎬 YouTube clip: {question.youtube_start_seconds}s - {question.youtube_end_seconds}s
                    </div>
                  )}
                </div>
              ))}
            </div>

            {roundIdx < quiz.rounds.length - 1 && <div className="page-break"></div>}
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm border-t-2 pt-4">
          <p className="font-bold">CONFIDENTIAL - Quiz Master Only</p>
          <p>Dalyan Quiz Night • Keep answers secret until revealed!</p>
        </div>
      </div>
    </div>
  );
}

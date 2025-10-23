"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import YouTube from "react-youtube";
import { supabase, type Quiz, type Round, type Question } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type QuizWithRounds = Quiz & {
  rounds: (Round & { questions: Question[] })[];
};

export default function PresentQuiz({ params }: { params: Promise<{ id: string }> }) {
  const [quiz, setQuiz] = useState<QuizWithRounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quizId, setQuizId] = useState<string>("");
  const router = useRouter();
  const youtubePlayer = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    params.then(p => {
      setQuizId(p.id);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const goNext = () => {
    setShowAnswer(false);
    setShowAllAnswers(false);

    if (!quiz) return;

    const currentRoundData = quiz.rounds[currentRound];
    const isPictureRound = currentRoundData.questions.every(q => q.type === "picture");

    // For picture rounds, skip to next round
    if (isPictureRound) {
      if (currentRound < quiz.rounds.length - 1) {
        setCurrentRound(currentRound + 1);
        setCurrentQuestion(0);
      }
    } else {
      // Standard navigation for non-picture rounds
      if (currentQuestion < currentRoundData.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentRound < quiz.rounds.length - 1) {
        setCurrentRound(currentRound + 1);
        setCurrentQuestion(0);
      }
    }
  };

  const goPrevious = () => {
    setShowAnswer(false);
    setShowAllAnswers(false);

    const currentRoundData = quiz?.rounds[currentRound];
    const isPictureRound = currentRoundData?.questions.every(q => q.type === "picture");

    // For picture rounds, skip to previous round
    if (isPictureRound) {
      if (currentRound > 0) {
        setCurrentRound(currentRound - 1);
        setCurrentQuestion(0);
      }
    } else {
      // Standard navigation for non-picture rounds
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      } else if (currentRound > 0) {
        setCurrentRound(currentRound - 1);
        setCurrentQuestion(quiz!.rounds[currentRound - 1].questions.length - 1);
      }
    }
  };

  const playSpotifyPreview = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const onYouTubeReady = (event: any) => {
    youtubePlayer.current = event.target;
  };

  const playYouTubeClip = () => {
    if (youtubePlayer.current && question) {
      youtubePlayer.current.seekTo(question.youtube_start_seconds || 0);
      youtubePlayer.current.playVideo();

      // Stop at end time
      const endTime = question.youtube_end_seconds || 30;
      const startTime = question.youtube_start_seconds || 0;
      const duration = endTime - startTime;

      setTimeout(() => {
        if (youtubePlayer.current) {
          youtubePlayer.current.pauseVideo();
        }
      }, duration * 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Loading presentation...</div>
      </div>
    );
  }

  if (!quiz || quiz.rounds.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">No quiz data found</div>
      </div>
    );
  }

  const round = quiz.rounds[currentRound];
  const question = round?.questions[currentQuestion];

  if (!round || !question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Quiz completed!</div>
        <Button onClick={() => router.push(`/quiz/${quiz.id}`)} className="ml-4">
          Exit Presentation
        </Button>
      </div>
    );
  }

  const progress = `Round ${currentRound + 1} - Question ${currentQuestion + 1} of ${round.questions.length}`;
  
  // Check if this is a picture round with multiple images
  const isPictureRound = round.questions.every(q => q.type === "picture");
  const pictureCount = round.questions.length;

  // Determine grid columns based on picture count
  const getGridColumns = () => {
    if (pictureCount === 15) return 3; // 3x5 grid
    if (pictureCount === 12) return 4; // 4x3 grid
    if (pictureCount === 20) return 4; // 4x5 grid
    if (pictureCount === 10) return 2; // 2x5 grid
    if (pictureCount === 5) return 1;  // 1x5 grid
    return 3; // Default 3 columns
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #0088a9 75%, #00587a 100%)" }}>
      {/* Turkish-themed Header */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 border-b-8 border-white p-4 flex justify-between items-center shadow-2xl">
        <div>
          <div className="text-3xl font-bold text-white drop-shadow-lg">🇹🇷 {quiz.name}</div>
          <div className="text-lg text-white font-bold drop-shadow-md">{isPictureRound ? `Round ${currentRound + 1} - ${round.theme} (${pictureCount} Pictures)` : progress}</div>
        </div>
        <div className="flex gap-3">
          <Button onClick={toggleFullscreen} variant="outline" size="lg" className="text-lg font-bold bg-white text-red-700 border-2 border-white hover:bg-red-50">
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="default" size="lg" className="bg-white hover:bg-red-50 text-red-700 text-lg font-bold px-6 border-2 border-white">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isPictureRound ? (
        /* Picture Sheet View - All images at once */
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-8 bg-white rounded-3xl p-6 shadow-2xl border-4 border-orange-400">
            <div className="text-4xl font-bold text-orange-600">
              🖼️ {round.theme}
            </div>
            <p className="text-xl text-gray-900 font-bold mt-2">
              Identify all {pictureCount} pictures
            </p>
          </div>

          {/* Picture Grid */}
          <div 
            className="grid gap-4 mb-8"
            style={{ gridTemplateColumns: `repeat(${getGridColumns()}, minmax(0, 1fr))` }}
          >
            {round.questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-2xl border-4 border-blue-400 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3">
                  <div className="text-3xl font-bold">{idx + 1}</div>
                </div>
                <div className="p-2 flex items-center justify-center bg-gray-50" style={{ minHeight: "200px" }}>
                  {q.image_url ? (
                    <img
                      src={q.image_url}
                      alt={`Picture ${idx + 1}`}
                      className="max-w-full max-h-64 object-contain rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='20'%3EImage not available%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-center p-4">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="font-bold">No image</div>
                    </div>
                  )}
                </div>
                {showAllAnswers && (
                  <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-3 border-t-4 border-green-800">
                    <div className="text-xl font-bold">✅ {q.answer_text}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Controls for Picture Round */}
          <div className="flex justify-center gap-6">
            <Button
              onClick={goPrevious}
              disabled={currentRound === 0}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xl px-10 py-6 border-4 border-gray-400 shadow-xl"
            >
              ⬅️ Previous Round
            </Button>

            <Button
              onClick={() => setShowAllAnswers(!showAllAnswers)}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-2xl px-16 py-6 border-4 border-white shadow-2xl"
            >
              {showAllAnswers ? "❌ Hide All Answers" : "✨ Show All Answers"}
            </Button>

            <Button
              onClick={goNext}
              disabled={currentRound === quiz.rounds.length - 1}
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xl px-10 py-6 border-4 border-gray-400 shadow-xl"
            >
              Next Round ➡️
            </Button>
          </div>
        </div>
      ) : (
        /* Standard Question-by-Question View */
        <div className="container mx-auto px-8 py-16 max-w-5xl">
        <div className="text-center mb-12 bg-white rounded-3xl p-8 shadow-2xl border-4 border-orange-400">
          <div className="text-5xl font-bold mb-4 text-orange-600">
            🎯 {round.theme}
          </div>
          <div className="text-6xl font-bold mb-8 leading-tight text-gray-900">
            ❓ {question.question_text}
          </div>
        </div>

        {/* Picture Round - Display Image */}
        {question.type === "picture" && question.image_url && (
          <div className="flex justify-center mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-orange-400">
              <img
                src={question.image_url}
                alt="Picture round question"
                className="max-w-2xl max-h-96 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Media Player */}
        {(question.type === "music" || question.type === "film") && question.youtube_video_id && (
          <div className="flex justify-center mb-8">
            <div className="bg-black bg-opacity-50 p-8 rounded-lg">
              <YouTube
                videoId={question.youtube_video_id}
                opts={{
                  height: "390",
                  width: "640",
                  playerVars: {
                    autoplay: 0,
                    controls: 1,
                  },
                }}
                onReady={onYouTubeReady}
              />
              <Button onClick={playYouTubeClip} size="lg" className="w-full mt-4">
                Play Clip ({question.youtube_start_seconds}s - {question.youtube_end_seconds}s)
              </Button>
            </div>
          </div>
        )}

        {/* Answer Section */}
        {showAnswer && (
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-10 rounded-3xl inline-block shadow-2xl border-4 border-white">
              <div className="text-3xl font-bold mb-2 text-white">✅ Answer:</div>
              <div className="text-6xl font-bold text-white drop-shadow-lg">{question.answer_text}</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-6 mt-12">
          <Button
            onClick={goPrevious}
            disabled={currentRound === 0 && currentQuestion === 0}
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xl px-10 py-6 border-4 border-gray-400 shadow-xl"
          >
            ⬅️ Previous
          </Button>

          <Button
            onClick={() => setShowAnswer(!showAnswer)}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-2xl px-16 py-6 border-4 border-white shadow-2xl"
          >
            {showAnswer ? "❌ Hide Answer" : "✨ Show Answer"}
          </Button>

          <Button
            onClick={goNext}
            disabled={
              currentRound === quiz.rounds.length - 1 &&
              currentQuestion === round.questions.length - 1
            }
            size="lg"
            className="bg-white text-gray-900 hover:bg-gray-100 font-bold text-xl px-10 py-6 border-4 border-gray-400 shadow-xl"
          >
            Next ➡️
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12">
          <div className="bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all"
              style={{
                width: `${
                  ((currentRound * 20 + currentQuestion + 1) /
                    (quiz.rounds.length * 20)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

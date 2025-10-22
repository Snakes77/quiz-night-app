"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuestionType = "general" | "music" | "film" | "history" | "geography" | "science" | "sports" | "food" | "decades" | "picture";

type GeneratedQuestion = {
  question: string;
  answer: string;
  type: QuestionType;
  searchTerm?: string;
  spotifyPreviewUrl?: string;
  youtubeVideoId?: string;
  youtubeStartSeconds?: number;
  youtubeEndSeconds?: number;
  imageUrl?: string;
};

type DifficultyLevel = "easy" | "medium" | "hard";

type Round = {
  theme: string;
  prompt: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionCount: number;
  imageCount?: number; // For picture rounds only (1-20 images)
  questions: GeneratedQuestion[];
  generating: boolean;
};

export default function NewQuiz() {
  const [quizName, setQuizName] = useState("");
  const [numberOfRounds, setNumberOfRounds] = useState(4);
  const [rounds, setRounds] = useState<Round[]>([
    { theme: "", prompt: "", type: "general", difficulty: "medium", questionCount: 20, questions: [], generating: false },
    { theme: "", prompt: "", type: "general", difficulty: "medium", questionCount: 20, questions: [], generating: false },
    { theme: "", prompt: "", type: "general", difficulty: "medium", questionCount: 20, questions: [], generating: false },
    { theme: "", prompt: "", type: "general", difficulty: "medium", questionCount: 20, questions: [], generating: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [selectedRound, setSelectedRound] = useState(0);
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<any[]>([]);
  const [selectingVideoFor, setSelectingVideoFor] = useState<number | null>(null);
  const router = useRouter();

  // Update rounds when number of rounds changes
  const handleRoundsChange = (count: number) => {
    setNumberOfRounds(count);
    const newRounds: Round[] = [];
    for (let i = 0; i < count; i++) {
      newRounds.push(
        rounds[i] || { theme: "", prompt: "", type: "general", difficulty: "medium", questionCount: 20, questions: [], generating: false }
      );
    }
    setRounds(newRounds);
    if (selectedRound >= count) {
      setSelectedRound(count - 1);
    }
  };

  const updateRound = (index: number, updates: Partial<Round>) => {
    const newRounds = [...rounds];
    newRounds[index] = { ...newRounds[index], ...updates };
    setRounds(newRounds);
  };

  const generateQuestions = async (roundIndex: number) => {
    const round = rounds[roundIndex];
    if (!round.prompt || !round.theme) {
      alert("Please fill in theme and prompt first");
      return;
    }

    updateRound(roundIndex, { generating: true });

    try {
      // Generate questions with Gemini
      const geminiResponse = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: round.prompt, 
          type: round.type, 
          difficulty: round.difficulty, 
          count: round.questionCount,
          imageCount: round.imageCount // For picture rounds
        }),
      });

      if (!geminiResponse.ok) {
        throw new Error("Failed to generate questions");
      }

      const { questions } = await geminiResponse.json();

      // Process music questions - use YouTube instead of Spotify
      if (round.type === "music") {
        for (const question of questions) {
          if (question.searchTerm) {
            try {
              const youtubeResponse = await fetch("/api/youtube/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ searchTerm: question.searchTerm + " official audio" }),
              });

              if (youtubeResponse.ok) {
                const { videos } = await youtubeResponse.json();
                if (videos && videos.length > 0) {
                  // Automatically select the first video and set default times
                  question.youtubeVideoId = videos[0].videoId;
                  question.youtubeStartSeconds = 30; // Start at 30 seconds
                  question.youtubeEndSeconds = 60; // Play for 30 seconds
                }
              }
            } catch (error) {
              console.error("YouTube search failed for:", question.searchTerm);
            }
          }
        }
      }

      // Process picture round questions - fetch images from Google
      if (round.type === "picture") {
        for (const question of questions) {
          if (question.searchTerm) {
            try {
              const imageResponse = await fetch("/api/google-images/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ searchTerm: question.searchTerm }),
              });

              if (imageResponse.ok) {
                const { images } = await imageResponse.json();
                if (images && images.length > 0) {
                  // Automatically select the first image
                  question.imageUrl = images[0].url;
                }
              }
            } catch (error) {
              console.error("Image search failed for:", question.searchTerm);
            }
          }
        }
      }

      updateRound(roundIndex, { questions, generating: false });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      alert(error.message || "Failed to generate questions");
      updateRound(roundIndex, { generating: false });
    }
  };

  const searchYouTube = async (roundIndex: number, questionIndex: number) => {
    const question = rounds[roundIndex].questions[questionIndex];
    if (!question.searchTerm) {
      alert("No search term available");
      return;
    }

    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchTerm: question.searchTerm }),
      });

      if (!response.ok) throw new Error("YouTube search failed");

      const { videos } = await response.json();
      setYoutubeSearchResults(videos);
      setSelectingVideoFor(questionIndex);
    } catch (error) {
      console.error("YouTube search error:", error);
      alert("Failed to search YouTube");
    }
  };

  const selectYouTubeVideo = (roundIndex: number, questionIndex: number, videoId: string) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].questions[questionIndex].youtubeVideoId = videoId;
    newRounds[roundIndex].questions[questionIndex].youtubeStartSeconds = 0;
    newRounds[roundIndex].questions[questionIndex].youtubeEndSeconds = 30;
    setRounds(newRounds);
    setYoutubeSearchResults([]);
    setSelectingVideoFor(null);
  };

  const updateQuestion = (roundIndex: number, questionIndex: number, updates: Partial<GeneratedQuestion>) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].questions[questionIndex] = {
      ...newRounds[roundIndex].questions[questionIndex],
      ...updates,
    };
    setRounds(newRounds);
  };

  const deleteQuestion = (roundIndex: number, questionIndex: number) => {
    const newRounds = [...rounds];
    newRounds[roundIndex].questions.splice(questionIndex, 1);
    setRounds(newRounds);
  };

  const saveQuiz = async () => {
    if (!quizName) {
      alert("Please enter a quiz name");
      return;
    }

    // Validate all rounds have questions
    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].questions.length === 0) {
        alert(`Round ${i + 1} has no questions. Please generate questions for all rounds.`);
        return;
      }
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("You must be logged in");
        router.push("/");
        return;
      }

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({ name: quizName, user_id: session.user.id })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create rounds and questions
      for (let i = 0; i < rounds.length; i++) {
        const { data: round, error: roundError } = await supabase
          .from("rounds")
          .insert({
            quiz_id: quiz.id,
            round_number: i + 1,
            theme: rounds[i].theme,
          })
          .select()
          .single();

        if (roundError) throw roundError;

        // Insert all questions for this round
        const questionsToInsert = rounds[i].questions.map((q, idx) => ({
          round_id: round.id,
          question_number: idx + 1,
          question_text: q.question,
          answer_text: q.answer,
          type: q.type,
          spotify_preview_url: q.spotifyPreviewUrl || null,
          youtube_video_id: q.youtubeVideoId || null,
          youtube_start_seconds: q.youtubeStartSeconds || null,
          youtube_end_seconds: q.youtubeEndSeconds || null,
          image_url: q.imageUrl || null,
        }));

        const { error: questionsError } = await supabase
          .from("questions")
          .insert(questionsToInsert);

        if (questionsError) throw questionsError;
      }

      alert("Quiz saved successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error saving quiz:", error);
      alert(error.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const currentRound = rounds[selectedRound];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #fdc830 50%, #0088a9 75%, #00587a 100%)" }}>
      {/* Turkish-themed Header */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-red-700 shadow-xl border-b-8 border-white p-6 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-6">🇹🇷 Create New Quiz</h1>
          <div className="space-y-4">
            <div className="flex gap-4 items-center flex-wrap">
              <Input
                placeholder="Quiz Name (e.g., Friday Night Quiz - Jan 2025)"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                className="max-w-md text-lg font-bold"
              />
              <div className="flex items-center gap-3 bg-white rounded-lg px-4 py-2 shadow-lg">
                <label className="text-lg font-bold text-gray-900 whitespace-nowrap">Number of Rounds:</label>
                <select
                  value={numberOfRounds}
                  onChange={(e) => handleRoundsChange(parseInt(e.target.value))}
                  className="h-12 px-4 py-2 border-2 border-orange-400 rounded-md text-lg text-gray-900 font-bold bg-white"
                >
                  <option value="1">1 Round</option>
                  <option value="2">2 Rounds</option>
                  <option value="3">3 Rounds</option>
                  <option value="4">4 Rounds</option>
                  <option value="5">5 Rounds</option>
                  <option value="6">6 Rounds</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/dashboard")} variant="outline" size="lg" className="text-base font-bold bg-white text-red-700 border-2 border-white hover:bg-red-50 px-6">
                ← Cancel
              </Button>
              <Button onClick={saveQuiz} disabled={saving} size="lg" className="text-base font-bold bg-green-600 hover:bg-green-700 border-2 border-white px-8">
                {saving ? "💾 Saving..." : "💾 Save Quiz"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 pb-8">

        <div className="grid grid-cols-4 gap-4 mb-8">
          {rounds.map((round, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedRound === idx
                  ? "ring-4 ring-orange-500 bg-gradient-to-r from-orange-100 to-yellow-100 border-4 border-orange-500 shadow-2xl"
                  : "bg-white border-2 border-gray-300 hover:border-orange-300"
              }`}
              onClick={() => setSelectedRound(idx)}
            >
              <CardContent className="p-4">
                <div className="font-bold text-xl text-gray-900">🎯 Round {idx + 1}</div>
                <div className="text-base text-gray-900 font-medium mt-1">
                  {round.theme || "No theme"}
                </div>
                <div className="text-sm text-gray-900 font-bold mt-2 bg-blue-200 px-2 py-1 rounded">
                  📝 {round.questions.length} questions
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white border-4 border-orange-400 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b-4 border-orange-300">
            <CardTitle className="text-3xl text-gray-900">🎯 Round {selectedRound + 1} Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">📌 Round Theme</label>
              <Input
                placeholder="e.g., 90s Britpop"
                value={currentRound.theme}
                onChange={(e) => updateRound(selectedRound, { theme: e.target.value })}
                className="text-lg font-bold"
              />
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">📋 Question Topic</label>
              <select
                className="w-full h-12 px-4 py-2 border-2 border-orange-400 rounded-md text-lg text-gray-900 font-bold bg-white"
                value={currentRound.type}
                onChange={(e) =>
                  updateRound(selectedRound, { type: e.target.value as QuestionType })
                }
              >
                <option value="general">📚 General Knowledge</option>
                <option value="history">🏛️ History</option>
                <option value="geography">🌍 Geography & Places</option>
                <option value="science">🔬 Science & Nature</option>
                <option value="sports">⚽ Sports</option>
                <option value="food">🍕 Food & Drink</option>
                <option value="decades">📅 Decades (specify in prompt)</option>
                <option value="picture">🖼️ Picture Round (with images)</option>
                <option value="music">🎵 Music (with YouTube clips)</option>
                <option value="film">🎬 TV & Film (with YouTube clips)</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">⭐ Difficulty Level</label>
              <select
                className="w-full h-12 px-4 py-2 border-2 border-orange-400 rounded-md text-lg text-gray-900 font-bold bg-white"
                value={currentRound.difficulty}
                onChange={(e) =>
                  updateRound(selectedRound, { difficulty: e.target.value as DifficultyLevel })
                }
              >
                <option value="easy">😊 Easy (perfect for beginners)</option>
                <option value="medium">🎯 Medium (balanced challenge)</option>
                <option value="hard">🔥 Hard (expert level)</option>
              </select>
            </div>

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">🔢 Number of Questions</label>
              <Input
                type="number"
                min="1"
                max="50"
                placeholder="20"
                value={currentRound.questionCount}
                onChange={(e) => updateRound(selectedRound, { questionCount: parseInt(e.target.value) || 20 })}
                className="text-lg font-bold"
              />
              <p className="text-base text-gray-900 font-medium mt-1">Choose between 1-50 questions</p>
            </div>

            {/* Picture Round Image Count - Only show for picture rounds */}
            {currentRound.type === "picture" && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-purple-400 rounded-lg p-4">
                <label className="block text-lg font-bold text-gray-900 mb-2">🖼️ Number of Images</label>
                <select
                  className="w-full h-12 px-4 py-2 border-2 border-purple-400 rounded-md text-lg text-gray-900 font-bold bg-white"
                  value={currentRound.imageCount || 10}
                  onChange={(e) => updateRound(selectedRound, { imageCount: parseInt(e.target.value) })}
                >
                  <option value="5">5 Images</option>
                  <option value="10">10 Images</option>
                  <option value="12">12 Images</option>
                  <option value="15">15 Images</option>
                  <option value="20">20 Images</option>
                </select>
                <p className="text-base text-gray-900 font-medium mt-2">
                  ℹ️ This many questions will have images. Perfect for traditional picture rounds!
                </p>
              </div>
            )}

            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">
                🤖 Prompt for AI (describe what you want)
              </label>
              <Textarea
                placeholder="e.g., 20 questions about 90s Britpop bands with song snippets. Include Oasis, Blur, Pulp, Suede..."
                value={currentRound.prompt}
                onChange={(e) => updateRound(selectedRound, { prompt: e.target.value })}
                rows={4}
                className="text-lg font-bold"
              />
            </div>

            <Button
              onClick={() => generateQuestions(selectedRound)}
              disabled={currentRound.generating}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl border-4 border-white shadow-2xl"
              size="lg"
            >
              {currentRound.generating ? "⏳ Generating..." : `✨ Generate ${currentRound.questionCount} Questions`}
            </Button>

            {currentRound.questions.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">📋 Generated Questions ({currentRound.questions.length})</h3>
                {currentRound.questions.map((q, idx) => (
                  <Card key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-xl text-gray-900">❓ Question {idx + 1}</div>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="font-bold"
                          onClick={() => deleteQuestion(selectedRound, idx)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>

                      <div>
                        <label className="text-base font-bold text-gray-900">Question:</label>
                        <Input
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(selectedRound, idx, { question: e.target.value })
                          }
                          className="text-lg font-bold mt-1"
                        />
                      </div>

                      <div>
                        <label className="text-base font-bold text-gray-900">Answer:</label>
                        <Input
                          value={q.answer}
                          onChange={(e) =>
                            updateQuestion(selectedRound, idx, { answer: e.target.value })
                          }
                          className="text-lg font-bold mt-1"
                        />
                      </div>

                      {q.type === "music" && q.youtubeVideoId && (
                        <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                          ✓ YouTube clip available ({q.youtubeStartSeconds}s-{q.youtubeEndSeconds}s)
                        </div>
                      )}

                      {(q.type === "film" || (q.type === "music" && !q.youtubeVideoId)) && (
                        <div className="space-y-2">
                          {!q.youtubeVideoId ? (
                            <Button
                              size="sm"
                              onClick={() => searchYouTube(selectedRound, idx)}
                            >
                              Select YouTube Video
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                                ✓ Video selected: {q.youtubeVideoId}
                              </div>
                              <div className="flex gap-2">
                                <div>
                                  <label className="text-xs">Start (seconds)</label>
                                  <Input
                                    type="number"
                                    value={q.youtubeStartSeconds || 0}
                                    onChange={(e) =>
                                      updateQuestion(selectedRound, idx, {
                                        youtubeStartSeconds: parseInt(e.target.value),
                                      })
                                    }
                                    className="w-24"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs">End (seconds)</label>
                                  <Input
                                    type="number"
                                    value={q.youtubeEndSeconds || 30}
                                    onChange={(e) =>
                                      updateQuestion(selectedRound, idx, {
                                        youtubeEndSeconds: parseInt(e.target.value),
                                      })
                                    }
                                    className="w-24"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {selectingVideoFor === idx && youtubeSearchResults.length > 0 && (
                            <div className="border rounded p-4 space-y-2">
                              <div className="font-medium">Select a video:</div>
                              {youtubeSearchResults.map((video) => (
                                <div
                                  key={video.videoId}
                                  className="flex gap-3 p-2 border rounded cursor-pointer hover:bg-gray-50"
                                  onClick={() =>
                                    selectYouTubeVideo(selectedRound, idx, video.videoId)
                                  }
                                >
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-32 h-20 object-cover rounded"
                                  />
                                  <div>
                                    <div className="font-medium text-sm">{video.title}</div>
                                    <div className="text-xs text-gray-600">
                                      {video.channelTitle}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

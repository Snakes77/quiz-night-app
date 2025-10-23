import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { prompt, type, difficulty = "medium", count = 20, imageCount } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Use Gemini 2.5 Flash (latest stable)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const difficultyInstructions = {
      easy: "Make the questions EASY difficulty - suitable for beginners, with straightforward answers that most people would know.",
      medium: "Make the questions MEDIUM difficulty - balanced challenge, requiring general knowledge but not too obscure.",
      hard: "Make the questions HARD difficulty - expert level, with challenging obscure facts and detailed knowledge required."
    };

    const creativeQuestionExamples = {
      music: `MUSIC QUESTION STYLES - Mix these creative formats:

1. Direct identification (40% of questions):
   - Question: "Identify this 1967 Beatles hit"
   - Search term: "The Beatles - Strawberry Fields Forever"
   - Answer: "Strawberry Fields Forever"

2. Lyric-based puzzles (30% of questions):
   - Question: "Which Beatles song contains the lyric 'nothing is real'?"
   - Search term: "The Beatles - Strawberry Fields Forever"
   - Answer: "Strawberry Fields Forever"

3. Year/Chart/Album questions (30% of questions):
   - Question: "This 1969 Beatles track was the final song on Abbey Road"
   - Search term: "The Beatles - The End"
   - Answer: "The End"

IMPORTANT: For searchTerm, always use format "Artist - Song Title" for best YouTube results.`,

      film: `FILM/TV QUESTION STYLES - Mix these formats:

1. Direct scene identification (40%):
   - Question: "In which film does Tom Hanks say 'Houston, we have a problem'?"
   - Search term: "Apollo 13 Houston we have a problem scene"
   - Answer: "Apollo 13"

2. Quote-based (30%):
   - Question: "Which film features the line 'I'll be back'?"
   - Search term: "Terminator I'll be back scene"
   - Answer: "The Terminator"

3. Plot/Character questions (30%):
   - Question: "Name the 1994 film where a box of chocolates becomes a famous metaphor"
   - Search term: "Forrest Gump box of chocolates scene"
   - Answer: "Forrest Gump"

IMPORTANT: For searchTerm, include movie name + key scene/quote for best YouTube results.`,

      picture: `PICTURE ROUND - Generate visual identification questions:

1. Famous landmarks (30%):
   - Question: "Name this famous Italian landmark"
   - Search term: "Colosseum Rome ancient amphitheater architecture"
   - Answer: "The Colosseum"

2. Celebrity/Historical figures (30%):
   - Question: "Who is this famous scientist?"
   - Search term: "Albert Einstein portrait photograph face"
   - Answer: "Albert Einstein"

3. Buildings/Monuments WITHOUT visible text (20%):
   - Question: "Which famous London department store is this?"
   - Search term: "Harrods building exterior architecture facade London"
   - Answer: "Harrods"

4. Art/Paintings (20%):
   - Question: "Name this famous painting"
   - Search term: "Mona Lisa painting Leonardo da Vinci artwork"
   - Answer: "Mona Lisa"

CRITICAL SEARCH TERM RULES TO AVOID TEXT IN IMAGES:
- For buildings/stores: Use "exterior architecture", "facade", "building view" NOT the business name alone
- For landmarks: Add "architecture", "monument", "structure" to get wider shots
- For people: Use "portrait photograph", "face closeup", "headshot"
- NEVER use search terms that will show text/signage (avoid: "sign", "logo", "storefront sign")
- Add "without text" or "architecture" to avoid images with visible labels
- Prefer distant/architectural shots over close-up signage

Examples of GOOD search terms (NO TEXT IN IMAGE):
  * "Big Ben clock tower architecture London" (not "Big Ben sign")
  * "Harrods building exterior facade architecture" (not "Harrods storefront sign")
  * "Sydney Opera House architectural structure" (not "Sydney Opera House entrance")
  * "Times Square buildings New York cityscape" (avoid text-heavy images)
  
Examples of BAD search terms (WILL SHOW TEXT):
  ✗ "Harrods sign London"
  ✗ "McDonald's logo"
  ✗ "Hollywood sign California"
  ✗ "Store name signage"`,

      general: `GENERAL KNOWLEDGE - Vary question types and topics within the theme.`,
      history: `HISTORY - Include dates, events, figures, and mix ancient, medieval, and modern history.`,
      geography: `GEOGRAPHY - Include countries, capitals, landmarks, rivers, mountains, and interesting facts.`,
      science: `SCIENCE - Cover physics, chemistry, biology, astronomy, and mix theoretical and practical questions.`,
      sports: `SPORTS - Include various sports, athletes, championships, records, and memorable moments.`,
      food: `FOOD & DRINK - Include ingredients, origins, cooking methods, famous dishes, and beverages.`,
      decades: `DECADES - Focus heavily on the specified decade(s) in the user prompt. Include pop culture, events, and nostalgia.`
    };

    const typeInstructions = creativeQuestionExamples[type as keyof typeof creativeQuestionExamples] || creativeQuestionExamples.general;

    // For picture rounds with imageCount, use that instead of count
    const questionsToGenerate = (type === 'picture' && imageCount) ? imageCount : count;
    const pictureRoundNote = (type === 'picture' && imageCount) ? `\n\nIMPORTANT: Generate EXACTLY ${imageCount} questions with images (not ${count}). All ${imageCount} questions MUST have searchTerm for image retrieval.` : '';
    const pictureRoundTextWarning = (type === 'picture') ? `\n\n⚠️ CRITICAL FOR PICTURE ROUNDS: Search terms MUST avoid images with visible text/labels/signs that reveal the answer! Use "architecture", "exterior", "facade", "building view" instead of "sign" or "storefront".` : '';

    const systemPrompt = `You are a creative quiz master creating engaging pub quiz questions.

DIFFICULTY LEVEL: ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}

QUESTION TYPE: ${type.toUpperCase()}
${typeInstructions}${pictureRoundNote}${pictureRoundTextWarning}

USER REQUEST: ${prompt}

Generate EXACTLY ${questionsToGenerate} questions. ${difficulty === 'easy' ? 'Keep answers simple and well-known.' : difficulty === 'hard' ? 'Include obscure facts and challenging details.' : 'Balance well-known and lesser-known facts.'}

CRITICAL FORMATTING INSTRUCTIONS:
- Return ONLY valid JSON, no additional text
- Use this exact structure for each question:
  {
    "question": "The question text",
    "answer": "The answer (be concise)",
    "searchTerm": "${type === 'music' ? 'Artist - Song Title' : type === 'film' ? 'Movie Title scene description' : type === 'picture' ? 'specific image description' : ''}"
  }

${type === 'music' ? '- For music: searchTerm must be "Artist - Song Title" format' : ''}
${type === 'film' ? '- For film: searchTerm should be "Movie Title + scene/quote description"' : ''}
${type === 'picture' ? '- For picture: searchTerm should be specific visual description' : ''}
${type === 'general' || type === 'history' || type === 'geography' || type === 'science' || type === 'sports' || type === 'food' || type === 'decades' ? '- No searchTerm needed for this question type' : ''}

Return format:
{
  "questions": [
    { "question": "...", "answer": "...", "searchTerm": "..." },
    ...
  ]
}`;

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Clean up response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleanedText);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format from AI");
    }

    // Format questions for the app
    const formattedQuestions = parsed.questions.map((q: any) => ({
      question: q.question,
      answer: q.answer,
      type: type,
      searchTerm: q.searchTerm || null,
    }));

    return NextResponse.json({
      questions: formattedQuestions,
    });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}

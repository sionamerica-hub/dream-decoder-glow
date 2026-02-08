import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DreamAnalysisRequest {
  dreamContent: string;
  events: string[];
  mood: { x: number; y: number };
}

const getMoodDescription = (x: number, y: number): string => {
  const energy = y < 30 ? "낮은 에너지" : y > 70 ? "높은 에너지" : "중간 에너지";
  const valence = x < 30 ? "부정적" : x > 70 ? "긍정적" : "중립적";
  
  if (x > 70 && y > 70) return "흥분되고 기쁜 상태 (높은 에너지, 긍정적)";
  if (x < 30 && y > 70) return "불안하거나 화난 상태 (높은 에너지, 부정적)";
  if (x > 70 && y < 30) return "평온하고 만족스러운 상태 (낮은 에너지, 긍정적)";
  if (x < 30 && y < 30) return "우울하거나 무기력한 상태 (낮은 에너지, 부정적)";
  return `${valence} 감정과 ${energy}를 느끼는 상태`;
};

const eventLabels: Record<string, string> = {
  work: "업무/학업",
  relationship: "대인관계",
  money: "금전/재정",
  health: "건강",
  self: "자아실현",
  other: "기타",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dreamContent, events, mood } = await req.json() as DreamAnalysisRequest;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const moodDescription = getMoodDescription(mood.x, mood.y);
    const eventDescriptions = events.map(e => eventLabels[e] || e).join(", ");

    const systemPrompt = `당신은 융 심리학에 기반한 전문 꿈 분석가입니다. 사용자의 꿈 내용, 최근 겪은 사건, 그리고 현재 감정 상태를 종합적으로 분석하여 무의식적 메시지를 해석합니다.

분석 시 다음 원칙을 따르세요:
1. 꿈의 상징들을 융 심리학적 관점에서 해석합니다
2. 사용자의 현재 감정 상태와 최근 사건을 꿈과 연결합니다
3. 실용적이고 행동 가능한 조언을 제공합니다
4. 따뜻하고 공감적인 어조를 유지합니다

반드시 다음 JSON 형식으로 응답하세요:
{
  "summary": "꿈의 핵심 메시지를 한 문장으로 요약",
  "symbols": [
    { "name": "상징1", "meaning": "융 심리학적 의미 해석" },
    { "name": "상징2", "meaning": "융 심리학적 의미 해석" }
  ],
  "emotionConnection": "현재 감정/사건과 꿈의 연결성 설명 (2-3문장)",
  "advice": [
    "구체적인 행동 조언 1",
    "구체적인 행동 조언 2",
    "구체적인 행동 조언 3"
  ]
}`;

    const userPrompt = `다음 정보를 바탕으로 꿈을 분석해주세요:

**꿈 내용:**
${dreamContent}

**최근 겪은 사건/고민:**
${eventDescriptions || "선택되지 않음"}

**현재 감정 상태:**
${moodDescription}
(감정 좌표: X=${mood.x}% 긍정, Y=${mood.y}% 에너지)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다. 충전 후 다시 시도해주세요." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON from AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-dream error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

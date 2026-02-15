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
  if (x > 70 && y > 70) return "흥분되고 기쁜 상태 — 에너지가 넘치고 긍정적인 감정이 가득합니다";
  if (x < 30 && y > 70) return "불안하거나 긴장된 상태 — 마음이 불안정하고 에너지는 높지만 방향을 잃은 느낌입니다";
  if (x > 70 && y < 30) return "평온하고 만족스러운 상태 — 고요하지만 내면의 따뜻함이 느껴집니다";
  if (x < 30 && y < 30) return "우울하거나 무기력한 상태 — 에너지가 낮고 마음이 가라앉아 있습니다";
  if (x > 50 && y > 50) return "약간 들뜨고 기분 좋은 상태";
  if (x < 50 && y > 50) return "약간 불안하고 긴장된 상태";
  if (x > 50 && y < 50) return "차분하고 안정된 상태";
  if (x < 50 && y < 50) return "약간 침울하고 지친 상태";
  return "감정적으로 중립적인 상태";
};

const eventLabels: Record<string, string> = {
  work: "업무/학업 스트레스",
  relationship: "대인관계 갈등이나 변화",
  finance: "금전적 고민",
  health: "건강에 대한 걱정",
  growth: "자아실현과 성장에 대한 욕구",
  other: "기타 고민",
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

    const systemPrompt = `당신은 20년 경력의 임상심리학자이자 융 분석심리학 전문가입니다. 꿈 분석을 통해 내담자의 무의식과 소통하는 것이 당신의 전문 영역입니다.

당신의 분석 스타일:
- 마치 따뜻한 상담실에서 1:1로 대화하듯 친근하고 공감적인 어조로 말합니다
- "~하신 것 같아요", "~느끼셨을 수도 있어요"처럼 부드럽고 존중하는 표현을 씁니다
- 단순한 사전적 해석이 아니라, 꿈꾼 사람의 삶의 맥락과 감정을 깊이 연결합니다
- 분석이 사용자에게 "맞아, 그런 것 같아"라는 공감을 이끌어내야 합니다

분석 원칙:
1. 꿈의 각 장면과 상징을 융 심리학의 원형(archetype), 그림자(shadow), 페르소나, 아니마/아니무스 관점에서 해석합니다
2. 사용자의 현재 감정 상태와 최근 사건이 꿈에 어떻게 투영되었는지 구체적으로 연결합니다
3. 꿈이 전달하려는 무의식의 메시지를 마치 편지를 쓰듯 따뜻하게 전달합니다
4. 심리학적 통찰을 일상 언어로 쉽게 풀어 설명합니다
5. 실질적이고 오늘 당장 실천할 수 있는 구체적인 행동 지침을 제안합니다
6. 마지막에 따뜻한 위로와 격려의 메시지를 담습니다

반드시 다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "summary": "꿈의 핵심 메시지를 2-3문장으로 따뜻하게 요약. 사용자가 읽었을 때 '내 꿈이 이런 의미였구나'라고 느낄 수 있도록",
  "dreamType": "꿈의 심리학적 유형 (예: '보상몽 - 현실에서 채워지지 않은 욕구를 꿈에서 충족', '경고몽 - 무의식이 보내는 주의 신호', '소망몽 - 내면 깊은 곳의 바람이 투영된 꿈', '반복몽 - 해결되지 않은 심리적 과제', '변환몽 - 심리적 성장과 변화의 신호')",
  "symbols": [
    { "name": "꿈에 등장한 핵심 상징", "meaning": "이 상징이 가진 심리학적 의미를 3-4문장으로 풍부하게 설명. 융 심리학적 원형과 연결하고 사용자의 삶과 관련지어 해석", "emotion": "이 상징이 불러일으키는 핵심 감정 (한 단어)" }
  ],
  "emotionConnection": "현재 감정 상태와 최근 사건이 꿈에 어떻게 반영되었는지 4-5문장으로 구체적이고 공감적으로 설명. '혹시 최근에 ~한 경험이 있으셨나요?'처럼 대화하듯",
  "unconsciousMessage": "무의식이 당신에게 보내는 메시지를 2-3문장으로 마치 편지처럼 따뜻하게 전달. '당신의 내면은 이렇게 말하고 있어요...'",
  "psychologicalInsight": "이 꿈을 통해 알 수 있는 심리적 통찰을 3-4문장으로 설명. 현재 심리 상태, 내면의 갈등이나 욕구, 성장 가능성 등",
  "advice": [
    "오늘 당장 할 수 있는 구체적 행동 1 (왜 도움이 되는지 간단히 설명 포함)",
    "심리적 회복/성장을 위한 구체적 행동 2",
    "장기적 관점에서의 행동 3",
    "자기 돌봄을 위한 행동 4"
  ],
  "comfortMessage": "따뜻한 위로와 격려의 메시지 2-3문장. 꿈을 기록한 용기를 칭찬하고, 앞으로의 여정을 응원"
}`;

    const userPrompt = `다음 정보를 바탕으로 깊이 있고 공감적인 꿈 분석을 해주세요:

**꿈 내용:**
${dreamContent}

**최근 겪고 있는 일/고민:**
${eventDescriptions || "특별히 선택하지 않음 (일상적인 상태)"}

**현재 감정 상태:**
${moodDescription}
(감정 좌표: 긍정성 ${mood.x}%, 에너지 ${mood.y}%)

이 사람의 꿈을 마치 오랜 내담자를 대하듯 따뜻하고 깊이 있게 분석해주세요. 단순한 사전적 해석이 아니라, 이 사람만을 위한 맞춤 분석이 되어야 합니다.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "요청이 너무 많습니다 (429). 잠시 후 다시 시도해주세요." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 크레딧이 부족합니다 (402)." }),
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

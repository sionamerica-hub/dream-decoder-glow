import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, dreamContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `당신은 20년 경력의 임상심리학자이자 융 분석심리학 전문가입니다. 
사용자가 이전에 기록한 꿈에 대해 추가 질문을 하고 있습니다.

아래는 이미 분석된 꿈의 맥락입니다:

**꿈 내용:** ${dreamContext.content}

**분석 요약:** ${dreamContext.summary}

**꿈 유형:** ${dreamContext.dreamType}

**상징 분석:** ${dreamContext.symbols?.map((s: any) => `"${s.name}" - ${s.meaning}`).join('\n') || '없음'}

**감정-사건 연결:** ${dreamContext.emotionConnection}

**무의식의 메시지:** ${dreamContext.unconsciousMessage}

**심리적 통찰:** ${dreamContext.psychologicalInsight}

대화 지침:
- 마치 따뜻한 상담실에서 1:1로 대화하듯 친근하고 공감적인 어조로 답하세요
- 이전 분석 결과를 참고하되, 사용자의 새 질문에 맞춰 더 깊은 통찰을 제공하세요
- 너무 길지 않게, 2-4문단 정도로 핵심적이면서도 따뜻하게 답하세요
- 필요시 추가 질문을 던져 사용자의 자기 탐색을 도우세요
- 마크다운 서식을 적절히 활용하세요`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("dream-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

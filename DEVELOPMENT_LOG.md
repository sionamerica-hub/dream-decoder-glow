# LucidMind 개발일지

프로젝트 개발 과정을 시간순으로 기록한 문서입니다.

---

## Phase 1: 프로젝트 초기 설정 및 UI 컴포넌트 구축

### 변경 사항
- Vite + React + TypeScript 기반 프로젝트 초기화
- Tailwind CSS 다크 테마 디자인 시스템 구축 (`index.css`)
- 핵심 UI 컴포넌트 개발:
  - **GlowCard**: 네온 발광 효과가 적용된 글래스모피즘 카드 컴포넌트 (purple, blue, pink, green 변형)
  - **BottomNav**: 모바일 최적화 하단 네비게이션 바 (홈, 기록, 보고서, 프로필 탭)
  - **DreamInput**: 꿈 내용 텍스트 입력 컴포넌트 (textarea 기반)
  - **MoodSelector**: XY 좌표 기반 2차원 감정 선택 인터페이스
  - **EventSelector**: 6개 카테고리 사건 선택 컴포넌트 (다중 선택 지원)
  - **DreamCalendar**: 월별 꿈 기록 캘린더 (react-day-picker 기반)
  - **SummaryCard**: 대시보드 요약 통계 카드

### 기술적 결정 사항
- 다크 테마를 기본으로 채택하여 꿈·수면이라는 서비스 특성에 맞는 분위기 연출
- shadcn/ui + Radix UI를 기반으로 접근성을 보장하면서 커스텀 디자인 적용
- 모바일 퍼스트 반응형 레이아웃 (하단 네비게이션 바 채택)
- XY 좌표 감정 선택 인터페이스를 핵심 차별화 기능으로 구현

### 사용 기술
`React 18`, `TypeScript`, `Tailwind CSS`, `shadcn/ui`, `Radix UI`, `Lucide Icons`, `react-day-picker`, `date-fns`

---

## Phase 2: AI 꿈 분석 엔진 구현

### 변경 사항
- Lovable Cloud Edge Function `analyze-dream` 생성
- Google Gemini 모델 연동을 위한 API 통합
- 융(Jung) 심리학 이론 기반 분석 프롬프트 설계
- 프론트엔드 `useDreamAnalysis` 커스텀 훅 구현
- 에러 처리 및 로딩 상태 관리 (429 Rate Limit, 402 크레딧 부족 등)

### 기술적 결정 사항
- Edge Function을 통해 AI API 키를 서버 사이드에서 안전하게 관리
- 프롬프트에 융 심리학의 원형(Archetype), 그림자(Shadow), 아니마/아니무스 등 핵심 개념 반영
- JSON 포맷 응답을 강제하여 프론트엔드에서 구조화된 분석 결과 렌더링
- 분석 결과를 7개 카테고리로 구분하여 체계적인 보고서 생성

### 사용 기술
`Lovable Cloud Edge Functions (Deno)`, `Google Gemini API`, `Supabase Functions SDK`

---

## Phase 3: 데이터베이스 스키마 설계

### 변경 사항
- `dreams` 테이블 생성 (PostgreSQL)
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → auth.users)
  - `content` (TEXT, 꿈 내용)
  - `event` (TEXT, 선택된 사건)
  - `mood_x`, `mood_y` (INTEGER, 감정 좌표)
  - `analysis_summary`, `analysis_symbols`, `analysis_emotion`, `analysis_advice` (TEXT, AI 분석 결과)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- Row Level Security (RLS) 정책 설정
- `is_owner_of_dream` 보안 함수 생성
- `user_id` 및 `created_at` 인덱스 생성

### 기술적 결정 사항
- RLS를 통해 사용자별 데이터 격리 보장 (본인 데이터만 CRUD 가능)
- `SECURITY DEFINER` 함수로 소유권 검증 로직 캡슐화
- AI 분석 결과를 별도 컬럼으로 분리하여 개별 조회 가능하도록 설계
- 타임스탬프에 `now()` 기본값 및 자동 업데이트 트리거 적용

### 사용 기술
`PostgreSQL`, `Lovable Cloud (Supabase)`, `RLS Policies`, `Database Functions`

---

## Phase 4: 사용자 인증 시스템 구현

### 변경 사항
- `AuthContext` 생성 (React Context API 기반 인증 상태 관리)
- `Auth.tsx` 로그인/회원가입 페이지 구현 (이메일/비밀번호)
- `ProtectedRoute` 컴포넌트로 인증 필수 라우트 보호
- `useDreams` 훅에서 Supabase DB 연동 (사용자별 꿈 CRUD)
- `App.tsx` 라우팅에 인증 플로우 통합

### 기술적 결정 사항
- Lovable Cloud 인증 시스템 활용 (이메일/비밀번호 방식)
- 이메일 인증(verification) 활성화로 보안 강화
- `onAuthStateChange` 리스너로 세션 상태 실시간 추적
- 인증된 사용자의 `user_id`를 기반으로 RLS 정책과 연동

### 사용 기술
`Lovable Cloud Auth`, `React Context API`, `React Router DOM`, `ProtectedRoute Pattern`

---

## Phase 5: AI 분석 고도화 및 UX 개선

### 변경 사항

#### AI 엔진 업그레이드
- Gemini 모델을 **Gemini 3 Pro**로 업그레이드
- 분석 카테고리를 기존 4개에서 **7개로 확장**:
  1. 핵심 메시지 (summary)
  2. 꿈 유형 분류 (dreamType)
  3. 상징 분석 (symbols) — 이름, 의미, 감정 포함
  4. 감정-사건 연결 (emotionConnection)
  5. 무의식 메시지 (unconsciousMessage)
  6. 심리적 통찰 (psychologicalInsight)
  7. 행동 지침 (advice) — 3가지 구체적 조언
- **위로 메시지** (comfortMessage) 추가
- 프롬프트 어조를 **공감적이고 따뜻한 톤**으로 전면 개편

#### 저장 방식 전환
- Supabase DB 기반에서 **localStorage 기반**으로 전환
- 로그인 없이도 꿈 기록 및 분석 결과 저장 가능
- 꿈 삭제 기능 추가

#### UI 리뉴얼
- **AnalysisReport 컴포넌트** 전면 재설계:
  - 7개 분석 섹션별 고유 아이콘 및 그라데이션 적용
  - 상징 분석을 카드 리스트 형태로 시각화
  - 행동 지침을 체크리스트 스타일로 표시
  - 위로 메시지 전용 섹션 추가 (하트 아이콘)
- 인증 요구사항 제거 (자유 접근 가능)
- 대시보드 통계 실시간 반영

### 기술적 결정 사항
- 로그인 장벽 제거로 사용자 유입 최적화 (MVP 단계 전략)
- localStorage를 통해 오프라인에서도 기록 유지
- Gemini 3 Pro의 향상된 추론 능력으로 더 깊이 있는 심리 분석 가능
- 공감적 어조의 프롬프트로 사용자 만족도 및 재방문율 향상 기대

### 사용 기술
`Google Gemini 3 Pro`, `localStorage API`, `Lucide Icons`, `Tailwind CSS Gradients`

---

## 프로젝트 구조 요약

```
src/
├── components/
│   ├── AnalysisReport.tsx    # AI 분석 보고서 UI
│   ├── BottomNav.tsx         # 하단 네비게이션
│   ├── DreamCalendar.tsx     # 꿈 캘린더
│   ├── DreamInput.tsx        # 꿈 입력 폼
│   ├── EventSelector.tsx     # 사건 카테고리 선택
│   ├── MoodSelector.tsx      # XY 좌표 감정 선택
│   ├── SummaryCard.tsx       # 대시보드 요약 카드
│   └── ui/
│       └── GlowCard.tsx      # 네온 글로우 카드
├── hooks/
│   ├── useDreamAnalysis.ts   # AI 분석 훅
│   └── useDreams.ts          # 꿈 CRUD 훅 (localStorage)
├── pages/
│   └── Index.tsx             # 메인 페이지 (탭 네비게이션)
└── supabase/
    └── functions/
        └── analyze-dream/    # AI 분석 Edge Function
            └── index.ts
```

---

*마지막 업데이트: 2026년 3월 21일*

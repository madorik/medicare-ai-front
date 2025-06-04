# MediCare AI - 의료 진료 기록 분석 서비스

AI 기반 의료 진료 기록 분석 서비스입니다. 처방전, 검사 결과지, 진단서 등의 이미지를 업로드하면 실시간으로 분석 결과를 제공합니다.

## 🚀 주요 기능

### 📁 파일 업로드
- **지원 형식**: JPG, PNG, PDF
- **최대 크기**: 5MB
- **드래그 앤 드롭** 지원
- **실시간 검증**: 파일 크기 및 형식 검증
- **동적 형식 조회**: 서버에서 지원 형식 자동 조회

### 🔄 실시간 SSE 통신
- **Server-Sent Events**를 통한 실시간 분석 결과 스트리밍
- **실시간 업데이트**: 분석 진행 상황을 실시간으로 확인
- **진행률 표시**: 24단계 분석 과정의 정확한 진행률 제공
- **오류 처리**: 연결 실패 시 자동 복구 시도

### 🧠 AI 분석 기능
- 의료 용어 자동 식별
- 처방 약물 정보 분석
- 생활습관 개선 권장사항
- 정기 검진 일정 제안
- 위험 요인 평가

### 💬 AI 채팅 상담
- 분석 결과에 대한 실시간 Q&A
- 의료 정보 상세 설명
- 개인 맞춤형 건강 관리 조언

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express (예시 서버)
- **통신**: REST API + Server-Sent Events
- **파일 처리**: Multer

## 📦 설치 및 실행

### 환경변수 설정

프론트엔드 루트 디렉토리에 `.env.local` 파일을 생성하고 다음과 같이 설정하세요:

```bash
# API 서버 URL 설정
NEXT_PUBLIC_API_URL=http://localhost:9001

# 개발 환경에서는 localhost:9001
# 운영 환경에서는 실제 서버 주소로 변경
# 예: NEXT_PUBLIC_API_URL=https://api.medicare-ai.com
```

### 프론트엔드 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

### 백엔드 서버 실행

#### 방법 1: 실시간 스트리밍 테스트 서버

1. 새 터미널에서 서버 디렉토리 생성
```bash
mkdir server && cd server
```

2. 서버 설정
```bash
npm init -y
npm install express multer cors uuid
```

3. 실시간 스트리밍 서버 파일 복사
```bash
# 프로젝트 루트의 server-example-streaming.js를 server.js로 복사
cp ../server-example-streaming.js ./server.js
```

4. 서버 실행
```bash
node server.js
```

이 서버는 **실시간 텍스트 스트리밍**을 시뮬레이션하여 각 분석 단계마다 0.5-1.5초 간격으로 텍스트를 추가로 전송합니다.

#### 방법 2: 기본 서버 (server-example.md 참조)

1. 새 터미널에서 서버 디렉토리 생성
```bash
mkdir server && cd server
```

2. 서버 설정
```bash
npm init -y
npm install express multer cors uuid
```

3. `server.js` 파일 생성 (server-example.md 참조)

4. 서버 실행
```bash
node server.js
```

## 🌐 API 명세

### 🔍 지원 형식 조회
```
GET http://localhost:9001/api/medical/supported-formats
```

**응답:**
```json
[
  {
    "extension": "JPG",
    "mimeType": "image/jpeg", 
    "description": "처방전",
    "maxSize": 5242880
  },
  {
    "extension": "PNG",
    "mimeType": "image/png",
    "description": "검사 결과지", 
    "maxSize": 5242880
  },
  {
    "extension": "PDF",
    "mimeType": "application/pdf",
    "description": "진단서",
    "maxSize": 5242880
  }
]
```

### 📤 진료 기록 분석 (SSE)
```
POST http://localhost:9001/api/medical/analyze
Content-Type: multipart/form-data

Body: medicalFile (JPG/PNG/PDF, 최대 5MB)
```

**SSE 응답:**
```
Content-Type: text/event-stream

data: {"type":"connected","message":"의료 기록 분석이 시작되었습니다."}

data: {"type":"progress","content":"의료 기록 파일을 검증하고 있습니다...","timestamp":"2024-01-01T00:00:00.000Z","step":1,"totalSteps":24,"progress":4}

data: {"type":"complete","content":"AI 분석이 완료되었습니다...","timestamp":"2024-01-01T00:05:00.000Z","step":24,"totalSteps":24,"progress":100}
```

## 🎨 UI 컴포넌트

### ImageUploadSection
파일 업로드를 담당하는 컴포넌트

```typescript
interface ImageUploadSectionProps {
  onAnalysisStart: () => void
  onAnalysisResult: (data: string) => void
  onAnalysisComplete: () => void
  onError: (error: string) => void
}
```

**주요 기능:**
- 서버에서 지원 형식 자동 조회
- 드래그 앤 드롭 업로드
- **medicalFile** 필드명으로 업로드
- SSE 스트림 실시간 처리
- 파일 크기 및 형식 검증
- 실시간 업로드 상태 표시

### AnalysisResults
실시간 분석 결과를 표시하는 컴포넌트

```typescript
interface AnalysisResultsProps {
  isAnalyzing: boolean
  analysisData: string
  hasError: boolean
  errorMessage?: string
}
```

**주요 기능:**
- SSE 실시간 스트리밍 표시
- 분석 진행률 시각화
- 애니메이션 효과로 사용자 경험 향상
- 분석 완료 후 요약 통계

## 📝 코딩 스타일

프로젝트는 다음 코딩 규칙을 따릅니다:

- **들여쓰기**: 2칸 스페이스
- **변수명**: 카멜케이스 (camelCase)
- **상수**: 대문자 + 언더스코어 (SNAKE_CASE)
- **파일명**: 소문자 + 하이픈 (kebab-case)
- **주석**: 한글로 작성, 최소한으로 유지

## 🔧 개발 환경

- Node.js 18+
- Next.js 15
- TypeScript 5
- pnpm (패키지 매니저)

## 📱 사용법

1. **파일 업로드**
   - 메인 페이지에서 의료 문서 파일을 드래그하거나 클릭하여 업로드
   - JPG, PNG, PDF 형식 지원 (최대 5MB)

2. **실시간 분석 확인**
   - 업로드 후 자동으로 분석이 시작됩니다
   - 우측 패널에서 실시간으로 분석 진행 상황 확인
   - 24단계의 상세한 의료 분석 과정 추적

3. **AI 채팅 상담**
   - 분석 완료 후 좌측 채팅창에서 AI와 대화
   - 분석 결과에 대한 질문과 상담 가능

4. **결과 활용**
   - 전문가 상담 예약
   - 상세 리포트 다운로드
   - 분석 결과 공유

## 🔧 고급 기능

### SSE 스트림 처리
```typescript
// SSE 응답 처리 예시
const response = await fetch('/api/medical/analyze', {
  method: 'POST',
  body: formData
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value, { stream: true });
  // SSE 데이터 처리
}
```

### 파일 업로드 검증
```typescript
// 지원 형식 조회 및 검증
const formats = await fetch('/api/medical/supported-formats').then(r => r.json());
const isValid = formats.some(f => f.mimeType === file.type);
```

## ⚠️ 주의사항

- 이 서비스는 의료 전문가의 진단을 대체할 수 없습니다
- 정확한 진단을 위해서는 반드시 의료진과 상담하세요
- 개인정보 보호를 위해 민감한 정보 업로드 시 주의하세요

## 🔒 보안 고려사항

- CORS 설정으로 특정 도메인만 접근 허용
- 파일 크기 및 형식 검증
- 업로드된 파일은 서버 파일시스템에 안전하게 저장
- 민감한 의료 정보 처리 시 암호화 권장

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

This project is licensed under the MIT License. 
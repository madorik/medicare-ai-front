# 🚀 Vercel 배포 가이드

## 📋 배포 전 체크리스트

- [ ] GitHub 리포지토리에 코드 푸시 완료
- [ ] `.env.local` 파일이 gitignore에 포함되어 있는지 확인
- [ ] `vercel.json` 설정 파일 존재 확인
- [ ] 백엔드 서버 배포 완료
- [ ] 백엔드 서버 URL 확인

## 🛠️ 1단계: 프론트엔드 Vercel 배포

### 1.1 Vercel 계정 생성 및 프로젝트 연결

1. [Vercel 웹사이트](https://vercel.com) 접속
2. "Continue with GitHub" 클릭하여 GitHub 계정으로 로그인
3. "New Project" 버튼 클릭
4. 해당 GitHub 리포지토리 선택 후 "Import" 클릭

### 1.2 빌드 설정 (자동 감지됨)

Vercel이 자동으로 다음을 감지합니다:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 1.3 환경변수 설정

**중요**: 배포 전에 반드시 환경변수를 설정해야 합니다!

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** 탭 클릭
3. **Environment Variables** 섹션으로 이동
4. 다음 환경변수 추가:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-server.com
Environment: Production, Preview, Development
```

### 1.4 배포 실행

"Deploy" 버튼 클릭하면 자동 배포가 시작됩니다.

## 🖥️ 2단계: 백엔드 서버 배포

### Option A: Railway (추천)

```bash
# 1. Railway CLI 설치
npm install -g @railway/cli

# 2. 서버 디렉토리로 이동
cd server

# 3. Railway 로그인
railway login

# 4. 프로젝트 초기화
railway init

# 5. 배포
railway up
```

### Option B: Render

1. [Render.com](https://render.com) 회원가입
2. "New +" → "Web Service" 클릭
3. GitHub 리포지토리 연결
4. 설정:
   - **Name**: `medicare-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Root Directory**: `server` (서버 코드가 별도 폴더에 있는 경우)

### Option C: Heroku

```bash
# 1. Heroku CLI 설치 후
cd server

# 2. Heroku 앱 생성
heroku create medicare-ai-backend

# 3. Git 초기화 (필요한 경우)
git init
git add .
git commit -m "Initial server commit"

# 4. Heroku 배포
heroku git:remote -a medicare-ai-backend
git push heroku main
```

## 🔗 3단계: 도메인 연결

### 3.1 백엔드 URL 확인

배포된 백엔드 서버 URL을 확인합니다:
- **Railway**: `https://your-app.railway.app`
- **Render**: `https://medicare-ai-backend.onrender.com`
- **Heroku**: `https://medicare-ai-backend.herokuapp.com`

### 3.2 환경변수 업데이트

Vercel 대시보드에서 `NEXT_PUBLIC_API_URL`을 실제 백엔드 URL로 업데이트:

```
NEXT_PUBLIC_API_URL = https://medicare-ai-backend.onrender.com
```

### 3.3 백엔드 CORS 설정

서버의 `server.js` 또는 `server-example-streaming.js`에서 CORS 설정 업데이트:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://medicare-ai-front.vercel.app',  // Vercel 도메인
    'https://your-custom-domain.com'         // 커스텀 도메인 (있는 경우)
  ],
  credentials: true
}));
```

## ✅ 4단계: 배포 테스트

### 4.1 기본 동작 확인

1. Vercel URL(`https://your-app.vercel.app`) 접속
2. 페이지가 정상적으로 로드되는지 확인
3. 콘솔에 오류가 없는지 확인

### 4.2 파일 업로드 테스트

1. 샘플 이미지 파일 준비 (JPG, PNG, PDF)
2. 파일 업로드 시도
3. 실시간 스트리밍이 작동하는지 확인
4. 분석 결과가 정상적으로 표시되는지 확인

### 4.3 API 연결 확인

브라우저 개발자 도구에서:
```javascript
// 지원 형식 API 테스트
fetch('https://your-backend.com/api/medical/supported-formats')
  .then(r => r.json())
  .then(console.log)
```

## 🔧 문제 해결

### 환경변수 문제
```bash
# Vercel CLI로 환경변수 확인
vercel env ls

# 환경변수 추가
vercel env add NEXT_PUBLIC_API_URL
```

### CORS 오류
```javascript
// 백엔드에서 모든 origin 허용 (임시)
app.use(cors({
  origin: '*'
}));
```

### SSE 연결 실패
1. 백엔드 서버가 실행 중인지 확인
2. 방화벽 설정 확인
3. HTTPS 프로토콜 사용 확인

## 🎉 배포 완료

✅ **프론트엔드**: `https://your-app.vercel.app`
✅ **백엔드**: `https://your-backend-server.com`
✅ **실시간 SSE 스트리밍** 작동 확인
✅ **파일 업로드** 기능 확인

---

**참고**: 
- Vercel은 무료 플랜에서도 충분히 사용 가능합니다
- 백엔드 서버는 24/7 실행되어야 하므로 안정적인 호스팅 서비스 선택이 중요합니다
- SSL 인증서는 모든 호스팅 서비스에서 자동 제공됩니다 
# OAuth 설정 가이드 (JWT 토큰 기반)

MediCare AI 프론트엔드에서 Google OAuth 로그인을 사용하기 위한 백엔드 설정 가이드입니다.

## 1. Google Cloud Console 설정

### OAuth 클라이언트 ID 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. "API 및 서비스" > "사용자 인증 정보" 이동
4. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 선택
5. 애플리케이션 유형: "웹 애플리케이션" 선택

### 승인된 리디렉션 URI 설정
```
개발 환경:
http://localhost:9001/auth/google/callback

프로덕션 환경:
https://your-domain.com/auth/google/callback
```

## 2. 백엔드 API 엔드포인트

### 필요한 API 엔드포인트

#### 1. Google OAuth 시작
```
GET /auth/google
```
- Google OAuth 페이지로 리디렉션
- 인증 후 `/auth/google/callback`으로 돌아옴

#### 2. Google OAuth 콜백
```
GET /auth/google/callback
```
- Google에서 인증 코드를 받아 처리
- JWT 토큰 생성 후 프론트엔드로 리디렉션
- 성공 시: `http://localhost:3000/auth/success?token=JWT_TOKEN`
- 실패 시: `http://localhost:3000/login?error=oauth_failed`

#### 3. 사용자 프로필 조회
```
GET /auth/profile
Authorization: Bearer <JWT_TOKEN>
```
**응답 형식:**
```json
{
  "id": "google_user_id",
  "email": "user@gmail.com",
  "name": "사용자 이름",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

#### 4. 로그아웃 (선택사항)
```
POST /auth/logout
Authorization: Bearer <JWT_TOKEN>
```
- JWT 토큰 무효화 (블랙리스트 등)

## 3. 프론트엔드 설정

### 환경 변수
`.env.local` 파일에 백엔드 URL 설정:
```
NEXT_PUBLIC_API_URL=http://localhost:9001
```

### 프론트엔드 리디렉션 URL
백엔드에서 인증 성공/실패 시 다음 URL로 리디렉션해야 합니다:

**성공:**
```
http://localhost:3000/auth/success?token=JWT_TOKEN_HERE
```

**실패:**
```
http://localhost:3000/login?error=oauth_failed
```

## 4. Express.js 백엔드 예제

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Google OAuth 전략
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
    picture: profile.photos[0].value
  };
  
  // 데이터베이스에 사용자 저장/업데이트 (선택사항)
  // await saveUserToDatabase(user);
  
  return done(null, user);
}));

// JWT 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// OAuth 라우트
app.get('/auth/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false  // JWT 사용하므로 세션 비활성화
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  }),
  (req, res) => {
    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d', // 7일 만료
        issuer: 'ai-learning-api'
      }
    );
    
    // 토큰과 함께 프론트엔드로 리디렉션
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

// 프로필 조회 (JWT 토큰 필요)
app.get('/auth/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

// 로그아웃 (선택사항 - JWT 블랙리스트 등)
app.post('/auth/logout', authenticateToken, (req, res) => {
  // JWT 토큰 블랙리스트에 추가 (선택사항)
  // addToBlacklist(req.token);
  res.json({ message: 'Logged out successfully' });
});

// 의료 파일 분석 API (인증 필요)
app.post('/api/medical/analyze', authenticateToken, upload.single('medicalFile'), (req, res) => {
  // 파일 분석 로직
  // SSE 스트림으로 실시간 결과 전송
});
```

## 5. 환경 변수 설정

백엔드 `.env` 파일:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_strong_jwt_secret_key
```

## 6. CORS 설정

프론트엔드와 백엔드가 다른 포트에서 실행되므로 CORS 설정이 필요합니다:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## 7. 보안 고려사항

1. **JWT 보안**: 강력한 JWT 시크릿 키 사용
2. **토큰 만료**: 적절한 만료 시간 설정 (7일 권장)
3. **HTTPS 사용**: 프로덕션에서는 반드시 HTTPS 사용
4. **토큰 저장**: 로컬 스토리지에 토큰 저장 (XSS 주의)
5. **리프레시 토큰**: 장기간 사용을 위한 리프레시 토큰 고려

## 8. API 요청 인증

모든 인증이 필요한 API 요청에는 Authorization 헤더 필요:

```javascript
// 프론트엔드에서 API 요청 예시
const token = localStorage.getItem('auth_token');

fetch('/api/medical/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    // FormData일 때는 Content-Type 자동 설정
  },
  body: formData
});
```

## 9. 테스트

1. 백엔드 서버 실행 (`localhost:9001`)
2. 프론트엔드 서버 실행 (`localhost:3000`)
3. 브라우저에서 로그인 버튼 클릭
4. Google 인증 페이지에서 로그인
5. `auth/success?token=...` 페이지로 리디렉션
6. 토큰으로 프로필 조회 및 메인 페이지 표시

## 문제 해결

### 자주 발생하는 오류

#### 1. "토큰을 찾을 수 없습니다" 오류
**증상**: 로그인 시 `/auth/success` 또는 `/auth/callback` 페이지에서 토큰을 찾을 수 없다는 에러 발생

**원인 분석**:
1. **백엔드 리다이렉트 URL 불일치**: 백엔드에서 잘못된 URL로 리다이렉트
2. **토큰 파라미터명 불일치**: `token` 대신 다른 파라미터명 사용
3. **Hash vs Search 파라미터**: 일부 OAuth는 hash(#)를 사용하여 토큰 전달

**해결 방법**:

1. **백엔드 리다이렉트 URL 확인**:
   ```javascript
   // 올바른 리다이렉트 (Express.js 예시)
   res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
   
   // 또는 callback 페이지 사용 시
   res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
   ```

2. **개발자 도구에서 실제 URL 확인**:
   - 브라우저 개발자 도구 > 네트워크 탭에서 리다이렉트 URL 확인
   - 콘솔에서 디버그 로그 확인

3. **환경변수 확인**:
   ```bash
   # 백엔드 .env
   FRONTEND_URL=http://localhost:3000  # 포트 번호 정확한지 확인
   
   # 프론트엔드 .env.local  
   NEXT_PUBLIC_API_URL=http://localhost:9001  # 백엔드 URL 정확한지 확인
   ```

4. **Google OAuth 설정 확인**:
   - Google Cloud Console > 승인된 리디렉션 URI에 백엔드 콜백 URL 등록
   - `http://localhost:9001/auth/google/callback`

#### 2. CORS 오류
**해결**: 백엔드 CORS 설정 확인
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

#### 3. JWT 오류
**해결**: JWT_SECRET 설정 및 토큰 유효성 확인

#### 4. 리디렉션 오류
**해결**: Google Console의 승인된 URI 확인

#### 5. 토큰 만료
**해결**: 토큰 만료 시간 및 갱신 로직 확인

### 빠른 디버깅 체크리스트

로그인이 작동하지 않을 때 순서대로 확인:

1. ✅ **백엔드 서버 실행 확인** (`localhost:9001`)
2. ✅ **프론트엔드 서버 실행 확인** (`localhost:3000`)  
3. ✅ **환경변수 설정 확인** (`.env` 파일들)
4. ✅ **Google OAuth 설정 확인** (Client ID, Secret, 리다이렉트 URI)
5. ✅ **개발자 도구에서 네트워크 요청 확인**
6. ✅ **콘솔 로그 확인** (프론트엔드와 백엔드 모두)
7. ✅ **실제 리다이렉트 URL 확인** (token 파라미터 포함되었는지)

### 개발 환경에서 토큰 직접 테스트

토큰이 올바르게 생성되는지 테스트:

```bash
# 백엔드에서 테스트 토큰 생성
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({id: 'test', email: 'test@test.com'}, 'your_jwt_secret');
"
```

생성된 URL을 브라우저에서 직접 접속하여 로그인 프로세스 테스트 가능. 
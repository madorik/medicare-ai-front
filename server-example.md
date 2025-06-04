# 서버 구현 예시 (Node.js/Express)

이 파일은 프론트엔드와 연동되는 서버 구현 예시입니다.

## 설치 필요 패키지

```bash
npm init -y
npm install express multer cors uuid
```

## server.js

```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const PORT = 9001;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:3000', // 프론트엔드 주소
  credentials: true
}));

app.use(express.json());

// 지원하는 파일 형식 정의
const SUPPORTED_FORMATS = [
  {
    extension: 'JPG',
    mimeType: 'image/jpeg',
    maxSize: 5 * 1024 * 1024
  },
  {
    extension: 'PNG', 
    mimeType: 'image/png',
    maxSize: 5 * 1024 * 1024
  },
  {
    extension: 'PDF',
    mimeType: 'application/pdf', 
    maxSize: 5 * 1024 * 1024
  }
];

// 지원 형식 조회 API
app.get('/api/medical/supported-formats', (req, res) => {
  try {
    res.json(SUPPORTED_FORMATS);
  } catch (error) {
    console.error('지원 형식 조회 오류:', error);
    res.status(500).json({ error: '지원 형식 조회 중 오류가 발생했습니다.' });
  }
});

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = SUPPORTED_FORMATS.map(format => format.mimeType);
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const supportedExtensions = SUPPORTED_FORMATS.map(f => f.extension).join(', ');
      cb(new Error(`지원하지 않는 파일 형식입니다. 지원 형식: ${supportedExtensions}`), false);
    }
  }
});

// 진료 기록 분석 API (SSE)
app.post('/api/medical/analyze', upload.single('medicalFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
    }

    const analysisId = uuidv4();
    
    console.log(`분석 시작: ${analysisId} - ${req.file.originalname}`);

    // SSE 헤더 설정
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 연결 확인 메시지
    res.write('data: {"type":"connected","message":"의료 기록 분석이 시작되었습니다."}\n\n');

    // 비동기로 분석 시작
    startMedicalAnalysis(analysisId, req.file, res);

  } catch (error) {
    console.error('업로드 오류:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '파일 업로드 중 오류가 발생했습니다.' });
    }
  }
});

// 의료 기록 분석 시뮬레이션 함수
async function startMedicalAnalysis(analysisId, fileInfo, res) {
  const analysisSteps = [
    "의료 기록 파일을 검증하고 있습니다...",
    "OCR을 통해 텍스트를 추출하고 있습니다...",
    "의료 용어 및 약물명을 식별하고 있습니다...",
    "진단명 분석 중: 고혈압 (Essential Hypertension) 확인",
    "혈압 수치 분석: 140/90 mmHg - 정상 범위(120/80 mmHg) 초과",
    "혈액 검사 결과 분석 중...",
    "콜레스테롤 수치 분석: 총 콜레스테롤 220 mg/dL",
    "권장 수치(200 mg/dL 이하)보다 20 mg/dL 높은 상태입니다.",
    "처방 약물 정보를 분석하고 있습니다...",
    "아모디핀(Amlodipine) 5mg 확인 - 칼슘채널차단제",
    "용법: 1일 1회, 식후 복용 권장",
    "아토르바스타틴(Atorvastatin) 20mg 확인 - HMG-CoA 환원효소 억제제",
    "용법: 1일 1회, 저녁 식후 복용 권장",
    "약물 상호작용 검토 완료 - 특별한 주의사항 없음",
    "생활습관 권장사항을 생성하고 있습니다...",
    "운동 처방: 주 3-4회, 30분 이상의 유산소 운동 권장",
    "식이 요법: 나트륨 섭취량 하루 2,300mg 이하로 제한",
    "생활 습관: 금연 및 절주가 혈압 관리에 도움",
    "정기 검진 일정을 수립하고 있습니다...",
    "혈압 모니터링: 3개월 후 재측정 권장",
    "콜레스테롤 추적: 6개월 후 재검사 권장",
    "종합 건강검진: 연 1회 정기 검진 필요",
    "위험 요인 평가 완료 - 중등도 심혈관 위험군",
    "AI 분석이 완료되었습니다. 전문의 상담을 권장합니다."
  ];

  try {
    for (let i = 0; i < analysisSteps.length; i++) {
      // 연결 상태 확인
      if (res.destroyed) {
        console.log(`클라이언트 연결 해제: ${analysisId}`);
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000)); // 2-3초 간격
      
      const progressData = {
        type: i === analysisSteps.length - 1 ? 'complete' : 'progress',
        content: analysisSteps[i],
        timestamp: new Date().toISOString(),
        step: i + 1,
        totalSteps: analysisSteps.length,
        progress: Math.round((i + 1) / analysisSteps.length * 100)
      };

      // SSE로 실시간 전송
      res.write(`data: ${JSON.stringify(progressData)}\n\n`);
      
      console.log(`분석 진행 (${progressData.progress}%): ${analysisId} - ${progressData.content}`);
    }

    // 분석 완료 후 연결 종료
    res.end();
    console.log(`분석 완료: ${analysisId}`);

  } catch (error) {
    console.error(`분석 오류 (${analysisId}):`, error);
    if (!res.destroyed) {
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: '분석 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      })}\n\n`);
      res.end();
    }
  }
}

// 에러 핸들링 미들웨어
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  
  // Multer 에러 처리
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: '예상치 못한 필드명입니다. "medicalFile" 필드를 사용해주세요.' 
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: '파일 크기가 5MB를 초과합니다.' 
    });
  }

  res.status(500).json({ 
    error: '서버에서 오류가 발생했습니다.',
    details: error.message 
  });
});

app.listen(PORT, () => {
  console.log(`의료 분석 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('='.repeat(60));
  console.log('사용 가능한 API 엔드포인트:');
  console.log(`  POST /api/medical/analyze - 진료 기록 분석 (SSE)`);
  console.log(`  GET  /api/medical/supported-formats - 지원 형식 조회`);
  console.log('='.repeat(60));
  console.log('프론트엔드에서 파일을 업로드하면 실시간 분석이 시작됩니다.');
});
```

## 서버 실행 방법

1. 새 터미널에서 서버 디렉토리로 이동
2. `node server.js` 실행
3. 프론트엔드에서 파일 업로드 테스트

## API 엔드포인트

### 🔍 지원 형식 조회
```
GET /api/medical/supported-formats
```

**응답:**
```json
[
  {
    "extension": "JPG",
    "mimeType": "image/jpeg", 
    "maxSize": 5242880
  },
  {
    "extension": "PNG",
    "mimeType": "image/png",
    "maxSize": 5242880
  },
  {
    "extension": "PDF",
    "mimeType": "application/pdf",
    "maxSize": 5242880
  }
]
```

### 📤 진료 기록 분석 (SSE)
```
POST /api/medical/analyze
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

## 주요 변경사항

1. **파일 필드명**: `file` → `medicalFile`
2. **응답 방식**: JSON → SSE 스트림
3. **실시간 분석**: 업로드와 동시에 분석 시작
4. **에러 처리**: Multer 에러 상세 처리

## 보안 고려사항

- CORS 설정으로 특정 도메인만 접근 허용
- 파일 크기 및 형식 검증
- 업로드된 파일은 서버 파일시스템에 안전하게 저장
- 민감한 의료 정보 처리 시 암호화 권장 
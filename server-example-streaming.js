const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 9001;

// CORS 설정
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// JSON 파싱
app.use(express.json());

// Multer 설정 (메모리에 저장)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  }
});

// 지원 형식 조회 API
app.get('/api/medical/supported-formats', (req, res) => {
  console.log('지원 형식 조회 요청');
  
  const formats = [
    {
      extension: 'JPG',
      mimeType: 'image/jpeg',
      description: '처방전',
      maxSize: 5 * 1024 * 1024
    },
    {
      extension: 'PNG', 
      mimeType: 'image/png',
      description: '검사 결과지',
      maxSize: 5 * 1024 * 1024
    },
    {
      extension: 'PDF',
      mimeType: 'application/pdf', 
      description: '진단서',
      maxSize: 5 * 1024 * 1024
    }
  ];
  
  res.json(formats);
});

// 실시간 스트리밍 텍스트 분석 API
app.post('/api/medical/analyze', upload.single('medicalFile'), async (req, res) => {
  console.log('파일 분석 요청 수신');
  
  if (!req.file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }

  console.log('업로드된 파일:', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': req.headers.origin || '*',
    'Access-Control-Allow-Credentials': 'true'
  });

  // 연결 확인 메시지
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    message: '의료 기록 분석이 시작되었습니다.'
  })}\n\n`);

  // 실시간 텍스트 스트리밍 시뮬레이션
  const analysisSteps = [
    "1. 환자 정보: 이름 - 김민수, 나이 - 36세 (1988년 생)",
    "2. 진단명: 고혈압, 고지혈증",
    "3. 주요 증상: 간헐적인 두통, 어지러움, 가슴 답답함",
    "4. 혈압 측정 결과: 140/90 mmHg (정상 범위 초과)",
    "5. 콜레스테롤 수치: 총 콜레스테롤 220 mg/dL (정상 범위: 200 mg/dL 이하)",
    "6. 처방 약물:",
    "   - 아모디핀(Amlodipine) 5mg: 혈압 강하제, 1일 1회 식후 복용",
    "   - 아토르바스타틴(Atorvastatin) 20mg: 콜레스테롤 저하제, 1일 1회 저녁 식후 복용",
    "7. 생활습관 권장사항:",
    "   - 주 3-4회, 30분 이상의 유산소 운동 (걷기, 수영, 자전거)",
    "   - 나트륨 섭취량 하루 2,300mg 이하로 제한",
    "   - 과일, 채소, 통곡물, 저지방 단백질 위주의 식단",
    "   - 금연 및 금주 권장",
    "8. 정기 검진 일정:",
    "   - 3개월 후 혈압 재측정 및 약물 조정",
    "   - 6개월 후 콜레스테롤 수치 재검사",
    "   - 1년 후 종합적인 심혈관 건강 평가",
    "9. 주의사항:",
    "   - 처방된 약물을 임의로 중단하지 말 것",
    "   - 부작용 발생 시 즉시 병원 내원",
    "   - 혈압 자가 측정을 통한 지속적인 모니터링 권장"
  ];

  let accumulatedText = '';
  const totalSteps = analysisSteps.length;

  // 각 단계마다 실시간으로 텍스트 추가
  for (let i = 0; i < analysisSteps.length; i++) {
    const step = analysisSteps[i];
    const progress = Math.round(((i + 1) / totalSteps) * 100);
    
    // 텍스트를 누적
    accumulatedText += (accumulatedText ? '\n' : '') + step;
    
    // progress 타입으로 실시간 전송
    res.write(`data: ${JSON.stringify({
      type: 'progress',
      content: step,
      accumulated: accumulatedText,
      timestamp: new Date().toISOString(),
      step: i + 1,
      totalSteps: totalSteps,
      progress: progress
    })}\n\n`);

    console.log(`단계 ${i + 1}/${totalSteps} 전송: ${step.substring(0, 30)}...`);
    
    // 실시간 효과를 위한 지연 (500ms-1.5초 랜덤)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  // 분석 완료 메시지
  res.write(`data: ${JSON.stringify({
    type: 'complete',
    message: 'AI 분석이 성공적으로 완료되었습니다.',
    result: {
      format: 'text',
      analysis: accumulatedText
    },
    timestamp: new Date().toISOString(),
    step: totalSteps,
    totalSteps: totalSteps,
    progress: 100
  })}\n\n`);

  console.log('분석 완료');
  res.end();
});

// 에러 핸들링
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '파일 크기가 5MB를 초과합니다.' });
    }
  }
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT}에서 실행 중입니다.`);
  console.log('📁 파일 업로드 엔드포인트: POST /api/medical/analyze');
  console.log('📋 지원 형식 조회: GET /api/medical/supported-formats');
  console.log('💬 실시간 SSE 스트리밍으로 분석 결과 제공');
}); 
import { NextRequest, NextResponse } from 'next/server'

interface EmailData {
  name: string
  email: string
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailData = await request.json()
    const { name, email, content } = body

    // 입력값 검증
    if (!name || !email || !content) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이름 검증
    if (name.length > 50) {
      return NextResponse.json(
        { error: '이름은 50자 이하로 입력해주세요.' },
        { status: 400 }
      )
    }

    // 내용 길이 검증
    if (content.length > 5000) {
      return NextResponse.json(
        { error: '내용은 5000자 이하로 입력해주세요.' },
        { status: 400 }
      )
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    try {
      // 백엔드 이메일 서비스 호출
      const backendResponse = await fetch(`${process.env.BACKEND_API_URL || 'http://localhost:9001'}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BACKEND_API_KEY || ''}`,
        },
        body: JSON.stringify({
          name,
          email,
          content,
          subject: '개발자 문의', // 고정 제목
          timestamp: new Date().toISOString()
        })
      })

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}))
        throw new Error(errorData.message || `백엔드 API 호출 실패: ${backendResponse.status}`)
      }

      const backendResult = await backendResponse.json()

    } catch (backendError) {
      // 백엔드 호출 실패 시 클라이언트에 에러 전달
      return NextResponse.json(
        { 
          error: '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
          details: backendError instanceof Error ? backendError.message : '알 수 없는 오류'
        },
        { status: 500 }
      )
    }

    // 성공 응답
    return NextResponse.json(
      { 
        success: true, 
        message: '이메일이 성공적으로 전송되었습니다.',
        data: {
          name,
          email,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: '이메일 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 
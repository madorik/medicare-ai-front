import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json()
    const { name, subject, message } = body

    // 입력값 검증
    if (!name || !subject || !message) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      )
    }


    // 성공 응답
    return NextResponse.json(
      { 
        success: true, 
        message: '메일이 성공적으로 전송되었습니다.' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact API 오류:', error)
    return NextResponse.json(
      { error: '메일 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 
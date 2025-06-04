"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope, Chrome, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  // URL 파라미터에서 오류 메시지 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
          setError('OAuth 인증에 실패했습니다. 다시 시도해주세요.')
          break
        case 'auth_failed':
          setError('인증에 실패했습니다. 다시 시도해주세요.')
          break
        case 'callback_failed':
          setError('로그인 처리 중 오류가 발생했습니다.')
          break
        case 'token_missing':
          setError('인증 토큰을 찾을 수 없습니다.')
          break
        case 'login_failed':
          setError('로그인 처리에 실패했습니다. 다시 시도해주세요.')
          break
        default:
          setError('알 수 없는 오류가 발생했습니다.')
      }
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 백엔드 구글 OAuth URL로 리다이렉트
      window.location.href = `${backendURL}/auth/google`
      
    } catch (error) {
      console.error('구글 로그인 오류:', error)
      setError('로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MediCare AI</span>
          </div>
          <p className="text-gray-600">의료 진료 기록 분석 서비스</p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 로그인 카드 */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-gray-800">로그인</CardTitle>
            <CardDescription className="text-gray-600">
              구글 계정으로 간편하게 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 구글 로그인 버튼 */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full h-12 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              {isLoading ? '로그인 중...' : 'Google로 로그인'}
            </Button>

            {/* 개인정보 보호 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  🔒 개인정보 보호
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  로그인 정보는 서비스 이용 목적으로만 사용되며,<br />
                  의료 기록은 서버에 저장되지 않습니다.
                </p>
              </div>
            </div>

            {/* 서비스 이용 안내 */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                로그인하면 <a href="#" className="text-emerald-600 hover:underline">서비스 이용약관</a>과{' '}
                <a href="#" className="text-emerald-600 hover:underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 하단 링크 */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 메인 페이지로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 
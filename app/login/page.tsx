"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Stethoscope, Shield, Users, Brain, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

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
        case 'auth_required':
          const message = searchParams.get('message')
          setError(message || '이 기능을 사용하려면 로그인이 필요합니다.')
          break
        case 'token_missing':
          setError('OAuth 인증 중 토큰을 받지 못했습니다. 다시 시도해주세요.')
          // 개발 환경에서 디버그 정보 표시
          if (process.env.NODE_ENV === 'development') {
            const details = searchParams.get('details')
                  if (details) {
        // OAuth 디버그 정보
      }
          }
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
      setError('로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[30%] bg-gradient-to-br from-emerald-600 to-emerald-800 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border border-white rounded-full"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/info" className="block">
            <div className="flex items-center space-x-3 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-2xl font-bold">또닥 AI</span>
            </div>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              AI 기반 문서 해석으로
              <br />더 나은 건강관리를
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed">
              의료 문서를 업로드하고 AI의 정확한 해석을 통해
              <br />
              개인 맞춤형 건강 정보를 받아보세요
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
                            <span className="text-emerald-100">AI 기반 정확한 문서 해석</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-emerald-100">안전한 개인정보 보호</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-emerald-100">AI 챗봇 실시간 상담</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[70%] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Link href="/info" className="block">
              <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">또닥 AI</span>
              </div>
            </Link>
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

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">로그인</CardTitle>
              <CardDescription className="text-gray-600">Google 계정으로 간편하게 시작하세요</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                variant="outline"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>로그인 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Google로 계속하기</span>
                  </div>
                )}
              </Button>

              <Separator className="my-6" />

              {/* Terms and Privacy */}
              <div className="text-center space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  로그인하면 또닥 AI의{" "}
                  <Link href="/terms" className="text-emerald-600 hover:underline">
                    이용약관
                  </Link>
                  과{" "}
                  <Link href="/privacy" className="text-emerald-600 hover:underline">
                    개인정보처리방침
                  </Link>
                  에 동의하는 것으로 간주됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
} 

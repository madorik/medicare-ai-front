"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Stethoscope } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const error = urlParams.get('error')

        if (error) {
          console.error('OAuth 오류:', error)
          router.push('/login?error=oauth_failed')
          return
        }

        if (token) {
          // 토큰으로 로그인 처리
          await login(token)
          // 메인 페이지로 리다이렉트
          router.push('/')
        } else {
          // 토큰이 없는 경우 실패 처리
          router.push('/login?error=auth_failed')
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router, login])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">MediCare AI</span>
        </div>
        
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">로그인 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    </div>
  )
} 
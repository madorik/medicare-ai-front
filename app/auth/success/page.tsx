"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Stethoscope } from "lucide-react"

export default function AuthSuccessPage() {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // 현재 URL 전체 확인
        console.log('현재 URL:', window.location.href)
        console.log('URL 검색 파라미터:', window.location.search)
        
        // URL 파라미터에서 토큰 추출
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        
        // 모든 파라미터 확인
        console.log('모든 URL 파라미터:')
        for (const [key, value] of urlParams.entries()) {
          console.log(`${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`)
        }

        if (token) {
          console.log('토큰 받음:', token.substring(0, 20) + '...')
          
          // 토큰으로 로그인 처리
          await login(token)
          
          // URL에서 토큰 제거
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // 메인 페이지로 리다이렉트
          router.push('/')
        } else {
          // 토큰이 없는 경우 로그인 페이지로
          console.error('토큰을 찾을 수 없습니다')
          console.error('받은 파라미터:', Object.fromEntries(urlParams.entries()))
          router.push('/login?error=token_missing')
        }
      } catch (error) {
        console.error('로그인 처리 오류:', error)
        router.push('/login?error=login_failed')
      }
    }

    handleSuccess()
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
          <h2 className="text-xl font-semibold text-gray-800">로그인 완료 중...</h2>
          <p className="text-gray-600">프로필 정보를 가져오는 중입니다.</p>
        </div>
      </div>
    </div>
  )
} 
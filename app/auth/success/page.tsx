"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Stethoscope } from "lucide-react"

export default function AuthSuccessPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        // 디버그 정보 수집
        const currentUrl = window.location.href
        const searchParams = window.location.search
        const hash = window.location.hash
        
        console.log('=== Auth Success 페이지 디버그 ===')
        console.log('현재 URL:', currentUrl)
        console.log('Search Params:', searchParams)
        console.log('Hash:', hash)
        
        // URL 파라미터 확인 (search params 및 hash 모두 확인)
        const urlParams = new URLSearchParams(searchParams)
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        
        // search params에서 토큰 찾기
        let token = urlParams.get('token')
        
        // hash에서도 토큰 찾기 (일부 OAuth 제공자는 hash를 사용)
        if (!token) {
          token = hashParams.get('token') || hashParams.get('access_token')
        }
        
        // 모든 파라미터 로깅
        const allParams = new Map()
        for (const [key, value] of urlParams.entries()) {
          allParams.set(`search.${key}`, value)
        }
        for (const [key, value] of hashParams.entries()) {
          allParams.set(`hash.${key}`, value)
        }
        
        console.log('모든 파라미터:', Object.fromEntries(allParams))
        
        if (token) {
          console.log('✅ 토큰 발견:', token.substring(0, 20) + '...')
          
          // 토큰으로 로그인 처리
          await login(token)
          
          // URL 정리
          window.history.replaceState({}, document.title, window.location.pathname)
          
          // 메인 페이지로 리다이렉트
          router.push('/')
          
        } else if (retryCount < 3) {
          // 토큰이 없으면 몇 번 더 시도 (OAuth 리다이렉트 지연 고려)
          console.log(`⏳ 토큰 없음, 재시도 중... (${retryCount + 1}/3)`)
          setRetryCount(prev => prev + 1)
          setDebugInfo(prev => [...prev, `재시도 ${retryCount + 1}: 토큰 없음`])
          
          // 1초 후 재시도
          setTimeout(() => {
            handleSuccess()
          }, 1000)
          
        } else {
          // 3번 시도 후에도 토큰이 없으면 에러 처리
          console.warn('❌ 최대 재시도 후에도 토큰을 찾을 수 없습니다')
          console.warn('받은 파라미터:', Object.fromEntries(allParams))
          
          // 더 자세한 디버그 정보와 함께 로그인 페이지로
          const errorDetails = encodeURIComponent(`URL: ${currentUrl}, Params: ${JSON.stringify(Object.fromEntries(allParams))}`)
          router.push(`/login?error=token_missing&details=${errorDetails}`)
        }
        
      } catch (error) {
        console.error('로그인 처리 오류:', error)
        router.push('/login?error=login_failed')
      }
    }

    // 페이지 로드 후 약간의 지연을 두고 시작 (OAuth 리다이렉트 안정화)
    const timer = setTimeout(handleSuccess, 100)
    
    return () => clearTimeout(timer)
  }, [router, login, retryCount])

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
          <p className="text-gray-600">
            {retryCount > 0 
              ? `인증 정보 확인 중... (${retryCount}/3)`
              : '프로필 정보를 가져오는 중입니다.'
            }
          </p>
          
          {/* 개발 환경에서만 디버그 정보 표시 */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <div className="mt-6 p-4 bg-white/50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">디버그 정보:</p>
              {debugInfo.map((info, index) => (
                <p key={index} className="text-xs text-gray-600">{info}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
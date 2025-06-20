"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2, Stethoscope } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [retryCount, setRetryCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 디버그 정보 수집
        const currentUrl = window.location.href
        const searchParams = window.location.search
        const hash = window.location.hash
        
            // Auth Callback 페이지 디버그 정보
        
        // URL 파라미터 확인 (search params 및 hash 모두 확인)
        const urlParams = new URLSearchParams(searchParams)
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        
        // search params에서 토큰 및 에러 확인
        let token = urlParams.get('token')
        const error = urlParams.get('error')
        
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
        
        if (error) {
          router.push('/login?error=oauth_failed')
          return
        }

        if (token) {
          // 토큰으로 로그인 처리
          await login(token)
          // 메인 페이지로 리다이렉트
          router.push('/')
          
        } else if (retryCount < 3) {
          // 토큰이 없으면 몇 번 더 시도 (OAuth 리다이렉트 지연 고려)
          setRetryCount(prev => prev + 1)
          setDebugInfo(prev => [...prev, `재시도 ${retryCount + 1}: 토큰 없음`])
          
          // 1초 후 재시도
          setTimeout(() => {
            handleCallback()
          }, 1000)
          
        } else {
          // 3번 시도 후에도 토큰이 없으면 에러 처리
          
          // 더 자세한 디버그 정보와 함께 로그인 페이지로
          const errorDetails = encodeURIComponent(`URL: ${currentUrl}, Params: ${JSON.stringify(Object.fromEntries(allParams))}`)
          router.push(`/login?error=auth_failed&details=${errorDetails}`)
        }
        
      } catch (error) {
        router.push('/login?error=callback_failed')
      }
    }

    // 페이지 로드 후 약간의 지연을 두고 시작 (OAuth 리다이렉트 안정화)
    const timer = setTimeout(handleCallback, 100)
    
    return () => clearTimeout(timer)
  }, [router, login, retryCount])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">또닥 AI</span>
        </div>
        
        <div className="space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">로그인 처리 중...</h2>
          <p className="text-gray-600">
            {retryCount > 0 
              ? `인증 정보 확인 중... (${retryCount}/3)`
              : '잠시만 기다려주세요.'
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

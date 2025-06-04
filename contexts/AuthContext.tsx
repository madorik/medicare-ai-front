"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  socialId?: string
  socialProvider?: string
  profileImage?: string
  createdAt?: string
  updatedAt?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  // API 요청 헬퍼 함수 (Authorization 헤더 자동 추가)
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const currentToken = token || localStorage.getItem('auth_token')
    
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }

    // FormData가 아닌 경우에만 Content-Type 설정
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`
    }

    return fetch(`${backendURL}${url}`, {
      ...options,
      headers,
    })
  }

  // 로그인 처리 (토큰으로 프로필 조회)
  const login = async (authToken: string) => {
    try {
      setIsLoading(true)
      
      // 토큰 저장
      setToken(authToken)
      localStorage.setItem('auth_token', authToken)
      
      // 프로필 조회
      const response = await fetch(`${backendURL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // API 응답 구조에 맞게 user 객체 추출
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          throw new Error('프로필 데이터 형식이 올바르지 않습니다')
        }
      } else {
        const errorText = await response.text()
        throw new Error(`프로필 조회 실패: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      // 오류 시 토큰 제거
      setToken(null)
      localStorage.removeItem('auth_token')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // 로그아웃 처리
  const logout = async () => {
    try {
      // 백엔드 로그아웃 API 호출 (선택사항)
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST'
        })
      }
    } catch (error) {
      console.error('로그아웃 오류:', error)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
    }
  }

  // 인증 상태 확인
  const checkAuth = async () => {
    try {
      setIsLoading(true)
      
      // 로컬 스토리지에서 토큰 확인
      const savedToken = localStorage.getItem('auth_token')
      
      if (savedToken) {
        setToken(savedToken)
        
        // 백엔드에서 프로필 조회로 토큰 유효성 확인
        const response = await fetch(`${backendURL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // API 응답 구조에 맞게 user 객체 추출
          if (data.success && data.user) {
            setUser(data.user)
          } else {
            throw new Error('프로필 데이터 형식이 올바르지 않습니다')
          }
        } else {
          // 토큰이 유효하지 않은 경우 로컬 스토리지 정리
          localStorage.removeItem('auth_token')
          setToken(null)
          setUser(null)
        }
      } else {
        console.log('저장된 토큰이 없음')
      }
    } catch (error) {
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // 컴포넌트 마운트 시 인증 상태 확인
  useEffect(() => {
    checkAuth()
  }, [])

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    checkAuth
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다')
  }
  return context
}

// API 요청을 위한 커스텀 훅
export function useApiRequest() {
  const { token } = useAuth()
  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }

    // FormData가 아닌 경우에만 Content-Type 설정
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(`${backendURL}${url}`, {
      ...options,
      headers,
    })
  }

  return { apiRequest }
} 
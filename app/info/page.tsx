"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Stethoscope, 
  Brain, 
  Shield, 
  FileText, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Heart,
  Award,
  LogOut,
  Sparkles,
  TrendingUp,
  Globe,
  Lock,
  MessageCircle,
  Smartphone,
  AlertCircle,
  Crown,
  X
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export default function InfoPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  
  // 이벤트 관련 상태
  const [showEventModal, setShowEventModal] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  // 쿠키 관리 함수들
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
  }

  const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=')
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '')
  }

  // 신규 사용자 체크 및 이벤트 팝업 표시 함수 (로그인 사용자만)
  const checkNewUser = () => {
    // 로그인하지 않은 사용자는 처리하지 않음
    if (!user || !user.createdAt) {
      console.log('🔍 로그인하지 않은 사용자 또는 createdAt 정보 없음:', user)
      setIsNewUser(false)
      return
    }
    
    const createdAt = new Date(user.createdAt)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('📅 가입일 체크:', {
      createdAt: createdAt.toISOString(),
      now: now.toISOString(),
      diffInDays,
      isNewUser: diffInDays <= 3
    })
    
    // 신규 사용자 여부 설정 (가입 후 3일 이내)
    if (diffInDays <= 3) {
      setIsNewUser(true)
    } else {
      setIsNewUser(false)
    }
    
    // 로그인한 사용자에게만 이벤트 모달 표시 (쿠키로 중복 방지)
    const hasSeenEventModal = getCookie('hasSeenEventModal')

    if (!hasSeenEventModal) {
      setShowEventModal(true)
    } 
  }

  // 이벤트 모달 닫기 핸들러
  const handleCloseEventModal = () => {
    if (dontShowAgain) {
      setCookie('hasSeenEventModal', 'true', 30) // 30일간 보지 않기
    }
    setShowEventModal(false)
    setDontShowAgain(false)
  }

  // 사용자 상태 변경 시 신규 사용자 체크
  useEffect(() => {
    if (user && !isLoading) {
      checkNewUser()
    }
  }, [user, isLoading])

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout()
      router.push('/info')
    } catch (error) {
      console.error('로그아웃 중 오류가 발생했습니다.', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/60 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-200 transition-all duration-300">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                또닥 AI
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="flex items-center flex-wrap gap-3">
                      <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-200 transition-all duration-300">
                        <Link href="/analyze">
                          <FileText className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">분석하기</span>
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">로그아웃</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" asChild className="text-gray-700 hover:text-emerald-600 transition-colors">
                        <Link href="/login">로그인</Link>
                      </Button>
                      <Button asChild className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-200 transition-all duration-300">
                        <Link href="/analyze">
                          무료로 시작하기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                  

                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-gray-900 leading-tight break-keep">
              <span className="text-emerald-600">복잡한 의료용어</span>를
              <br />
              <span className="text-emerald-600">쉽게 이해</span>하세요
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 leading-relaxed">
              AI가 어려운 의료문서를 <strong className="text-gray-900">누구나 이해할 수 있게</strong> 번역하고,
              <br />
              <strong className="text-emerald-600">개인 맞춤 상담</strong>까지 제공합니다
            </p>



                         {/* 핵심 수치 */}
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
               <div className="text-center">
                 <div className="text-4xl font-bold text-emerald-600 mb-2">30초</div>
                 <div className="text-gray-600">초고속 AI 해석</div>
               </div>
               <div className="text-center">
                 <div className="text-4xl font-bold text-emerald-600 mb-2">24시간</div>
                 <div className="text-gray-600">AI 챗봇과 언제든지 상담</div>
               </div>
               <div className="text-center">
                 <div className="text-4xl font-bold text-emerald-600 mb-2">맞춤형</div>
                 <div className="text-gray-600">개인화된 해석</div>
               </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                 size="lg" 
                 asChild 
                 className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-4"
               >
                 <Link href="/analyze">
                   <FileText className="w-5 h-5 mr-2" />
                   문서 업로드하기
                 </Link>
               </Button>
               <Button 
                 size="lg" 
                 variant="outline"
                 asChild
                 className="text-gray-700 border-gray-300 hover:bg-gray-50 text-lg px-8 py-4"
               >
                 <Link href="#features">
                   자세히 알아보기
                 </Link>
               </Button>
             </div>



                         {/* 법적 안내 - 간결한 디자인 */}
             <div className="mt-16 max-w-3xl mx-auto">
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                 <p className="text-gray-700">
                   본 서비스는 <strong>교육 및 정보 제공 목적</strong>입니다. 
                   의료 진단 및 처방은 <strong>반드시 전문 의료진과 상담</strong>하세요.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section - 핵심 3가지 */}
      <section id="features" className="py-20 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              <span className="text-emerald-600">어려운 의료용어</span>도 이제 쉽게
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              복잡한 검사결과를 <strong>의사가 설명하듯</strong> 쉽게 이해하고, 
              <strong>나만의 상황에 맞는 조언</strong>까지 받아보세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
            {/* 핵심 강점 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">복잡한 의료용어를 쉽게</h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-left space-y-4">
                  <div className="flex items-start">
                    <div className="text-red-500 font-mono text-sm mr-3 mt-1">❌</div>
                    <div className="text-gray-500 text-sm">"혈청 크레아티닌 1.2mg/dL"</div>
                  </div>
                  <div className="flex items-start">
                    <div className="text-emerald-500 font-mono text-sm mr-3 mt-1">✅</div>
                    <div className="text-gray-700">"신장 기능이 정상 범위입니다. 걱정하지 마세요!"</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 핵심 강점 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">개인 맞춤 상담</h3>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="text-left space-y-3">
                  <div className="text-sm text-gray-600">💬 "이 수치가 높은 이유가 뭔가요?"</div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800">
                    "당신의 나이(35세)와 운동량을 고려하면, 이 정도는 정상입니다. 
                    다만 주 3회 유산소 운동을 추천드려요."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">
              사용 방법
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              간단한 3단계로 완료
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              복잡한 의료 용어도 AI가 <strong className="text-gray-800">쉽게 이해할 수 있도록</strong> 해석해드립니다.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">문서 업로드</h3>
              <p className="text-gray-600 leading-relaxed">
                처방전, 검사 결과지, 진단서 등의 의료 문서를 
                간단히 드래그하여 업로드하세요.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">AI 해석</h3>
              <p className="text-gray-600 leading-relaxed">
                고도화된 AI가 문서를 분석하여 주요 정보를 추출하고 
                이해하기 쉽게 설명합니다.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">결과 확인 & 상담</h3>
              <p className="text-gray-600 leading-relaxed">
                이해하기 쉬운 한국어로 변환된 해석 결과를 확인하고 
                AI와 추가 상담을 진행하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 mb-4">
              고객 후기
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              사용자들의 생생한 후기
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              실제 사용자들이 경험한 또닥 AI의 놀라운 효과를 확인해보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">김*수 님</div>
                    <div className="text-sm text-gray-500">직장인</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  "복잡한 건강검진 결과를 이해하기 어려웠는데, 또닥 AI 덕분에 쉽게 파악할 수 있었어요. 
                  특히 수치들의 의미를 자세히 설명해줘서 도움이 많이 됐습니다."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">박*정 님</div>
                    <div className="text-sm text-gray-500">주부</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  "아이들 처방전을 받을 때마다 궁금했던 약물 정보들을 쉽게 알 수 있어서 도움이 돼요.
                  복용법이나 주의사항도 친절하게 설명해줍니다."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">이*현 님</div>
                    <div className="text-sm text-gray-500">대학생</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  "혈액검사 결과를 받았는데 궁금했던 내용들을 편하게 확인할 수 있어서 좋아요.
                  복잡한 의료 용어를 쉽게 풀어서 설명해주네요."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section - 깔끔한 최종 행동 유도 */}
      <section className="py-20 md:py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              어려운 의료용어, 이제 <span className="text-emerald-600">쉽게 이해</span>하세요
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              복잡한 검사결과를 <strong>의사처럼 친절하게 설명</strong>하고, 
              <strong>개인 상황에 맞는 조언</strong>까지 제공합니다
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-12 max-w-2xl mx-auto">
              <div className="text-center text-gray-700">
                <div className="text-2xl font-bold text-emerald-600 mb-2">✨ 차별점</div>
                <p>단순 번역이 아닌 <strong>개인 맞춤형 의료 상담</strong></p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg px-8 py-4"
              >
                <Link href="/analyze">
                  <FileText className="w-5 h-5 mr-2" />
                  문서 업로드하기
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                asChild
                className="text-gray-700 border-gray-300 hover:bg-gray-50 text-lg px-8 py-4"
              >
                <Link href="/guide">
                  사용법 알아보기
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">또닥 AI</span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-4">
                AI 기술로 의료 정보를 더 쉽고 빠르게 
                이해할 수 있도록 도와드립니다.
              </p>
              <div className="text-sm text-gray-500">
                교육 및 정보 제공 목적으로 제작되었습니다.
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">서비스</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="/analyze" className="hover:text-white transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    AI 진료 기록 분석
                  </a>
                </li>
                <li>
                  <a href="/analyze?chat=true" className="hover:text-white transition-colors flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    AI 채팅 상담
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">지원</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    자주 묻는 질문
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="hover:text-white transition-colors">
                    사용 가이드
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    문의하기
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-lg">법적 고지</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2025 또닥 AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* 신규 사용자 이벤트 모달 */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* 이벤트 헤더 */}
            <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white text-center relative">
              <button
                onClick={handleCloseEventModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="mb-2">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-8 h-8 text-yellow-300" />
                </div>
                <h2 className="text-2xl font-bold mb-1">🎉 환영합니다!</h2>
                <p className="text-emerald-100 text-sm">가입을 축하드립니다</p>
              </div>
            </div>

            {/* 이벤트 내용 */}
            <div className="p-6">
                             <div className="text-center mb-6">
                 <h3 className="text-xl font-bold text-gray-900 mb-2">
                   {isNewUser ? "신규 가입 이벤트" : "진행중인 이벤트"}
                 </h3>
                 <p className="text-gray-600 mb-4">
                   {isNewUser ? (
                     <>가입 후 <span className="font-bold text-emerald-600">3일간</span> 모든 프리미엄 기능을 광고없이 무제한으로 사용하세요!</>
                   ) : (
                     <>현재 진행중인 <span className="font-bold text-emerald-600">특별 이벤트</span>를 확인해보세요!</>
                   )}
                 </p>
               </div>

                             <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 mb-6">
                 <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                   <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                   {isNewUser ? "무료로 사용 가능한 기능" : "프리미엄 기능 안내"}
                 </h4>
                 <ul className="space-y-2 text-sm text-gray-700">
                   <li className="flex items-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                     GPT-4o 고급 AI 모델 사용
                     {!isNewUser && <span className="ml-2 text-xs text-orange-600">(광고 시청 후)</span>}
                   </li>
                   <li className="flex items-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                     GPT-4.1 최신 AI 모델 사용
                     {!isNewUser && <span className="ml-2 text-xs text-orange-600">(광고 시청 후)</span>}
                   </li>
                   <li className="flex items-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                     {isNewUser ? "무제한 의료 문서 분석" : "의료 문서 분석 (일 3회)"}
                   </li>
                   <li className="flex items-center">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                     {isNewUser ? "무제한 AI 채팅 상담" : "AI 채팅 상담"}
                   </li>
                 </ul>
               </div>

                             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                 <p className="text-xs text-yellow-800 text-center">
                   {isNewUser ? (
                     <>⏰ 신규 혜택: 가입일로부터 3일간 (자동 적용)</>
                   ) : (
                     <>⭐ 기존 사용자도 프리미엄 기능을 경험해보세요!</>
                   )}
                 </p>
               </div>

              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="dontShowAgainInfo"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <label htmlFor="dontShowAgainInfo" className="text-sm text-gray-600">
                  다시 보지 않기
                </label>
              </div>

              <Button
                onClick={handleCloseEventModal}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white py-3"
              >
                지금 바로 시작하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 

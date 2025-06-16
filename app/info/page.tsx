"use client"

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
  Award
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export default function InfoPage() {
  const { user, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">MediCare AI</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-600 transition-colors">
                기능
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-emerald-600 transition-colors">
                사용법
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-emerald-600 transition-colors">
                후기
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              {!isLoading && (
                <>
                  {user ? (
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/analyze">
                        <FileText className="w-4 h-4 mr-2" />
                        분석하기
                      </Link>
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">로그인</Link>
                      </Button>
                      <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
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
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                의료 기록을
              </span>
              <br />
              <span className="text-gray-900">
                AI가 분석해드려요
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              처방전, 검사 결과지, 진단서를 업로드해주세요. <br />
              AI가 즉시 분석하여 쉽고 명확한 의료 정보를 제공합니다.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                asChild 
                className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6"
              >
                <Link href="/analyze">
                  <FileText className="w-5 h-5 mr-2" />
                  지금 무료로 시작하기
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <Brain className="w-5 h-5 mr-2" />
                데모 영상 보기
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">98%</div>
                <div className="text-gray-600">분석 정확도</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">30초</div>
                <div className="text-gray-600">평균 분석 시간</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">1만+</div>
                <div className="text-gray-600">분석 완료</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              왜 MediCare AI인가요?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI 기술과 의료 전문 지식을 결합하여 쉽고 빠르게 진료 분석 결과를 제공합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI 기반 정확한 분석</CardTitle>
                <CardDescription>
                  최신 의료 AI 모델로 처방전과 검사 결과를 정확하게 분석하여 이해하기 쉬운 정보로 변환합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">빠른 실시간 분석</CardTitle>
                <CardDescription>
                  업로드 후 30초 이내로 분석 결과를 제공하여 빠르게 분석 결과를 확인할 수 있습니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">완벽한 개인정보 보호</CardTitle>
                <CardDescription>
                  업로드된 모든 파일은 분석 후 즉시 삭제되며, 개인 의료 정보는 절대 저장되지 않습니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              간단한 3단계로 완료
            </h2>
            <p className="text-xl text-gray-600">
              복잡한 의료 용어도 쉽게 이해할 수 있도록 도와드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">1. 파일 업로드</h3>
              <p className="text-gray-600">
                처방전, 검사 결과지, 진단서 등의 의료 문서를 간단히 드래그하여 업로드하세요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">2. AI 분석</h3>
              <p className="text-gray-600">
                고도화된 의료 AI가 문서를 분석하여 주요 정보를 추출하고 해석합니다.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">3. 결과 확인</h3>
              <p className="text-gray-600">
                이해하기 쉬운 한국어로 변환된 분석 결과를 확인하고 추가 질문도 할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              사용자 후기
            </h2>
            <p className="text-xl text-gray-600">
              실제 사용자들의 생생한 후기를 확인해보세요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold">김민수님</div>
                    <div className="text-sm text-gray-600">직장인</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "복잡한 건강검진 결과를 이해하기 어려웠는데, MediCare AI 덕분에 쉽게 파악할 수 있었어요. 
                  특히 수치들의 의미를 자세히 설명해줘서 도움이 많이 됐습니다."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold">박은정님</div>
                    <div className="text-sm text-gray-600">주부</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "아이들 처방전을 받을 때마다 궁금했던 약물 정보들을 상세히 알 수 있어서 안심이 돼요. 
                  부작용이나 주의사항도 친절하게 설명해줍니다."
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold">이수현님</div>
                    <div className="text-sm text-gray-600">대학생</div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  "혈액검사 결과를 받았는데 의사 선생님께 묻기 부끄러웠던 내용들을 편하게 물어볼 수 있어서 좋아요. 
                  24시간 언제든 사용할 수 있는 점도 장점입니다."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            복잡한 의료 용어, 이제 걱정하지 마세요. 
            AI가 쉽고 정확하게 설명해드립니다.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              asChild 
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8 py-6"
            >
              <Link href="/analyze">
                <FileText className="w-5 h-5 mr-2" />
                무료로 시작하기
              </Link>
            </Button>
          </div>

          <p className="text-sm mt-6 opacity-70">
            가입비, 월 사용료 없음 • 개인정보 완벽 보호 • 즉시 사용 가능
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MediCare AI</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI 기술로 의료 정보를 더 쉽고 빠르게  <br />
                이해할 수 있도록 돕습니다.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">서비스</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/analyze" className="hover:text-white transition-colors">
                    의료 문서 분석
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    AI 채팅 상담
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    건강 정보 검색
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    고객지원
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    사용 가이드
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">법적 고지</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    의료면책조항
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 MediCare AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 
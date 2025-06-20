"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  Stethoscope, 
  ArrowLeft,
  MessageSquare,
  Send,
  User,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Phone,
  Globe,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // 간단한 유효성 검사
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("모든 필드를 입력해주세요.")
      setIsSubmitting(false)
      return
    }

    try {
      // 이메일 전송 API 호출
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          content: contactForm.message
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '이메일 전송에 실패했습니다.')
      }

      toast.success("문의가 성공적으로 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.")
      
      // 폼 초기화
      setContactForm({ name: "", email: "", message: "" })
      
    } catch (error) {
      console.error('이메일 전송 오류:', error)
      toast.error(error instanceof Error ? error.message : "이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/info" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">또닥 AI</span>
            </Link>

            {/* Back Button */}
            <Button variant="outline" asChild>
              <Link href="/info">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">문의하기</h1>
            <p className="text-xl text-gray-600">
              궁금한 점이나 건의사항이 있으시면 언제든지 연락해주세요.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">개발자에게 문의하기</CardTitle>
                      <CardDescription>
                        문의사항을 남겨주시면 빠르게 답변드리겠습니다.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4" />
                          <span>이름</span>
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="이름을 입력하세요"
                          value={contactForm.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                          <Mail className="w-4 h-4" />
                          <span>연락 받을 이메일</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="이메일을 입력하세요"
                          value={contactForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message" className="flex items-center space-x-2 mb-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>문의 내용</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="문의하실 내용을 자세히 작성해주세요"
                        rows={8}
                        value={contactForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        required
                        className="resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "전송 중..."
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            문의 전송
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span>연락처 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">이메일</div>
                        <div className="text-gray-600">xornjs1988@gmail.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">운영시간</div>
                        <div className="text-gray-600">평일 오전 9시 ~ 오후 6시</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <MessageSquare className="w-5 h-5 text-emerald-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">응답시간</div>
                        <div className="text-gray-600">24시간 이내 답변</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    자주 묻는 질문
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    먼저 FAQ에서 답을 찾아보세요. 대부분의 궁금증을 해결할 수 있습니다.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/faq">
                      FAQ 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Help Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">다른 도움이 필요하신가요?</h2>
              <p className="text-gray-600">
                다양한 방법으로 도움을 받으실 수 있습니다.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">사용 가이드</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    서비스 이용 방법을 단계별로 안내해드립니다.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/guide">
                      가이드 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">이용약관</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    서비스 이용에 관한 약관을 확인하세요.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/terms">
                      약관 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold mb-2">개인정보처리방침</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    개인정보 보호 정책을 확인하세요.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/privacy">
                      정책 보기
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

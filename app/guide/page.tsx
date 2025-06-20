"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Stethoscope, 
  ArrowLeft,
  Upload,
  Brain,
  CheckCircle,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
  Play
} from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: 1,
    title: "1. 문서 업로드",
    description: "처방전, 검사 결과지, 진단서 등의 의료 문서를 업로드하세요.",
    icon: Upload,
    details: [
      "JPG, PNG, PDF 형식 지원",
      "최대 5MB 크기 제한",
      "여러 파일 동시 업로드 가능"
    ]
  },
  {
    number: 2,
    title: "AI 분석",
    description: "고도화된 의료 AI가 문서를 분석하여 주요 정보를 추출합니다.",
    icon: Brain,
    details: [
      "평균 30초 이내에 분석이 완료됩니다",
      "의료 용어를 이해하기 쉬운 한국어로 번역합니다",
      "주요 수치와 정상 범위를 비교하여 설명합니다",
      "주의사항이나 추가 검사 필요 여부를 안내합니다"
    ]
  },
  {
    number: 3,
    title: "결과 확인 및 질문",
    description: "분석 결과를 확인하고 추가 질문을 할 수 있습니다.",
    icon: MessageSquare,
    details: [
      "분석 결과를 상세히 읽어보세요",
      "이해가 안 되는 부분은 AI에게 질문하세요",
      "관련된 추가 정보를 요청할 수 있습니다",
      "결과를 저장하거나 공유할 수 있습니다"
    ]
  }
]

const tips = [
  {
    title: "더 정확한 분석을 위한 팁",
    icon: CheckCircle,
    items: [
      "문서가 선명하게 보이도록 촬영해주세요",
      "전체 내용이 다 보이도록 프레임에 맞춰 촬영하세요",
      "그림자나 반사가 없도록 주의해주세요",
      "텍스트가 잘 읽힐 수 있도록 초점을 맞춰주세요"
    ]
  },
  {
    title: "주의사항",
    icon: AlertTriangle,
    items: [
      "AI 분석 결과는 참고용이며, 정확한 진단은 의료진과 상담하세요",
      "응급 상황에서는 즉시 119에 신고하거나 응급실을 방문하세요",
      "약물 복용이나 치료 변경은 반드시 의료진과 상의하세요",
      "개인정보가 포함된 문서는 분석 후 즉시 삭제됩니다"
    ]
  }
]

const documentTypes = [
  {
    name: "처방전",
    description: "약물 정보, 복용법, 주의사항 등을 분석합니다",
    supported: true
  },
  {
    name: "혈액검사 결과",
    description: "각종 수치의 의미와 정상 범위를 설명합니다",
    supported: true
  },
  {
    name: "소변검사 결과",
    description: "검사 항목별 결과의 의미를 알려드립니다",
    supported: true
  },
  {
    name: "영상검사 결과",
    description: "X-ray, CT, MRI 등의 소견을 해석합니다",
    supported: true
  },
  {
    name: "진단서",
    description: "진단명과 치료 계획을 쉽게 설명합니다",
    supported: true
  },
  {
    name: "건강검진 결과",
    description: "종합적인 건강 상태를 평가해드립니다",
    supported: true
  }
]

export default function GuidePage() {
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
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">사용 가이드</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              또닥 AI를 효과적으로 활용하는 방법을 단계별로 안내해드립니다.
            </p>
          </div>

          {/* Quick Start */}
          <Card className="mb-16 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    바로 시작하기
                  </h2>
                  <p className="text-gray-600 mb-4">
                    의료 문서를 업로드하고 즉시 AI 분석을 받아보세요.
                  </p>
                </div>
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/analyze">
                    <Play className="w-5 h-5 mr-2" />
                    지금 시작하기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step by Step Guide */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              단계별 이용 방법
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <Card key={step.number} className="relative overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="absolute top-4 right-4">
                      {step.number}단계
                    </Badge>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription className="text-base">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Supported Documents */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              지원하는 문서 종류
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentTypes.map((doc, index) => (
                <Card key={index} className={doc.supported ? "border-emerald-200" : "border-gray-200 opacity-50"}>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className={`w-8 h-8 ${doc.supported ? 'text-emerald-600' : 'text-gray-400'}`} />
                      {doc.supported && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 ml-2" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Tips and Warnings */}
          <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
              {tips.map((tip, index) => (
                <Card key={index} className={tip.icon === AlertTriangle ? "border-yellow-200 bg-yellow-50" : "border-emerald-200 bg-emerald-50"}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <tip.icon className={`w-6 h-6 ${tip.icon === AlertTriangle ? 'text-yellow-600' : 'text-emerald-600'}`} />
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tip.items.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${tip.icon === AlertTriangle ? 'bg-yellow-600' : 'bg-emerald-600'}`} />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Privacy and Security */}
          <Card className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <Shield className="w-12 h-12 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    개인정보 보호 및 보안
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">데이터 보안</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• 모든 데이터는 SSL 암호화로 전송</li>
                        <li>• 업로드된 파일은 분석 후 즉시 삭제</li>
                        <li>• 개인정보는 절대 저장하지 않음</li>
                        <li>• 제3자와 정보 공유 없음</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">의료정보 처리</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• 의료정보보호법 준수</li>
                        <li>• 개인정보보호법 준수</li>
                        <li>• 익명화된 데이터만 임시 처리</li>
                        <li>• 분석 완료 시 즉시 완전 삭제</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Help */}
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                도움이 필요하신가요?
              </h3>
              <p className="text-gray-600 mb-6">
                사용 중 어려움이 있으시면 언제든지 문의해주세요. 빠르게 도와드리겠습니다.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link href="/faq">
                    자주 묻는 질문
                  </Link>
                </Button>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/contact">
                    문의하기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 

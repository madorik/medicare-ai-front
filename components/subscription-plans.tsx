"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"

export default function SubscriptionPlans() {
  const plans = [
    {
      name: "베이직",
      price: "무료",
      description: "기본적인 AI 분석 서비스",
      icon: <Check className="w-5 h-5" />,
      features: ["월 3회 문서 해석", "기본 AI 모델 사용", "해석 결과 요약 제공", "이메일 지원"],
      buttonText: "무료 시작",
      buttonVariant: "outline" as const,
      popular: false,
    },
    {
      name: "프로",
      price: "₩29,000",
      period: "/월",
      description: "고급 AI 분석과 전문가 상담",
      icon: <Star className="w-5 h-5" />,
      features: [
        "무제한 문서 해석",
        "고급 GPT-4 모델 사용",
        "상세 분석 리포트",
        "월 2회 전문가 상담",
        "개인 맞춤형 건강 플랜",
        "우선 고객 지원",
      ],
      buttonText: "프로 시작하기",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "프리미엄",
      price: "₩59,000",
      period: "/월",
      description: "최고급 서비스와 무제한 상담",
      icon: <Crown className="w-5 h-5" />,
      features: [
        "모든 프로 기능 포함",
        "최신 GPT-4 Turbo 모델",
        "무제한 전문가 상담",
        "24시간 응급 상담",
        "가족 계정 (최대 4명)",
        "전담 건강 매니저",
        "연간 종합 건강 리포트",
      ],
      buttonText: "프리미엄 시작하기",
      buttonVariant: "default" as const,
      popular: false,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">구독 플랜</h3>
        <p className="text-gray-600">필요에 맞는 플랜을 선택하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <Card
            key={index}
            className={`relative ${plan.popular ? "border-emerald-500 shadow-lg scale-105" : "border-gray-200"}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  인기
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                  plan.popular ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                }`}
              >
                {plan.icon}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                {plan.price}
                {plan.period && <span className="text-lg font-normal text-gray-600">{plan.period}</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                variant={plan.buttonVariant}
              >
                {plan.buttonText}
              </Button>

              {plan.name !== "베이직" && (
                <p className="text-xs text-gray-500 text-center">언제든지 취소 가능 • 7일 무료 체험</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-4">모든 플랜에는 데이터 보안과 개인정보 보호가 포함됩니다</p>
        <div className="flex justify-center space-x-6 text-xs text-gray-500">
          <span>✓ HIPAA 준수</span>
          <span>✓ 256bit SSL 암호화</span>
          <span>✓ GDPR 준수</span>
        </div>
      </div>
    </div>
  )
}

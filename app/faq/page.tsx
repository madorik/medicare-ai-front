"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Stethoscope, 
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: "서비스 이용",
    question: "MediCare AI는 어떤 서비스인가요?",
    answer: "MediCare AI는 인공지능을 활용하여 처방전, 검사 결과지, 진단서 등의 의료 문서를 분석하고 이해하기 쉬운 한국어로 설명해주는 서비스입니다. 복잡한 의료 용어를 쉽게 이해할 수 있도록 도와드립니다."
  },
  {
    id: 2,
    category: "서비스 이용",
    question: "어떤 종류의 의료 문서를 분석할 수 있나요?",
    answer: "처방전, 혈액검사 결과지, 소변검사 결과지, 진단서, 의사소견서 등 다양한 의료 문서를 분석할 수 있습니다. JPG, PNG, PDF 형식의 파일을 지원합니다."
  },
  {
    id: 3,
    category: "서비스 이용",
    question: "분석 결과는 얼마나 정확한가요?",
    answer: "MediCare AI는 최신 의료 AI 모델을 사용하여 98% 이상의 높은 정확도를 자랑합니다. 하지만 AI 분석 결과는 참고용이며, 정확한 진단이나 치료 결정은 반드시 의료진과 상담하시기 바랍니다."
  },
  {
    id: 4,
    category: "개인정보",
    question: "업로드한 의료 문서는 어떻게 처리되나요?",
    answer: "업로드된 의료 문서 파일은 분석 완료 후 즉시 삭제됩니다. 분석 결과와 상담 기록은 서비스 제공 및 품질 개선을 위해 최대 3일간 안전하게 보관된 뒤 자동 삭제됩니다. 개인의 의료 정보는 절대 제3자와 공유되지 않습니다. 모든 데이터는 암호화되어 안전하게 처리됩니다."
  },
  {
    id: 5,
    category: "개인정보",
    question: "개인정보는 안전한가요?",
    answer: "네, 매우 안전합니다. 모든 데이터는 SSL 암호화를 통해 전송됩니다. 업로드된 의료 문서 파일은 즉시 삭제되며, 분석 결과 및 상담 기록은 최대 3일간 안전하게 보관된 후 자동 삭제됩니다. 개인정보보호법을 철저히 준수합니다."
  },
  {
    id: 6,
    category: "결제 및 이용",
    question: "서비스 이용료가 있나요?",
    answer: "현재 MediCare AI는 무료로 제공되고 있습니다. 향후 프리미엄 기능이 추가될 수 있으나, 기본 분석 서비스는 계속 무료로 이용하실 수 있습니다."
  },
  {
    id: 7,
    category: "결제 및 이용",
    question: "회원가입이 필요한가요?",
    answer: "Google 계정으로 간편하게 로그인하시면 모든 기능을 이용하실 수 있습니다. 별도의 회원가입 절차는 없으며, 로그인 후 바로 서비스를 이용하실 수 있습니다."
  },
  {
    id: 8,
    category: "기술적 문제",
    question: "파일 업로드가 안 돼요. 어떻게 해야 하나요?",
    answer: "파일 크기가 10MB를 초과하지 않는지 확인해주세요. 지원 형식은 JPG, PNG, PDF입니다. 문제가 지속될 경우 브라우저를 새로고침하거나 다른 브라우저에서 시도해보세요."
  },
  {
    id: 9,
    category: "기술적 문제",
    question: "분석이 너무 오래 걸려요.",
    answer: "일반적으로 분석은 30초 이내에 완료됩니다. 네트워크 상태나 서버 상황에 따라 지연될 수 있습니다. 2분 이상 지연될 경우 페이지를 새로고침하고 다시 시도해주세요."
  },
  {
    id: 10,
    category: "의료 정보",
    question: "AI 분석 결과를 의료진에게 보여줘도 되나요?",
    answer: "네, 가능합니다. 다만 AI 분석 결과는 참고 자료일 뿐이며, 정확한 진단과 치료는 의료진의 판단에 따라 이루어져야 합니다. 의료진과 상담 시 원본 검사 결과와 함께 참고 자료로 활용하시기 바랍니다."
  }
]

const categories = ["전체", "서비스 이용", "개인정보", "결제 및 이용", "기술적 문제", "의료 정보"]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [openItems, setOpenItems] = useState<number[]>([])


  const filteredFAQ = selectedCategory === "전체" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
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
              <span className="text-2xl font-bold text-gray-900">MediCare AI</span>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <HelpCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">자주 묻는 질문</h1>
            <p className="text-xl text-gray-600">
              MediCare AI 이용 중 궁금한 점들을 모아두었습니다.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQ.map((item) => (
              <Card key={item.id} className="border border-gray-200 shadow-sm">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <CardTitle className="text-lg text-left">
                        {item.question}
                      </CardTitle>
                    </div>
                    {openItems.includes(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                
                {openItems.includes(item.id) && (
                  <CardContent className="pt-0">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                더 궁금한 점이 있으신가요?
              </h3>
              <p className="text-gray-600 mb-6">
                위에서 답을 찾지 못하셨다면 언제든지 문의해주세요.
              </p>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link href="/contact">
                  문의하기
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>


    </div>
  )
} 
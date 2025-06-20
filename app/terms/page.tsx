"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Stethoscope, 
  ArrowLeft,
  FileText,
  Scale
} from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
              <Scale className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">이용약관</h1>
            <p className="text-lg text-gray-600">
              MediCare AI 서비스 이용에 관한 약관입니다.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              시행일: 2025년 6월 6일
            </p>
          </div>

          {/* Terms Content */}
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제1조 (목적)</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    본 약관은 MediCare AI(이하 "서비스 제공자")가 제공하는 인공지능 기반 의료 문서 해석 서비스(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">제2조 (용어의 정의)</h2>
                  <div className="space-y-2">
                    <p><strong>1. "서비스"</strong>란 서비스 제공자가 제공하는 AI 기반 의료 문서 해석 및 정보 제공 서비스를 의미합니다.</p>
                    <p><strong>2. "이용자"</strong>란 이 약관에 따라 서비스 제공자가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
                    <p><strong>3. "의료 문서"</strong>란 처방전, 검사 결과지, 진단서 등 의료 관련 문서를 의미합니다.</p>
                    <p><strong>4. "AI 해석"</strong>란 인공지능 기술을 활용한 의료 문서 해석 및 정보 제공 서비스를 의미합니다.</p>
                    <p><strong>5. "서비스 제공자"</strong>란 개인으로서 본 서비스를 운영하는 자를 의미합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</p>
                    <p>2. 서비스 제공자는 합리적인 사유가 발생할 경우 본 약관을 변경할 수 있으며, 이용자에게 불리한 약관 변경의 경우 적용일로부터 최소 30일 전에, 그렇지 않은 경우에는 최소 7일 전에 서비스 내 공지사항을 통해 공지합니다.</p>
                    <p>3. 이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.</p>
                    <p>4. 서비스 제공자가 약관을 개정할 경우 개정된 약관의 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 내 초기화면에 그 적용일자 7일(이용자에게 불리한 변경의 경우 30일) 이전부터 적용일자 전일까지 공지합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">제4조 (서비스의 내용)</h2>
                  <p>서비스 제공자가 제공하는 서비스의 내용은 다음과 같습니다:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>의료 문서 업로드 및 AI 해석 서비스</li>
                    <li>해석 결과에 대한 정보 제공 서비스</li>
                    <li>의료 정보에 대한 AI 정보 제공 서비스</li>
                    <li>기타 서비스 제공자가 정하는 서비스</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제5조 (이용자의 의무)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 이용자는 다음과 같은 행위를 해서는 안 됩니다:</p>
                    <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                      <li>서비스 제공자의 서비스 운영을 방해하는 행위</li>
                      <li>다른 이용자의 개인정보를 수집, 저장, 공개하는 행위</li>
                      <li>타인의 개인정보나 의료정보를 무단으로 사용하는 행위</li>
                      <li>서비스 제공자나 제3자의 지적재산권을 침해하는 행위</li>
                      <li>음란물이나 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위</li>
                    </ul>
                    <p>2. 이용자는 본인의 의료 문서만을 업로드해야 하며, 타인의 의료정보를 무단으로 업로드해서는 안 됩니다.</p>
                    <p>3. 만 14세 미만의 이용자는 법정대리인(부모 등)의 동의 없이 서비스를 이용할 수 없습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제6조 (개인정보 보호)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 서비스 제공자는 이용자가 업로드한 의료 문서 및 개인정보를 안전하게 보호하기 위해 기술적, 관리적 보호조치를 취합니다.</p>
                    <p>2. 업로드된 의료 문서는 해석 완료 후 24시간 이내에 자동으로 삭제되며, 별도로 저장되지 않습니다. 이는 기술적으로 검증 가능한 형태로 구현됩니다.</p>
                    <p>3. 서비스 로그 및 백업 데이터는 최대 3개월간 보관되며, 이후 자동 삭제됩니다. 모든 민감 정보는 암호화하여 저장됩니다.</p>
                    <p>4. 개인정보의 처리에 관한 상세한 내용은 개인정보처리방침에서 정합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제7조 (의료 정보의 한계)</h2>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ 중요 안내</h3>
                    <p>1. 본 서비스를 통해 제공되는 AI 해석 결과는 교육 및 정보 제공 목적의 참고용이며, 의학적 진단이나 치료를 대체할 수 없습니다.</p>
                    <p>2. 이용자는 정확한 진단 및 치료를 위해 반드시 의료진과 상담해야 합니다.</p>
                    <p>3. 응급상황이나 심각한 건강 문제가 있는 경우, 즉시 의료기관을 방문하거나 응급실에 문의하시기 바랍니다.</p>
                    <p>4. 본 서비스는 식품의약품안전처(MFDS) 인증 의료기기가 아니며, 진단 또는 치료 목적으로 사용될 수 없습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제8조 (서비스 이용료)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 현재 본 서비스는 무료로 제공됩니다.</p>
                    <p>2. 향후 유료 서비스가 도입될 경우, 최소 30일 전에 공지하고 이용자의 명시적 동의를 받습니다.</p>
                    <p>3. 정기결제 서비스의 경우, 결제금액 인상 시 최소 30일 전에 이용자에게 알리고 명시적 동의를 받습니다. 동의하지 않을 경우 기존 금액으로 서비스가 유지되거나 해지될 수 있습니다.</p>
                    <p>4. 무료 서비스에서 유료 서비스로 전환되는 경우에도 최소 30일 전에 공지하고 이용자의 명시적 동의를 받습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제9조 (지식재산권)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 서비스 제공자가 제공하는 서비스, AI 모델, 소프트웨어 코드, 디자인 등에 대한 저작권 및 기타 지식재산권은 서비스 제공자에게 귀속됩니다.</p>
                    <p>2. 이용자가 서비스에 업로드한 의료 문서에 대한 저작권은 이용자에게 있으며, 이용자는 서비스 제공자에게 해당 문서를 서비스 제공 목적으로만 사용할 수 있는 제한적 라이선스를 부여합니다.</p>
                    <p>3. 이용자가 작성한 후기, 피드백 등의 콘텐츠는 서비스 개선 및 홍보 목적으로 활용될 수 있으며, 이 경우 개인 식별 정보는 제거됩니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제10조 (책임의 제한)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 서비스 제공자는 천재지변, 전쟁, 기타 불가항력적 사유로 인한 서비스 제공 중단에 대해 책임을 지지 않습니다.</p>
                    <p>2. 서비스 제공자는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.</p>
                    <p>3. 서비스 제공자의 고의 또는 중대한 과실이 없는 경우, 서비스와 관련하여 이용자에게 발생한 손해에 대한 배상 책임은 최근 3개월간 이용자가 서비스 제공자에게 지불한 이용료 총액을 초과하지 않습니다.</p>
                    <p>4. 무료 서비스의 경우, 서비스 제공자는 관련 법령에서 규정하는 최소한의 책임만을 부담합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제11조 (미성년자 보호)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 만 14세 미만 아동의 서비스 이용은 원칙적으로 금지됩니다.</p>
                    <p>2. 만 14세 이상 19세 미만의 미성년자가 서비스를 이용하는 경우, 법정대리인의 동의가 필요할 수 있습니다.</p>
                    <p>3. 서비스 제공자는 청소년 보호를 위해 유해 정보로부터 청소년을 보호하기 위한 조치를 취합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제12조 (분쟁해결)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 서비스 이용과 관련하여 발생한 분쟁에 대해 서비스 제공자와 이용자는 성실히 협의하여 해결하도록 노력합니다.</p>
                    <p>2. 협의로 해결되지 않는 분쟁에 대해서는 콘텐츠분쟁조정위원회, 한국소비자원 소비자분쟁조정위원회 등을 통해 조정을 신청할 수 있습니다.</p>
                    <p>3. 본 약관에 관한 준거법은 대한민국 법률을 적용합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제13조 (고객지원)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 서비스 이용 관련 문의, 불만 처리 등을 위한 고객지원 연락처는 다음과 같습니다:</p>
                    <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                      <li>이메일: xornjs1988@gmail.com</li>
                    </ul>
                    <p>2. 서비스 제공자는 이용자의 문의나 불만 사항에 대해 신속하게 답변하고 처리하기 위해 노력합니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">제14조 (기타)</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>1. 본 약관에서 정하지 아니한 사항과 본 약관의 해석에 관하여는 관련 법령 또는 상관례에 따릅니다.</p>
                    <p>2. 본 약관의 일부가 무효 또는 집행불가능하다고 판단되는 경우에도 나머지 조항들은 계속 유효합니다.</p>
                  </div>
                </section>

                <section className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">부칙</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>1. 본 약관은 2025년 6월 6일부터 시행됩니다.</p>
                    <p>2. 본 약관은 필요에 따라 개정될 수 있으며, 개정된 약관은 서비스 내 공지를 통해 알려드립니다.</p>
                  </div>
                </section>

                <section className="mt-8 pt-4 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">약관 개정 이력</h2>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <p>· 제정: 2025년 6월 6일</p>
                  </div>
                </section>

                <section className="mt-8 pt-4 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">사업자 정보</h2>
                  <div className="space-y-2 text-gray-700 text-sm">
                    <p>· 서비스 제공자: 정민균 (개인)</p>
                    <p>· 이메일: xornjs1988@gmail.com</p>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
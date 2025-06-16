"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Stethoscope, 
  ArrowLeft,
  Shield,
  Lock
} from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
              <Shield className="w-12 h-12 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">개인정보처리방침</h1>
            <p className="text-lg text-gray-600">
              MediCare AI의 개인정보 처리방침입니다.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              시행일: 2025년 6월 6일
            </p>
          </div>

          {/* Privacy Content */}
          <Card className="shadow-sm">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. 개인정보 처리방침의 의의</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    MediCare AI(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. 개인정보의 처리목적</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                    
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900 mb-2">가. 서비스 제공</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>회원 가입 및 관리</li>
                        <li>AI 의료 문서 해석 서비스 제공</li>
                        <li>해석 결과에 대한 정보 제공 및 상담</li>
                        <li>서비스 품질 개선 및 맞춤형 서비스 제공</li>
                        <li>고객지원 및 문의사항 처리</li>
                      </ul>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 mt-4">나. 서비스 개선</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>서비스 이용 통계 분석</li>
                        <li>서비스 품질 향상</li>
                        <li>신규 서비스 개발</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. 개인정보의 처리 및 보유기간</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                    
                    <p>② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
                    
                    <div className="ml-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">가. 회원 정보</h3>
                        <p>• 보유기간: 회원 탈퇴 시까지</p>
                        <p>• 관련 법령: 통신비밀보호법</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">나. 의료 문서 및 해석 기록</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
                          <p>• 업로드된 의료 문서는 해석 목적으로만 임시 처리되며, 해석 완료 후 즉시 완전 삭제됩니다. </p>
                          <p> 해석 결과와 상담 기록은 서비스 제공 및 안전 관리 목적으로 <strong>최대 3일간</strong> 안전하게 보관된 뒤 자동 삭제됩니다.</p>
                          <p className="mt-2 text-sm text-yellow-800">※ 본 서비스는 교육 및 정보 제공 목적이며, 의료 진단을 대체하지 않습니다.</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">다. 서비스 이용 기록</h3>
                        <p>• 보유기간: 3개월</p>
                        <p>• 관련 법령: 통신비밀보호법</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. 처리하는 개인정보의 항목</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
                    
                    <div className="ml-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">가. 필수항목</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>이메일 주소</li>
                          <li>이름</li>
                          <li>프로필 사진 (Google 계정 연동 시)</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">나. 자동 수집 정보</h3>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>IP 주소</li>
                          <li>쿠키</li>
                          <li>서비스 이용 기록</li>
                          <li>접속 로그</li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="mt-4">② 민감정보 처리</p>
                    <p className="ml-4">회사는 개인정보보호법 제23조에 따른 민감정보(의료정보 등)를 별도로 저장하지 않습니다. 업로드된 의료 문서는 해석 목적으로만 임시 처리되며, 해석 완료 즉시 완전 삭제됩니다.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2 ml-4">
                      <p className="text-sm text-blue-800">
                        <strong>중요:</strong> 본 서비스의 모든 해석 결과는 교육 및 정보 제공 목적이며, 의학적 진단이나 치료를 대체할 수 없습니다.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. 개인정보의 제3자 제공</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
                    <p>② 현재 회사는 개인정보를 제3자에게 제공하지 않습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. 개인정보처리의 위탁</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                    
                    <div className="ml-4">
                      <table className="w-full border-collapse border border-gray-300 mt-3">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 px-4 py-2 text-left">위탁받는 자</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">위탁업무</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">Google LLC</td>
                            <td className="border border-gray-300 px-4 py-2">OAuth 인증 서비스</td>
                          </tr>
                          <tr>
                            <td className="border border-gray-300 px-4 py-2">클라우드 서비스 제공업체</td>
                            <td className="border border-gray-300 px-4 py-2">서버 호스팅 및 데이터 저장</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <p>② 회사는 위탁계약 체결시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. 정보주체의 권리·의무 및 행사방법</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
                    
                    <ul className="list-disc pl-6 space-y-1 ml-4">
                      <li>개인정보 처리현황 통지요구</li>
                      <li>개인정보 열람요구</li>
                      <li>개인정보 정정·삭제요구</li>
                      <li>개인정보 처리정지요구</li>
                    </ul>
                    
                    <p>② 위의 권리 행사는 회사에 대해 개인정보 보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.</p>
                    
                    <p>③ 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">8. 개인정보의 안전성 확보조치</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:</p>
                    
                    <div className="ml-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">1. 개인정보 암호화</h3>
                        <p>개인정보는 암호화 등을 통해 안전하게 저장 및 관리되고 있습니다. 또한 중요한 데이터는 저장 및 전송 시 암호화하여 사용하고 있습니다.</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">2. 해킹 등에 대비한 기술적 대책</h3>
                        <p>회사는 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">3. 개인정보에 대한 접근 제한</h3>
                        <p>개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여,변경,말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">4. 개인정보 취급 직원의 최소화 및 교육</h3>
                        <p>개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화 하여 개인정보를 관리하는 대책을 시행하고 있습니다.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">9. 개인정보 보호책임자</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:</p>
                    
                    <div className="ml-4 bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">개인정보 보호책임자</h3>
                      <p>• 성명: 정민균</p>
                      <p>• 직책: 대표</p>
                      <p>• 연락처: xornjs1988@gamil.com</p>
                    </div>
                    
                    <p>② 정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자 및 담당부서로 문의하실 수 있습니다. 회사는 정보주체의 문의에 대해 지체없이 답변 및 처리해드릴 것입니다.</p>
                  </div>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">10. 개인정보 처리방침 변경</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>① 이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
                    <p>② 본 방침은 2025년 6월 6일부터 시행됩니다.</p>
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
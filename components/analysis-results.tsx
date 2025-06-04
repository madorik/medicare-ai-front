"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, AlertCircle, CheckCircle, ExternalLink, Brain } from "lucide-react"

export default function AnalysisResults() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 분석 개요 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              <CardTitle>AI 분석 결과</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800">분석 완료</Badge>
          </div>
          <CardDescription>업로드된 진료 기록을 분석한 결과입니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">검출된 의학 용어</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">2</div>
              <div className="text-sm text-gray-600">처방 약물</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-gray-600">주의사항</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 상세 분석 결과 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 진단 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>진단 정보</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium">고혈압 (Essential Hypertension)</div>
                  <div className="text-sm text-gray-600">혈압: 140/90 mmHg</div>
                  <div className="text-xs text-gray-500 mt-1">정상 범위를 초과하는 혈압 수치가 확인되었습니다.</div>
                </div>
              </div>
              <Separator />
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-medium">콜레스테롤 수치 주의</div>
                  <div className="text-sm text-gray-600">총 콜레스테롤: 220 mg/dL</div>
                  <div className="text-xs text-gray-500 mt-1">권장 수치(200 mg/dL)보다 높습니다.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 처방 약물 */}
        <Card>
          <CardHeader>
            <CardTitle>처방 약물</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <div className="font-medium">아모디핀 (Amlodipine) 5mg</div>
                <div className="text-sm text-gray-600 mt-1">칼슘채널차단제 - 혈압 강하제</div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>복용법:</strong> 1일 1회, 식후 복용
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-emerald-600">
                  상세 정보 보기 <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
              <div className="border rounded-lg p-3">
                <div className="font-medium">아토르바스타틴 (Atorvastatin) 20mg</div>
                <div className="text-sm text-gray-600 mt-1">스타틴계 - 콜레스테롤 강하제</div>
                <div className="text-xs text-gray-500 mt-2">
                  <strong>복용법:</strong> 1일 1회, 저녁 식후 복용
                </div>
                <Button variant="link" size="sm" className="p-0 h-auto text-emerald-600">
                  상세 정보 보기 <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI 권장사항 */}
      <Card>
        <CardHeader>
          <CardTitle>AI 권장사항</CardTitle>
          <CardDescription>분석 결과를 바탕으로 한 개인 맞춤형 건강 관리 조언</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-medium text-emerald-800 mb-2">생활습관 개선</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• 주 3-4회, 30분 이상의 유산소 운동 권장</li>
              <li>• 나트륨 섭취량을 하루 2,300mg 이하로 제한</li>
              <li>• 금연 및 금주 권장</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">정기 검진</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 3개월 후 혈압 재측정 권장</li>
              <li>• 6개월 후 콜레스테롤 수치 재검사</li>
              <li>• 연 1회 종합건강검진 권장</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button className="bg-emerald-600 hover:bg-emerald-700">전문가 상담 예약하기</Button>
        <Button variant="outline">상세 리포트 다운로드</Button>
      </div>
    </div>
  )
}

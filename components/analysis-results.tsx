"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, AlertCircle, CheckCircle, ExternalLink, Brain, Clock, Loader2, Activity, Download, Share, Calendar, Shield } from "lucide-react"
import { useEffect, useRef } from "react"

interface AnalysisResultsProps {
  isAnalyzing: boolean
  analysisData: string
  hasError: boolean
  errorMessage?: string
  progress?: number
}

export default function AnalysisResults({ 
  isAnalyzing, 
  analysisData, 
  hasError, 
  errorMessage,
  progress = 0
}: AnalysisResultsProps) {
  const streamingRef = useRef<HTMLDivElement>(null)

  // 자동 스크롤 처리
  useEffect(() => {
    if (streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [analysisData])

  // 분석 데이터를 라인별로 분리하여 실시간 스트리밍 효과 구현
  const formatAnalysisData = (data: string) => {
    if (!data) return []
    
    // 각 라인을 배열로 분리하고 빈 라인 제거
    return data.split('\n').filter(line => line.trim().length > 0)
  }

  const analysisLines = formatAnalysisData(analysisData)

  if (hasError) {
    return (
      <div className="space-y-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-800">분석 오류</CardTitle>
                <CardDescription className="text-red-600">
                  {errorMessage || '알 수 없는 오류가 발생했습니다.'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isAnalyzing && !analysisData) {
    return (
      <div className="space-y-4">
        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
          <CardHeader className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-gray-600 text-lg">AI 분석 대기 중</CardTitle>
            <CardDescription className="text-gray-500 mt-2">
              파일을 업로드하면 AI 분석이 시작됩니다
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 분석 상태 헤더 */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-gray-800">AI 분석 결과</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {isAnalyzing 
                    ? "실시간으로 분석 결과가 업데이트됩니다"
                    : "업로드된 진료 기록을 분석한 결과입니다"
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAnalyzing ? (
                <Badge className="bg-blue-500 text-white border-0 shadow-sm">
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  분석 중
                </Badge>
              ) : (
                <Badge className="bg-emerald-500 text-white border-0 shadow-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  분석 완료
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 진행률 */}
      {isAnalyzing && (
        <Card className="border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-2 text-gray-700 font-medium">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>분석 진행률</span>
                </span>
                <span className="text-blue-600 font-semibold">{progress}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-3 bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span className="animate-pulse flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="ml-2">AI가 열심히 분석하고 있습니다</span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 실시간 스트리밍 결과 */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-700" />
            <CardTitle className="text-gray-800">분석 내용</CardTitle>
            {isAnalyzing && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-600 font-medium">실시간</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {analysisData ? (
            <div 
              ref={streamingRef}
              className="bg-white rounded-b-lg p-6 max-h-96 overflow-y-auto"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-800 leading-relaxed text-sm">
                  {analysisData}
                </div>
                
                {isAnalyzing && (
                  <div className="flex items-center space-x-2 text-emerald-600 mt-6 pt-4 border-t border-gray-100">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">분석이 계속 진행 중입니다...</span>
                  </div>
                )}
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
              </div>
              <p className="text-gray-600">분석을 시작하고 있습니다...</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* 분석 완료 시에만 표시되는 추가 정보 */}
      {!isAnalyzing && analysisData && (
        <>
          {/* 액션 버튼 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg h-12">
              <Calendar className="w-4 h-4 mr-2" />
              전문가 상담 예약
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 hover:border-gray-400 h-12">
              <Download className="w-4 h-4 mr-2" />
              리포트 다운로드
            </Button>
            <Button variant="outline" className="border-2 border-gray-300 hover:border-gray-400 h-12">
              <Share className="w-4 h-4 mr-2" />
              결과 공유하기
            </Button>
          </div>

          {/* 개인정보 보호 안내 */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-emerald-800 mb-1">
                  데이터 보안 안내
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  분석된 진료 기록은 <strong>서버에 영구 저장되지 않습니다</strong>. 
                  분석 완료와 함께 모든 개인정보가 안전하게 삭제되어 개인정보 보호가 보장됩니다.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

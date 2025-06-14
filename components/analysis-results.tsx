"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, AlertCircle, CheckCircle, ExternalLink, Brain, Clock, Loader2, Activity, Download, Share, Calendar, Shield, MessageSquare, Stethoscope, ClipboardList, AlertTriangle, Target, TrendingUp } from "lucide-react"
import { useEffect, useRef } from "react"
import { useTextDrag } from "@/hooks/use-text-drag"

// 새로운 JSON 스키마 타입 정의
interface AnalysisResult {
  patient_info: {
    name: string
    age: number
  }
  diagnosis: string
  main_symptoms: string
  prescribed_drugs: Array<{
    name: string
    dosage: string
    purpose: string
  }>
  detailed_analysis: string
  treatment_plan: string
  helpful_foods: string[]
  source: string
}

interface AnalysisResultsProps {
  isAnalyzing: boolean
  analysisData: string
  hasError: boolean
  errorMessage?: string
  progress?: number
  onTextDragToChat?: (text: string) => void
}

export default function AnalysisResults({ 
  isAnalyzing, 
  analysisData, 
  hasError, 
  errorMessage,
  progress = 0,
  onTextDragToChat
}: AnalysisResultsProps) {
  const streamingRef = useRef<HTMLDivElement>(null)

  // 텍스트 드래그 훅 사용
  const { 
    isDragging, 
    selectedText, 
    labelPosition, 
    showLabel, 
    textDragHandlers, 
    onLabelClick, 
    clearSelection 
  } = useTextDrag({})

  // 자동 스크롤 처리
  useEffect(() => {
    if (streamingRef.current) {
      streamingRef.current.scrollTop = streamingRef.current.scrollHeight
    }
  }, [analysisData])

  // JSON 데이터 파싱 함수
  const parseAnalysisData = (data: string): AnalysisResult | null => {
    if (!data) return null
    
    try {
      // JSON 형태인지 확인하고 파싱
      const trimmedData = data.trim()
      if (trimmedData.startsWith('{') && trimmedData.endsWith('}')) {
        return JSON.parse(trimmedData) as AnalysisResult
      }
    } catch (error) {
      console.log('JSON 파싱 실패, 일반 텍스트로 처리:', error)
    }
    
    return null
  }

  const parsedData = parseAnalysisData(analysisData)

  // **텍스트** 형태를 굵은 텍스트로 변환하는 함수
  const formatBoldText = (text: string | number | null | undefined) => {
    // 타입 체크 및 문자열 변환
    if (text === null || text === undefined) return ''
    const textStr = String(text)
    
    const parts = textStr.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2)
        return <strong key={index} className="font-semibold">{boldText}</strong>
      }
      return part
    })
  }

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

  // 구조화된 JSON 데이터 렌더링
  const renderStructuredData = (data: AnalysisResult) => (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* 환자 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">환자 정보</h2>
        </div>
        <div className="p-4" {...textDragHandlers}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">환자명</div>
              <div className="text-gray-900 text-sm font-medium">{data.patient_info.name}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">나이</div>
              <div className="text-gray-900 text-sm font-medium">{data.patient_info.age}세</div>
            </div>
          </div>
        </div>
      </div>

      {/* 진단명 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">진단명</h2>
        </div>
        <div className="p-4" {...textDragHandlers}>
          <div className="text-gray-900 text-sm leading-relaxed p-3 bg-blue-50/50 rounded border-l-4 border-blue-400">
            {formatBoldText(data.diagnosis)}
          </div>
        </div>
      </div>

      {/* 주요 증상 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">주요 증상</h2>
        </div>
        <div className="p-4" {...textDragHandlers}>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {formatBoldText(data.main_symptoms)}
          </div>
        </div>
      </div>

      {/* 처방 약물 */}
      {data.prescribed_drugs && data.prescribed_drugs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">처방 약물</h2>
          </div>
          <div className="p-4" {...textDragHandlers}>
            <div className="grid gap-3">
              {data.prescribed_drugs.map((drug, index) => (
                <div key={index} className="bg-green-50/50 rounded p-3 border border-green-100 hover:shadow-sm hover:border-green-200 transition-all duration-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">{formatBoldText(drug.name)}</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                      처방약
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">용량·용법</div>
                      <div className="text-sm font-medium text-gray-700">{formatBoldText(drug.dosage)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">주요 효능</div>
                      <div className="text-sm text-gray-600">{formatBoldText(drug.purpose)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 상세 분석 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-indigo-100/50">
          <h2 className="font-semibold text-indigo-900">상세 분석</h2>
        </div>
        <div className="p-4" {...textDragHandlers}>
          <div className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap">
            {formatBoldText(data.detailed_analysis)}
          </div>
        </div>
      </div>

      {/* 치료 계획 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">치료 계획</h2>
        </div>
        <div className="p-4" {...textDragHandlers}>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {formatBoldText(data.treatment_plan)}
          </div>
        </div>
      </div>

      {/* 도움이 되는 음식 */}
      {data.helpful_foods && data.helpful_foods.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg shadow-sm border border-emerald-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-emerald-100/50">
            <h2 className="font-semibold text-emerald-900">도움이 되는 음식</h2>
          </div>
          <div className="p-4" {...textDragHandlers}>
            <div className="flex flex-wrap gap-2">
              {data.helpful_foods.map((food, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  {formatBoldText(food)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
     
    </div>
  )

  // 일반 텍스트 렌더링 (기존 방식)
  const renderPlainText = (data: string) => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
        <div className="flex items-center justify-between">
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
          <div className="flex items-center space-x-2">
            {isAnalyzing ? (
              <Badge className="bg-blue-500 text-white border-0 shadow-sm">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                분석 진행중
              </Badge>
            ) : data ? (
              <Badge className="bg-emerald-500 text-white border-0 shadow-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                분석 완료
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* 드래그 안내 문구 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-700">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">
                텍스트를 드래그하거나 더블클릭한 후 "Add to Chat" 라벨을 클릭하여 채팅창에 입력하세요
              </span>
            </div>
          </div>
        </div>
        
        <div 
          ref={streamingRef}
          className={`bg-white rounded-b-lg p-6 max-h-96 overflow-y-auto transition-all duration-200 relative ${
            isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
          } ${selectedText ? 'bg-emerald-50 border border-emerald-200' : ''}`}
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'text'
          }}
          {...textDragHandlers}
        >
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed text-sm select-text">
              {data}
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-emerald-600 mt-6 pt-4 border-t border-gray-100">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">분석이 계속 진행 중입니다...</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* 드래그 안내 문구 (구조화된 데이터일 때만) */}
      {parsedData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-700">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">
              텍스트를 드래그하거나 더블클릭한 후 "Add to Chat" 라벨을 클릭하여 채팅창에 입력하세요
            </span>
          </div>
        </div>
      )}

      {/* 분석 상태 표시 */}
      {isAnalyzing && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
            </div>
            <p className="text-gray-600">분석을 진행하고 있습니다...</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 렌더링 */}
      {analysisData && !isAnalyzing && (
        parsedData ? renderStructuredData(parsedData) : renderPlainText(analysisData)
      )}

      {/* To Chat 라벨 */}
      {showLabel && selectedText && labelPosition && (
        <div 
          className="fixed z-50 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-emerald-700 transition-all duration-200 transform scale-95 hover:scale-100"
          style={{
            left: labelPosition.x - 50,
            top: labelPosition.y - 60,
          }}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (selectedText && onTextDragToChat) {
              onTextDragToChat(selectedText.trim())
              clearSelection()
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Add to Chat</span>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45"></div>
        </div>
      )}
    </div>
  )
}

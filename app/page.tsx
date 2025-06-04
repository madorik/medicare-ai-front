"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ImageUploadSection from "@/components/image-upload-section"
import AnalysisResults from "@/components/analysis-results"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import {
  Stethoscope,
  Camera,
  Loader2,
  FileText,
  Brain,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Plus,
  Mic,
  ChevronRight,
  ChevronLeft,
  Send,
  User,
  Bot,
  LogOut,
  Settings,
} from "lucide-react"
import type React from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function HomePage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  
  // 파일 업로드 및 분석 관련 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  
  // 기존 상태들
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isResultPanelCollapsed, setIsResultPanelCollapsed] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [resultPanelWidth, setResultPanelWidth] = useState(600)
  const [isResizingResult, setIsResizingResult] = useState(false)

  // 분석 시작 핸들러
  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisData("")
    setAnalysisError(null)
    setAnalysisProgress(0)
    setStatusMessage("분석을 시작합니다...")
    setShowAnalysis(true)
  }

  // 실시간 분석 결과 핸들러
  const handleAnalysisResult = (data: string, tokenCount?: number, progress?: number) => {
    console.log('분석 결과 업데이트:', {
      textLength: data.length,
      progress: progress,
      preview: data.substring(0, 50) + (data.length > 50 ? '...' : '')
    })
    
    setAnalysisData(data)
    if (progress !== undefined) setAnalysisProgress(progress)
  }

  // 분석 완료 핸들러
  const handleAnalysisComplete = () => {
    setIsAnalyzing(false)
    setAnalysisProgress(100)
    setStatusMessage("분석이 완료되었습니다.")
    // 초기 AI 메시지 추가
    addMessage(
      "assistant",
      "안녕하세요! 진료 기록 분석이 완료되었습니다. 분석 결과에 대해 궁금한 점이 있으시면 질문해주세요."
    )
  }

  // 분석 오류 핸들러
  const handleAnalysisError = (error: string) => {
    setAnalysisError(error)
    setIsAnalyzing(false)
    setStatusMessage(`오류: ${error}`)
  }

  // 상태 업데이트 핸들러
  const handleStatusUpdate = (status: string, type?: 'info' | 'warning' | 'error' | 'success') => {
    setStatusMessage(status)
    console.log(`[${type?.toUpperCase() || 'INFO'}] ${status}`)
  }

  // 새 분석 시작
  const resetAnalysis = () => {
    setIsAnalyzing(false)
    setAnalysisData("")
    setAnalysisError(null)
    setAnalysisProgress(0)
    setStatusMessage("")
    setShowAnalysis(false)
    setMessages([])
  }

  // 메시지 추가
  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  // 메시지 전송
  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return

    // 사용자 메시지 추가
    addMessage("user", inputMessage)
    setInputMessage("")

    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      let response = ""

      if (inputMessage.includes("고혈압")) {
        response =
          "고혈압은 혈압이 정상 범위보다 높은 상태를 의미합니다. 분석 결과 혈압이 140/90 mmHg로 측정되어 고혈압으로 진단되었습니다. 일반적으로 정상 혈압은 120/80 mmHg 이하입니다. 규칙적인 운동, 저염식 식단, 처방된 약물 복용이 중요합니다."
      } else if (inputMessage.includes("콜레스테롤")) {
        response =
          "콜레스테롤 수치가 220 mg/dL로 측정되어 정상 범위(200 mg/dL 이하)보다 약간 높습니다. 포화지방과 트랜스지방 섭취를 줄이고, 오메가-3 지방산이 풍부한 식품을 섭취하는 것이 좋습니다. 처방된 아토르바스타틴은 콜레스테롤 수치를 낮추는데 도움이 됩니다."
      } else if (inputMessage.includes("약") || inputMessage.includes("약물") || inputMessage.includes("처방")) {
        response =
          "현재 처방된 약물은 아모디핀(Amlodipine) 5mg과 아토르바스타틴(Atorvastatin) 20mg입니다. 아모디핀은 혈압을 낮추는 약물로 1일 1회 식후 복용하고, 아토르바스타틴은 콜레스테롤 수치를 낮추는 약물로 1일 1회 저녁 식후 복용하는 것이 권장됩니다."
      } else if (inputMessage.includes("운동") || inputMessage.includes("식이") || inputMessage.includes("생활")) {
        response =
          "생활습관 개선을 위해 주 3-4회, 30분 이상의 유산소 운동을 권장합니다. 나트륨 섭취량을 하루 2,300mg 이하로 제한하고, 과일, 채소, 통곡물, 저지방 단백질 위주의 식단을 유지하세요. 금연과 금주도 혈압 관리에 도움이 됩니다."
      } else {
        response =
          "분석 결과에 따르면 고혈압과 콜레스테롤 수치 상승이 확인되었습니다. 처방된 약물을 꾸준히 복용하고, 3개월 후 혈압 재측정과 6개월 후 콜레스테롤 수치 재검사를 권장합니다. 더 구체적인 질문이 있으시면 말씀해주세요."
      }

      addMessage("assistant", response)
    }, 1000)
  }

  // 리사이징 이벤트 핸들러
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  const startResizingResult = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizingResult(true)
  }

  // 마우스 이동 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = e.clientX
        if (newWidth > 180 && newWidth < 500) {
          setSidebarWidth(newWidth)
        }
      }
      if (isResizingResult) {
        const containerWidth = window.innerWidth
        const newWidth = containerWidth - e.clientX
        if (newWidth > 300 && newWidth < 800) {
          setResultPanelWidth(newWidth)
        }
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsResizingResult(false)
    }

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    if (isResizingResult) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, isResizingResult])

  // 채팅이 추가될 때마다 스크롤 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // 엔터 키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar - 분석 결과가 있을 때만 표시 */}
      {showAnalysis && (
        <div
          className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? "w-16" : ""
          }`}
          style={{ width: isSidebarCollapsed ? "64px" : `${sidebarWidth}px` }}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              {!isSidebarCollapsed && (
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-6 h-6 text-emerald-400" />
                  <span className="font-semibold">MediCare AI</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="text-gray-400 hover:text-white p-1"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4">
            {!isSidebarCollapsed && (
              <div className="space-y-4">
                <Button
                  onClick={resetAnalysis}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>새로운 분석</span>
                </Button>
                <div className="text-sm text-gray-400">
                  <p>파일 분석이 완료되었습니다. 분석 결과에 대해 AI와 대화해보세요.</p>
                </div>
              </div>
            )}
          </div>

          {/* Resize Handle */}
          <div
            className="w-1 bg-gray-600 hover:bg-gray-500 cursor-col-resize absolute top-0 right-0 h-full"
            onMouseDown={startResizing}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-8 h-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">MediCare AI</span>
              </div>
              {showAnalysis && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  분석 완료
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  서비스
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  요금제
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  소개
                </a>
                
                {/* 로그인 상태에 따른 UI 분기 */}
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    {/* 사용자 프로필 */}
                    <div className="flex items-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="프로필"
                          className="w-8 h-8 rounded-full border border-gray-300"
                          onError={(e) => {
                            // 이미지 로드 실패 시 기본 아바타로 교체
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : null}
                      {!user.profileImage && (
                        <div className="w-8 h-8 rounded-full border border-gray-300 bg-emerald-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* 설정 버튼 */}
                    <Button variant="ghost" size="sm" className="p-2">
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    {/* 로그아웃 버튼 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-1" />
                      로그아웃
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/login')}
                    >
                      로그인
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => router.push('/login')}
                    >
                      시작하기
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Upload or Chat Area */}
          {!showAnalysis ? (
            <div className="w-full p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                {/* Description */}
                <p className="text-gray-600 text-lg mb-12 text-center">
                  처방전, 검사 결과지, 진단서 등의 이미지를 업로드해주세요
                </p>

                {/* Upload Component */}
                <ImageUploadSection
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisResult={handleAnalysisResult}
                  onAnalysisComplete={handleAnalysisComplete}
                  onError={handleAnalysisError}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4" ref={chatContainerRef}>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-3xl ${
                          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user" ? "bg-emerald-100" : "bg-blue-100"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Bot className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === "user" ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="text-xs mt-1 text-gray-500">
                            {new Intl.DateTimeFormat("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }).format(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t p-4 bg-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="진료 결과에 대해 질문해보세요..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-12 max-h-32"
                      rows={1}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => {}}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  <div className="space-y-1">
                    <p>
                      <strong>개인정보 보호:</strong> 업로드된 진료 기록은 서버에 저장되지 않으며, 분석 완료 후 즉시 삭제됩니다.
                    </p>
                    <p>
                      MediCare AI는 의료 전문가의 진단을 대체할 수 없습니다. 정확한 진단을 위해서는 의료진과 상담하세요.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results Panel */}
          {showAnalysis && (
            <>
              {/* Resize Handle for Results Panel */}
              <div
                className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize"
                onMouseDown={startResizingResult}
              />

              {/* Analysis Results Panel */}
              <div
                className={`bg-gray-50 border-l border-gray-200 overflow-y-auto transition-all duration-300 ${
                  isResultPanelCollapsed ? "w-16" : ""
                }`}
                style={{ width: isResultPanelCollapsed ? "64px" : `${resultPanelWidth}px` }}
              >
                <div className="h-full flex flex-col">
                  {/* Results Panel Header */}
                  <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      {!isResultPanelCollapsed && (
                        <h2 className="text-lg font-semibold text-gray-900">분석 결과</h2>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsResultPanelCollapsed(!isResultPanelCollapsed)}
                        className="text-gray-500 hover:text-gray-700 p-1"
                      >
                        {isResultPanelCollapsed ? (
                          <ChevronLeft className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Results Content */}
                  {!isResultPanelCollapsed && (
                    <div className="flex-1 p-4 overflow-y-auto">
                      <AnalysisResults
                        isAnalyzing={isAnalyzing}
                        analysisData={analysisData}
                        hasError={!!analysisError}
                        errorMessage={analysisError || undefined}
                        progress={analysisProgress}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import type React from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isResultPanelCollapsed, setIsResultPanelCollapsed] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [resultPanelWidth, setResultPanelWidth] = useState(400)
  const [isResizingResult, setIsResizingResult] = useState(false)

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // 파일 업로드 시뮬레이션
      setTimeout(() => {
        setUploadedFile(file.name)
        setIsUploading(false)
        setIsAnalyzing(true)
        // 분석 시뮬레이션
        setTimeout(() => {
          setIsAnalyzing(false)
          setShowAnalysis(true)
          // 초기 AI 메시지 추가
          addMessage(
            "assistant",
            "안녕하세요! 진료 기록 분석이 완료되었습니다. 분석 결과에 대해 궁금한 점이 있으시면 질문해주세요.",
          )
        }, 3000)
      }, 1500)
    }
  }

  // 새 분석 시작
  const resetUpload = () => {
    setUploadedFile(null)
    setShowAnalysis(false)
    setIsAnalyzing(false)
    setMessages([])
    const input = document.getElementById("file-upload") as HTMLInputElement
    if (input) input.value = ""
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
          <div className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
            {!isSidebarCollapsed && (
              <Button
                variant="outline"
                className="flex-1 justify-start bg-transparent border-gray-600 text-white hover:bg-gray-800"
                onClick={resetUpload}
              >
                <Plus className="w-4 h-4 mr-2" />새 분석 시작
              </Button>
            )}
            {isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="mx-auto text-gray-400 hover:text-white"
                onClick={resetUpload}
              >
                <Plus className="w-5 h-5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white ml-1"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </Button>
          </div>

          {/* Analysis History */}
          {!isSidebarCollapsed && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="text-sm text-gray-400 mb-3">최근 분석</div>
                <div className="space-y-2">
                  <div className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium truncate">{uploadedFile}</div>
                    <div className="text-xs text-gray-400 mt-1">방금 전</div>
                  </div>
                  {/* 예시 항목들 */}
                  <div className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium truncate">건강검진결과.pdf</div>
                    <div className="text-xs text-gray-400 mt-1">2일 전</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium truncate">혈액검사결과.jpg</div>
                    <div className="text-xs text-gray-400 mt-1">1주일 전</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium truncate">처방전_2024_05_15.png</div>
                    <div className="text-xs text-gray-400 mt-1">2주일 전</div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors">
                    <div className="text-sm font-medium truncate">MRI_결과.pdf</div>
                    <div className="text-xs text-gray-400 mt-1">1개월 전</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Footer */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gray-700 flex-shrink-0">
              <div className="text-xs text-gray-400">
                MediCare AI는 의료 전문가의 진단을 대체할 수 없습니다. 정확한 진단을 위해서는 의료진과 상담하세요.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resizer */}
      {showAnalysis && !isSidebarCollapsed && (
        <div
          className="w-1 bg-gray-300 hover:bg-emerald-500 cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={startResizing}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white z-50 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">MediCare AI</span>
              </div>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  기능
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  요금제
                </a>
                <a href="#" className="text-gray-600 hover:text-emerald-600 transition-colors">
                  소개
                </a>
                <Button variant="outline" size="sm">
                  로그인
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  시작하기
                </Button>
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
                {!isAnalyzing && (
                  <>
                    {/* Service Title */}
                    <div className="text-center mb-8">
                      <div className="inline-block">
                        <div className="bg-emerald-100 text-emerald-800 px-6 py-3 rounded-full text-lg font-medium">
                          AI 기반 의료 분석 서비스
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-12 text-center">
                      처방전, 검사 결과지, 진단서 등의 이미지를 업로드해주세요
                    </p>
                  </>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 bg-white">
                  {isUploading ? (
                    <div className="flex flex-col items-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                      <p className="text-gray-600 text-lg">파일을 업로드하고 있습니다...</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Brain className="w-8 h-8 text-emerald-600 animate-pulse" />
                      </div>
                      <div className="text-center">
                        <p className="text-emerald-600 font-medium text-lg mb-2">AI가 분석 중입니다</p>
                        <p className="text-gray-600">진료 기록을 분석하여 상세한 정보를 제공합니다...</p>
                      </div>
                    </div>
                  ) : uploadedFile ? (
                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-green-600 font-medium text-lg mb-2">업로드 완료</p>
                        <p className="text-gray-600">{uploadedFile}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={resetUpload}
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      >
                        다른 파일 업로드
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-xl font-medium text-gray-900">파일을 드래그하거나 클릭하여 업로드</p>
                        <p className="text-gray-500">JPG, PNG, PDF 파일 지원 (최대 10MB)</p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Button
                          onClick={() => document.getElementById("file-upload")?.click()}
                          className="bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-lg"
                        >
                          파일 선택하기
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Supported Document Types */}
                {!isAnalyzing && (
                  <div className="flex justify-center items-center space-x-8 mt-8">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>처방전</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>검사 결과지</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span>진단서</span>
                    </div>
                  </div>
                )}
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
                  MediCare AI는 의료 전문가의 진단을 대체할 수 없습니다. 정확한 진단을 위해서는 의료진과 상담하세요.
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results Panel */}
          {showAnalysis && (
            <>
              {/* Result Panel Resizer */}
              {showAnalysis && !isResultPanelCollapsed && (
                <div
                  className="w-1 bg-gray-300 hover:bg-emerald-500 cursor-col-resize transition-colors flex-shrink-0"
                  onMouseDown={startResizingResult}
                ></div>
              )}
              <div
                className={`border-l bg-white transition-all duration-300 flex flex-col ${
                  isResultPanelCollapsed ? "w-12" : ""
                }`}
                style={{ width: isResultPanelCollapsed ? "48px" : `${resultPanelWidth}px` }}
              >
                {/* Results Header */}
                <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                  {!isResultPanelCollapsed && (
                    <>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">진료 결과 분석</h2>
                        <p className="text-sm text-gray-600 mt-1">AI가 분석한 진료 기록 결과입니다</p>
                      </div>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-900 ml-auto"
                    onClick={() => setIsResultPanelCollapsed(!isResultPanelCollapsed)}
                  >
                    {isResultPanelCollapsed ? (
                      <ChevronLeft className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Results Content */}
                {!isResultPanelCollapsed && (
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-6">
                      {/* 분석 개요 */}
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-5 h-5 text-emerald-600" />
                              <CardTitle>분석 개요</CardTitle>
                            </div>
                            <Badge className="bg-green-100 text-green-800">분석 완료</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-blue-600">3</div>
                              <div className="text-sm text-gray-600">검출된 의학 용어</div>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">2</div>
                              <div className="text-sm text-gray-600">처방 약물</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-2xl font-bold text-orange-600">1</div>
                              <div className="text-sm text-gray-600">주의사항</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

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
                                <div className="text-xs text-gray-500 mt-1">
                                  정상 범위를 초과하는 혈압 수치가 확인되었습니다.
                                </div>
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

                      {/* AI 권장사항 */}
                      <Card>
                        <CardHeader>
                          <CardTitle>AI 권장사항</CardTitle>
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
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

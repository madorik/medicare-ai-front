"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  
  // API 서버 설정
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  // 파일 업로드 및 분석 관련 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  
  // GPT 모델 선택 상태
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  
  // 기존 상태들
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isResizing, setIsResizing] = useState(false)
  const [inputMessage, setInputMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [isResultPanelCollapsed, setIsResultPanelCollapsed] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [resultPanelWidth, setResultPanelWidth] = useState(600)
  const [isResizingResult, setIsResizingResult] = useState(false)

  // 채팅 관련 상태들
  const [isStreaming, setIsStreaming] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)

  // 모바일 사이드바 상태 추가
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // URL 파라미터 확인해서 채팅 모드 설정
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const chatParam = urlParams.get('chat')
    
    if (chatParam === 'true') {
      setIsChatMode(true)
      setShowAnalysis(true)
      setIsSidebarCollapsed(false)
      // 초기 AI 환영 메시지 추가
      if (messages.length === 0) {
        addMessage(
          "assistant",
          "안녕하세요! 의료 상담 AI입니다. 🩺\n\n건강과 관련된 궁금한 점이나 증상에 대해 문의해주세요. 정확한 의학 정보를 바탕으로 도움을 드리겠습니다.\n\n⚠️ 응급상황 시에는 즉시 119에 신고하거나 가까운 응급실을 방문하세요."
        )
      }
    }
  }, [])

  // 메인 페이지로 이동하는 함수
  const navigateToHome = () => {
    setIsChatMode(false)
    setShowAnalysis(false)
    setMessages([])
    setIsSidebarCollapsed(true)
    setIsMobileSidebarOpen(false)
    router.push('/')
  }

  // 분석 시작 핸들러
  const handleAnalysisStart = () => {
    setIsAnalyzing(true)
    setAnalysisData("")
    setAnalysisError(null)
    setAnalysisProgress(0)
    setStatusMessage("분석을 시작합니다...")
    setShowAnalysis(true)
    setIsSidebarCollapsed(false)
    setIsMobileSidebarOpen(false)
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
  const handleSendMessage = async () => {
    const currentMessage = inputMessage.trim()
    if (!currentMessage || isStreaming) return

    // 인증 체크 - 토큰이 없으면 로그인 페이지로 리다이렉트
    const currentToken = token || localStorage.getItem('auth_token')
    if (!currentToken) {
      addErrorMessage('채팅을 위해 로그인이 필요합니다.')
      setTimeout(() => {
        router.push('/login?error=auth_required&message=채팅을 위해 로그인이 필요합니다')
      }, 1500)
      return
    }

    // 메시지 길이 검증
    if (currentMessage.length > 100) {
      addErrorMessage('메시지는 100자 이하로 입력해주세요.')
      return
    }

    // 사용자 메시지 추가
    addMessage('user', currentMessage)
    setInputMessage("")

    // 전송 버튼 비활성화 및 타이핑 인디케이터 표시
    setIsStreaming(true)
    setIsTyping(true)

    try {
      await streamMessage(currentMessage)
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      addErrorMessage('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsStreaming(false)
      setIsTyping(false)
    }
  }

  // SSE 스트리밍 메시지 (9001 서버 연동)
  const streamMessage = async (message: string, retryCount = 0) => {
    // 최대 재시도 횟수 설정
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2초

    try {
      // AuthContext의 token 사용 (localStorage fallback)
      const authToken = token || localStorage.getItem('auth_token')
      
      if (!authToken) {
        throw new Error('인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.')
      }
      
      // 채팅 히스토리를 OpenAI 형식으로 변환
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || '' // Ensure content is a non-null string
      }))
      
      console.log('전송할 채팅 히스토리:', chatHistory)
      console.log('현재 메시지:', message)
      
      const response = await fetch(`${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          message: message,
          chatHistory: chatHistory,
          model: selectedModel
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 응답 오류:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        throw new Error(`스트리밍 요청 실패: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.')
      }
      
      // AI 메시지 컨테이너 생성
      let assistantMessageId = ''
      let fullResponse = ''
      let isEmergency = false

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.error) {
                  console.error('서버에서 받은 에러:', data.error)
                  if (!data.error.includes('invalid content')) {
                    addErrorMessage(data.error)
                  }
                  return
                }
                
                if (data.isEmergency && !isEmergency) {
                  isEmergency = true
                  // 응급 상황 메시지로 변경
                  if (assistantMessageId) {
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: "🚨 응급상황이 감지되었습니다! 즉시 119에 신고하거나 응급실을 방문하세요!\n\n" + fullResponse }
                        : msg
                    ))
                  }
                }
                
                if (data.content) {
                  fullResponse += data.content
                  
                  // 첫 번째 컨텐츠일 때 AI 메시지 생성
                  if (!assistantMessageId) {
                    const newMessage: Message = {
                      id: Date.now().toString(),
                      role: "assistant",
                      content: isEmergency ? "🚨 응급상황이 감지되었습니다! 즉시 119에 신고하거나 응급실을 방문하세요!\n\n" + fullResponse : fullResponse,
                      timestamp: new Date(),
                    }
                    setMessages(prev => [...prev, newMessage])
                    assistantMessageId = newMessage.id
                  } else {
                    // 기존 메시지 업데이트
                    setMessages(prev => prev.map(msg => 
                      msg.id === assistantMessageId 
                        ? { ...msg, content: isEmergency ? "🚨 응급상황이 감지되었습니다! 즉시 119에 신고하거나 응급실을 방문하세요!\n\n" + fullResponse : fullResponse }
                        : msg
                    ))
                  }
                } else {
                  console.warn('Received null or undefined content:', data);
                  // 에러 메시지를 표시하지 않고 그냥 무시
                }
                
                if (data.done) {
                  // 응답 완료
                  console.log('채팅 응답 완료')
                  setIsTyping(false)
                  return
                }

                // Handle invalid content error gracefully
                if (data.error && data.error.includes('invalid content')) {
                  console.warn('Invalid content received, not displaying in chat.')
                  return
                }
              } catch (e) {
                // JSON 파싱 오류 무시하되 로깅은 유지
                console.warn('JSON 파싱 오류 (무시됨):', {
                  line: line,
                  error: e instanceof Error ? e.message : String(e)
                })
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      console.error('채팅 오류:', error)
      
      // 상세한 에러 정보 로깅
      if (error instanceof Error) {
        console.error('에러 상세:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      
      // 인증 오류인 경우 로그인 페이지로 리다이렉트
      if (error instanceof Error && (error.message.includes('인증') || error.message.includes('401') || error.message.includes('403'))) {
        addErrorMessage("인증이 만료되었습니다. 다시 로그인해주세요.")
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else if (retryCount < MAX_RETRIES) {
        // 재시도 로직
        console.warn(`재시도 중... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => streamMessage(message, retryCount + 1), RETRY_DELAY);
      } else {
        // 구체적인 에러 메시지 표시
        const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
        addMessage("assistant", `⚠️ 오류: ${errorMsg}`)
      }
    } finally {
      setIsStreaming(false)
      setIsTyping(false)
    }
  }

  // 에러 메시지 추가 (콘솔에만 로깅)
  const addErrorMessage = (errorText: string) => {
    // "invalid content" 에러는 표시하지 않음
    if (errorText.includes('invalid content')) {
      console.warn('Invalid content 에러 무시:', errorText)
      return
    }
    
    // 중요한 에러만 사용자에게 표시
    const errorMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `⚠️ 오류: ${errorText}`,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, errorMessage])
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
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - 항상 표시 (데스크톱에서는 항상, 모바일에서는 오버레이) */}
      <div
        className={`bg-gray-900 text-white flex flex-col transition-all duration-300 z-50
          ${isSidebarCollapsed ? "w-16" : ""}
          md:relative md:translate-x-0
          ${isMobileSidebarOpen ? "fixed left-0 top-0 h-full translate-x-0" : "fixed -translate-x-full md:translate-x-0"}
        `}
        style={{ 
          width: isSidebarCollapsed ? "64px" : `${sidebarWidth}px`,
          maxWidth: isSidebarCollapsed ? "64px" : "320px" // 모바일에서 최대 너비 제한
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-6 h-6 text-emerald-400" />
                <span className="font-semibold text-sm md:text-base">MediCare AI</span>
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
        <div className="flex-1 p-4 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="space-y-4">
              {isChatMode ? (
                <>
                  <Button
                    onClick={navigateToHome}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>파일 분석</span>
                  </Button>
                  <div className="text-xs md:text-sm text-gray-400">
                    <p>AI와 직접 의료 상담을 하고 있습니다. 궁금한 건강 정보를 물어보세요.</p>
                  </div>
                </>
              ) : showAnalysis ? (
                <>
                  <Button
                    onClick={resetAnalysis}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-start space-x-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>새로운 분석</span>
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-xs md:text-sm text-gray-400">
                    <p>의료 진료 기록 분석 AI 서비스입니다.</p>
                    <br />
                    <p>처방전, 검사 결과지, 진단서 등을 업로드하여 AI 분석을 받아보세요.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Resize Handle - 데스크톱에서만 표시 */}
        <div
          className="w-1 bg-gray-600 hover:bg-gray-500 cursor-col-resize absolute top-0 right-0 h-full hidden md:block"
          onMouseDown={startResizing}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>

              {/* GPT 모델 선택박스 - 분석/채팅 모드일 때만 표시 */}
              {showAnalysis ? (
                <div className="flex items-center space-x-3">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-44 md:w-52">
                      <SelectValue placeholder="모델 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <button 
                  onClick={navigateToHome}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <Stethoscope className="w-6 md:w-8 h-6 md:h-8 text-emerald-600" />
                  <span className="text-lg md:text-xl font-bold text-gray-900">MediCare AI</span>
                </button>
              )}
         
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
           
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
                    
                    {/* 설정 버튼 - 데스크톱에서만 표시 */}
                    <Button variant="ghost" size="sm" className="p-2 hidden md:flex">
                      <Settings className="w-4 h-4" />
                    </Button>
                    
                    {/* 로그아웃 버튼 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 text-xs md:text-sm"
                    >
                      <LogOut className="w-3 md:w-4 h-3 md:h-4 mr-1" />
                      <span className="hidden md:inline">로그아웃</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/login')}
                      className="text-xs md:text-sm"
                    >
                      로그인
                    </Button>

                  </div>
                )}
              </nav>
              
              {/* Mobile User Menu */}
              {user && (
                <div className="md:hidden flex items-center space-x-2">
                  <div className="flex items-center">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="프로필"
                        className="w-6 h-6 rounded-full border border-gray-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-gray-300 bg-emerald-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-gray-600 hover:text-red-600 text-xs p-1"
                  >
                    <LogOut className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {/* Mobile Login Buttons */}
              {!user && !isLoading && (
                <div className="md:hidden flex items-center space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push('/login')}
                    className="text-xs px-2 py-1"
                  >
                    로그인
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Upload or Chat Area */}
          {!showAnalysis ? (
            <div className="w-full p-4 md:p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                {/* Description */}
                <p className="text-gray-600 text-base md:text-lg mb-8 md:mb-12 text-center px-4">
                AI가 당신의 진료 기록을 대신 분석해드립니다.
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
              <div className="flex-1 overflow-y-auto p-2 md:p-4" ref={chatContainerRef}>
                <div className="space-y-4 md:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[85%] md:max-w-3xl ${
                          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === "user" ? "bg-emerald-100" : "bg-blue-100"
                          }`}
                        >
                          {message.role === "user" ? (
                            user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt="프로필"
                                className="w-6 md:w-8 h-6 md:h-8 rounded-full border border-gray-300"
                                onError={(e) => {
                                  // 이미지 로드 실패 시 기본 아바타로 교체
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            ) : (
                              <User className="w-3 md:w-5 h-3 md:h-5 text-emerald-600" />
                            )
                          ) : (
                            <Bot className="w-3 md:w-5 h-3 md:h-5 text-blue-600" />
                          )}
                        </div>
                        <div
                          className={`p-2 md:p-3 rounded-lg ${
                            message.role === "user" ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-xs md:text-sm whitespace-pre-wrap">{message.content}</p>
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

                  {/* 타이핑 인디케이터 */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-2 max-w-[85%] md:max-w-3xl">
                        <div className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
                          <Bot className="w-3 md:w-5 h-3 md:h-5 text-blue-600" />
                        </div>
                        <div className="p-2 md:p-3 rounded-lg bg-gray-100 text-gray-900">
                          <div className="flex items-center space-x-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">AI가 응답을 작성 중입니다...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t p-2 md:p-4 bg-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isStreaming ? "AI가 응답하는 동안 기다려주세요..." : "진료 결과에 대해 질문해보세요..."}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none h-10 md:h-12 max-h-32 text-sm md:text-base"
                      rows={1}
                      disabled={isStreaming}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 hidden md:flex"
                      onClick={() => {}}
                      disabled={isStreaming}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 p-2 md:p-3" 
                    onClick={handleSendMessage}
                    disabled={isStreaming || inputMessage.trim() === ""}
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center px-2">
                  <div className="space-y-1">
                    <p className="hidden md:block">
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
              {/* Resize Handle for Results Panel - 데스크톱에서만 표시 */}
              <div
                className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize hidden md:block"
                onMouseDown={startResizingResult}
              />

              {/* Analysis Results Panel */}
              <div
                className={`bg-gray-50 border-l border-gray-200 overflow-y-auto transition-all duration-300 
                  ${isResultPanelCollapsed ? "w-16" : ""}
                  hidden md:block
                `}
                style={{ width: isResultPanelCollapsed ? "64px" : `${resultPanelWidth}px` }}
              >
                <div className="h-full flex flex-col">
                  {/* Results Panel Header */}
                  <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
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
                      {isChatMode ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">💬 채팅 도움말</h3>
                          
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 mb-2">💡 이런 질문을 해보세요</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• "두통이 있어요"</li>
                              <li>• "고혈압 관리 방법을 알려주세요"</li>
                              <li>• "당뇨병 식단 관리는 어떻게 하나요?"</li>
                              <li>• "감기 증상 완화 방법"</li>
                              <li>• "약물 복용 시 주의사항"</li>
                            </ul>
                          </div>

                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-medium text-red-800 mb-2">🚨 응급상황 시</h4>
                            <p className="text-sm text-red-700">
                              심한 통증, 호흡곤란, 의식불명 등의 응급증상이 있다면 
                              <strong> 즉시 119에 신고</strong>하거나 가까운 응급실을 방문하세요.
                            </p>
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-2">⚠️ 중요 안내</h4>
                            <p className="text-sm text-gray-700">
                              이 상담은 일반적인 의학 정보 제공을 목적으로 하며, 
                              정확한 진단이나 치료를 대체할 수 없습니다. 
                              구체적인 건강 문제는 의료진과 상담하세요.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <AnalysisResults
                          isAnalyzing={isAnalyzing}
                          analysisData={analysisData}
                          hasError={!!analysisError}
                          errorMessage={analysisError || undefined}
                          progress={analysisProgress}
                        />
                      )}
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

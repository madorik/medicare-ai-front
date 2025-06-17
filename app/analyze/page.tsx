"use client"

import { useState, useRef, useEffect } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleToastContainer } from "@/components/ui/simple-toast"
import ImageUploadSection from "@/components/image-upload-section"
import AnalysisResults from "@/components/analysis-results"
import ContactModal from "@/components/contact-modal"
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
  LogOut,
  Settings,
  Shield,
  Mail,
  Play,
  X,
  Crown,
} from "lucide-react"
import type React from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ToastMessage {
  id: string
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
}

export default function HomePage() {
  const { user, logout, isLoading, token } = useAuth()
  const router = useRouter()
  
  // API 서버 설정
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  // 토큰 상태 디버깅
  useEffect(() => {
  }, [user, token, isLoading])

  // 파일 업로드 및 분석 관련 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState("")
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  
  // GPT 모델 선택 상태 - 기본값을 o4-mini로 설정
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini")
  
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
  
  // inputMessage의 최신 값을 추적하기 위한 ref
  const inputMessageRef = useRef(inputMessage)
  useEffect(() => {
    inputMessageRef.current = inputMessage
  }, [inputMessage])

  // 채팅 관련 상태들
  const [isStreaming, setIsStreaming] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)

  // 모바일 사이드바 상태 추가
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // 모바일 분석 결과 모달 상태
  const [isMobileResultsOpen, setIsMobileResultsOpen] = useState(false)
  
  // 토스트 메시지 상태
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // 프로필 드롭다운 상태
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  
  // 광고 관련 상태
  const [showHeaderAdModal, setShowHeaderAdModal] = useState(false)
  const [pendingHeaderModel, setPendingHeaderModel] = useState<string>("")
  const [isWatchingHeaderAd, setIsWatchingHeaderAd] = useState(false)
  const [headerAdWatchTime, setHeaderAdWatchTime] = useState(0)

  // inputMessage 상태 변경 추적 (디버깅용)
  useEffect(() => {
    // 디버깅 로그 제거됨
  }, [inputMessage])

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
          "안녕하세요! 의료 문서 해석 AI입니다. 📋\n\n업로드하신 문서나 건강 정보에 대해 궁금한 점을 질문해주세요. 이해하기 쉬운 정보로 설명드리겠습니다.\n\n⚠️ 본 서비스는 교육 및 정보 제공 목적이며, 응급상황 시에는 즉시 119에 신고하거나 가까운 응급실을 방문하세요."
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
    setAnalysisData(data)
    if (progress !== undefined) setAnalysisProgress(progress)
  }

  // 분석 완료 핸들러
  const handleAnalysisComplete = () => {
    setIsAnalyzing(false)
    setAnalysisProgress(100)
    setStatusMessage("분석이 완료되었습니다.")
    
    // 분석 완료 시 결과 패널/모달 자동 열기
    if (window.innerWidth < 768) {
      // 모바일: 결과 모달 열기
      setIsMobileResultsOpen(true)
    } else {
      // 데스크톱: 결과 패널이 접혀있다면 펼치기
      setIsResultPanelCollapsed(false)
    }
    
    // 초기 AI 메시지 추가
    addMessage(
      "assistant",
      "안녕하세요! 문서 해석이 완료되었습니다. 해석 결과에 대해 궁금한 점이 있으시면 질문해주세요.\n\n※ 본 정보는 교육 목적이며, 정확한 진단은 의료진과 상담하시기 바랍니다."
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

  // 토스트 메시지 추가
  const addToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      message,
      type,
    }
    setToasts((prev) => [...prev, newToast])
  }

  // 토스트 메시지 제거
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id))
  }

  // 강제 리렌더링용 (필요시 사용)
  // const [, forceUpdate] = useState(0)

  const handleTextDragToChat = (text: string) => {
    if (!text.trim()) return;
    const trimmedText = text.length > 200 ? text.substring(0, 200) + '...' : text;
    
    // 입력창에 텍스트 설정
    setInputMessage(trimmedText);
    
    // 토스트 알림
    addToast('선택한 텍스트가 입력창에 추가되었습니다!', 'success');
    
    // 모바일에서만 분석 결과 영역 닫기
    if (window.innerWidth < 768) {
      // 모바일: 결과 모달 닫기
      setIsMobileResultsOpen(false);
    }
    // 데스크톱에서는 분석 결과 패널 유지 (접지 않음)
  }

  // 텍스트 메시지를 바로 전송하는 함수
  const sendTextMessage = async (message: string) => {
    if (!message.trim() || isStreaming) return

    // 인증 체크
    const currentToken = token || localStorage.getItem('auth_token')
    if (!currentToken) {
      addErrorMessage('채팅을 위해 로그인이 필요합니다.')
      return
    }

    // 사용자 메시지 추가
    addMessage('user', message)
    setInputMessage("")

    // 스트리밍 상태 설정
    setIsStreaming(true)
    setIsTyping(true)

    try {
      // AI 응답 처리
      await streamMessage(message)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
      addMessage("assistant", `⚠️ 오류: ${errorMsg}`)
    } finally {
      setIsStreaming(false)
      setIsTyping(false)
    }
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
    if (currentMessage.length > 200) {
      addErrorMessage('메시지는 200자 이하로 입력해주세요.')
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
      addErrorMessage('메시지 전송 중 오류가 발생했습니다.')
    } finally {
      setIsStreaming(false)
      setIsTyping(false)
    }
  }

  // SSE 스트리밍 메시지 (9001 서버 연동)
  const streamMessage = async (message: string) => {
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
                  // null/undefined content 무시
                }
                
                if (data.done) {
                  // 응답 완료
                  setIsTyping(false)
                  return
                }

                // Handle invalid content error gracefully
                if (data.error && data.error.includes('invalid content')) {
                  return
                }
              } catch (e) {
                // JSON 파싱 오류 무시
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    } catch (error) {
      // 인증 오류인 경우 로그인 페이지로 리다이렉트
      if (error instanceof Error && (error.message.includes('인증') || error.message.includes('401') || error.message.includes('403'))) {
        addErrorMessage("인증이 만료되었습니다. 다시 로그인해주세요.")
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        // 오류 메시지 표시
        const errorMsg = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
        addMessage("assistant", `⚠️ 오류: ${errorMsg}`)
      }
    } finally {
      setIsStreaming(false)
      setIsTyping(false)
    }
  }

  // 에러 메시지 추가
  const addErrorMessage = (errorText: string) => {
    // "invalid content" 에러는 표시하지 않음
    if (errorText.includes('invalid content')) {
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

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileDropdownOpen(false)
      addToast('로그아웃되었습니다.', 'success')
      router.push('/')
    } catch (error) {
      addToast('로그아웃 중 오류가 발생했습니다.', 'error')
    }
  }

  // 프로필 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

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

  // 헤더 모델 변경 핸들러
  const handleHeaderModelChange = (newModel: string) => {
    if (newModel !== "gpt-4o-mini") {
      // 다른 모델 선택 시 광고 시청 확인
      setPendingHeaderModel(newModel)
      setShowHeaderAdModal(true)
    } else {
      // gpt-4o-mini는 바로 적용
      setSelectedModel(newModel)
    }
  }

  // 헤더 광고 시청 시작
  const startWatchingHeaderAd = () => {
    setIsWatchingHeaderAd(true)
    setHeaderAdWatchTime(0)
    
    // 15초 광고 타이머
    const timer = setInterval(() => {
      setHeaderAdWatchTime(prev => {
        if (prev >= 14) {
          clearInterval(timer)
          setIsWatchingHeaderAd(false)
          setShowHeaderAdModal(false)
          // 상태 변경을 다음 이벤트 루프로 연기
          setTimeout(() => {
            setSelectedModel(pendingHeaderModel)
          }, 0)
          return 15
        }
        return prev + 1
      })
    }, 1000)
  }

  // 헤더 광고 건너뛰기 (모델 변경 취소)
  const skipHeaderAd = () => {
    setShowHeaderAdModal(false)
    setPendingHeaderModel("")
    setIsWatchingHeaderAd(false)
    setHeaderAdWatchTime(0)
  }

  return (
    <div className="min-h-screen md:h-screen flex md:overflow-hidden bg-gray-50">
      {/* 토스트 알림 */}
      <SimpleToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Mobile Analysis Results Modal */}
      {isMobileResultsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="h-full bg-white flex flex-col">
            {/* Modal Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI 분석 결과</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileResultsOpen(false)}
                className="text-white hover:bg-emerald-700 p-2"
              >
                ✕
              </Button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4">
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
                      <li>• "검사 수치 의미"</li>
                      <li>• "처방 내용 설명"</li>
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
                      본 서비스는 교육 및 정보 제공 목적이며, <br />
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
                  onTextDragToChat={handleTextDragToChat}
                />
              )}
            </div>
          </div>
        </div>
      )}
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
          ${isSidebarCollapsed ? "w-20" : ""}
          md:relative md:translate-x-0
          ${isMobileSidebarOpen ? "fixed left-0 top-0 h-full translate-x-0" : "fixed -translate-x-full md:translate-x-0"}
        `}
        style={{ 
          width: isSidebarCollapsed ? "80px" : `${sidebarWidth}px`,
          maxWidth: isSidebarCollapsed ? "80px" : "320px" // 모바일에서 최대 너비 제한
        }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <button
                onClick={() => router.push('/info')}
                className="flex items-center space-x-2 hover:text-emerald-400 transition-colors cursor-pointer group"
              >
                <Stethoscope className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  MediCare AI
                </span>
              </button>
            )}
{isSidebarCollapsed && (
              <button
                onClick={() => router.push('/info')}
                className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer mr-2"
              >
                <Stethoscope className="w-6 h-6" />
              </button>
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
                    <p>AI와 직접 건강 정보 상담을 하고 있습니다. 궁금한 내용을 물어보세요.</p>
                    <p className="text-xs text-gray-500 mt-1">※ 교육 및 정보 제공 목적</p>
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
                    <p>의료 문서 해석 AI 서비스입니다.</p>
                    <p className="text-xs text-gray-500 mt-1">※ 참고용 정보 제공</p>
                    <p>처방전, 검사 결과지, 진단서 등을 업로드하여 AI 해석을 받아보세요.</p>
                  </div>
                  
                  {/* Contact 버튼 */}
                  <div className="mt-4">
                    <ContactModal>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-gray-600 hover:text-emerald-600 border-gray-600 hover:border-emerald-600"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        개발자에게 문의
                      </Button>
                    </ContactModal>
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
      <div className="flex-1 flex flex-col min-h-0">
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
                  <Select value={selectedModel} onValueChange={handleHeaderModelChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="모델 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                      <SelectItem value="gpt-4o">
                        <div className="flex items-center space-x-2">
                          <span>gpt-4o</span>
                          <Crown className="w-3 h-3 text-amber-500" />
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt-4.1">
                        <div className="flex items-center space-x-2">
                          <span>gpt-4.1</span>
                          <Crown className="w-3 h-3 text-amber-500" />
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <button 
                  onClick={navigateToHome}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                </button>
              )}
         
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <nav className="hidden md:flex items-center space-x-6">
                {/* Contact 메뉴 */}
                <ContactModal>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-emerald-600 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </ContactModal>
           
                {/* 로그인 상태에 따른 UI 분기 */}
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : user ? (
                  <div className="flex items-center space-x-3">
                    {/* 사용자 프로필 드롭다운 */}
                    <div className="relative" ref={profileDropdownRef}>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
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
                        ) : (
                          <div className="w-8 h-8 rounded-full border border-gray-300 bg-emerald-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                          {user.name || user.email}
                        </span>
                      </button>

                      {/* 프로필 드롭다운 메뉴 */}
                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          {/* 사용자 정보 */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              {user.profileImage ? (
                                <img
                                  src={user.profileImage}
                                  alt="프로필"
                                  className="w-10 h-10 rounded-full border border-gray-300"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full border border-gray-300 bg-emerald-100 flex items-center justify-center">
                                  <User className="w-5 h-5 text-emerald-600" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.name || '사용자'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 메뉴 항목들 */}
                          <div className="py-1">
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>로그아웃</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

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
                <div className="md:hidden flex items-center relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center p-1 rounded-lg hover:bg-gray-50 transition-colors"
                  >
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
                  </button>

                  {/* 모바일 프로필 드롭다운 메뉴 */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* 사용자 정보 */}
                      <div className="px-3 py-2 border-b border-gray-100">
                        <div className="flex items-center space-x-2">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt="프로필"
                              className="w-8 h-8 rounded-full border border-gray-300"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border border-gray-300 bg-emerald-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {user.name || '사용자'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 메뉴 항목들 */}
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>로그아웃</span>
                        </button>
                      </div>
                    </div>
                  )}
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
        <div className="flex-1 flex overflow-auto md:overflow-hidden">
          {/* Upload or Chat Area */}
          {!showAnalysis ? (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-auto md:overflow-hidden">
              {/* Hero Section */}
              <div className="flex-1 flex flex-col justify-start md:justify-center py-6 md:py-8">
                <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
                  {/* Main Heading */}
                  <div className="mb-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                      <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        AI 의료 문서 해석 새로운 경험
                      </span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-6">
                      처방전, 검사 결과지, 진단서를 업로드하면 AI가 즉시 해석하여 상세한 정보를 제공합니다
                    </p>
                  </div>

                  {/* Upload Section */}
                  <div className="mb-6">
                    <div className="max-w-4xl mx-auto">
                      <ImageUploadSection
                        onAnalysisStart={handleAnalysisStart}
                        onAnalysisResult={handleAnalysisResult}
                        onAnalysisComplete={handleAnalysisComplete}
                        onError={handleAnalysisError}
                        onStatusUpdate={handleStatusUpdate}
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="flex-1 flex flex-col bg-white overflow-auto md:overflow-hidden">
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
                        {message.role === "assistant" && (
                          <div className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img 
                              src="/images/bot-profile.png" 
                              alt="AI 어시스턴트"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
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
                        <div className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img 
                            src="/images/bot-profile.png" 
                            alt="AI 어시스턴트"
                            className="w-full h-full object-cover"
                          />
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

              {/* Mobile Analysis Results Toggle Button */}
              {showAnalysis && (
                <div className="border-t p-2 bg-gray-50 flex-shrink-0 md:hidden">
                  <Button
                    onClick={() => setIsMobileResultsOpen(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-2"
                    size="sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>AI 분석 결과 보기</span>
                  </Button>
                </div>
              )}

              {/* Chat Input */}
              <div className="border-t p-2 md:p-4 bg-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isStreaming ? "AI가 응답하는 동안 기다려주세요..." : "문서 내용에 대해 질문해보세요..."}
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
                      업로드된 문서 파일은 서버에 저장되지 않으며, 처리 완료 후 즉시 삭제됩니다. <br />
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
                      <div className="flex items-center space-x-2">
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
                        {!isResultPanelCollapsed && (
                          <h2 className="text-lg font-semibold text-gray-900">AI 분석 결과</h2>
                        )}
                      </div>
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
                              <li>• "약물 복용 시 주의사항"</li>
                              <li>• "검사 수치 의미"</li>
                              <li>• "처방 내용 설명"</li>
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
                              본 서비스는 교육 및 정보 제공 목적이며, <br />
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
                          onTextDragToChat={handleTextDragToChat}
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

      {/* 헤더 광고 시청 모달 */}
      {showHeaderAdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  프리미엄 모델 사용
                </h3>
                <button
                  onClick={skipHeaderAd}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-700 mb-2">
                  <strong>{pendingHeaderModel}</strong> 모델을 사용하려면
                </p>
                <p className="text-sm text-gray-500">
                  15초 광고를 시청해주세요
                </p>
              </div>

              {!isWatchingHeaderAd ? (
                <div className="space-y-3">
                  <Button
                    onClick={startWatchingHeaderAd}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    광고 보고 사용하기
                  </Button>
                  <Button
                    onClick={skipHeaderAd}
                    variant="outline"
                    className="w-full"
                  >
                    취소
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 고수익 광고 시뮬레이션 - 다양한 광고 랜덤 표시 */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-lg text-center">
                    <h4 className="font-bold text-lg mb-2">💎 로lex 시계</h4>
                    <p className="text-sm mb-3">스위스 명품 시계 한정 할인!</p>
                    <div className="bg-white/20 rounded-lg p-2">
                      <p className="text-xs">특가 8,500만원</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {15 - headerAdWatchTime}초
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(headerAdWatchTime / 15) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">광고 시청 중...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

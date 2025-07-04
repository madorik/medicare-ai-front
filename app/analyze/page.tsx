﻿"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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

  // 채팅방 목록 상태
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(false)
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)

  // 프로필 드롭다운 상태
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  
  // 광고 관련 상태
  const [showHeaderAdModal, setShowHeaderAdModal] = useState(false)
  const [pendingHeaderModel, setPendingHeaderModel] = useState<string>("")
  const [isWatchingHeaderAd, setIsWatchingHeaderAd] = useState(false)
  const [headerAdWatchTime, setHeaderAdWatchTime] = useState(0)
  
  // 신규 사용자 관련 상태
  const [isNewUser, setIsNewUser] = useState(false)
  


  // inputMessage 상태 변경 추적 (디버깅용)
  useEffect(() => {
    // 디버깅 로그 제거됨
  }, [inputMessage])

  // URL 파라미터 확인해서 채팅 모드 설정 및 roomId 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const chatParam = urlParams.get('chat')
    const roomId = urlParams.get('roomId')
    
    // 현재 활성 채팅방 ID 업데이트
    setCurrentRoomId(roomId)
    
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
    
    // roomId가 있으면 해당 채팅룸 정보 불러오기
    if (roomId) {
      loadChatRoom(roomId)
    }
  }, [])

  // 브라우저 뒤로 가기/앞으로 가기 버튼 처리
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const roomId = urlParams.get('roomId')
      setCurrentRoomId(roomId)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 신규 사용자 체크 및 이벤트 팝업 표시 함수 (로그인 사용자만)
  const checkNewUser = () => {
    // 로그인하지 않은 사용자는 처리하지 않음
    if (!user || !user.createdAt) {
      console.log('🔍 로그인하지 않은 사용자 또는 createdAt 정보 없음:', user)
      setIsNewUser(false)
      return
    }
    
    const createdAt = new Date(user.createdAt)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('📅 가입일 체크:', {
      createdAt: createdAt.toISOString(),
      now: now.toISOString(),
      diffInDays,
      isNewUser: diffInDays <= 3
    })
    
    // 신규 사용자 여부 설정 (가입 후 3일 이내)
    if (diffInDays <= 3) {
      setIsNewUser(true)
    } else {
      setIsNewUser(false)
    }
  }

  // 인증 상태 변경 시 채팅방 목록 로딩 및 신규 사용자 체크
  useEffect(() => {
    if (user && token && !isLoading) {
      loadChatRooms()
      checkNewUser()
    }
  }, [user, token, isLoading])

  // 쿠키 관리 함수들
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
  }

  const getCookie = (name: string) => {
    return document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=')
      return parts[0] === name ? decodeURIComponent(parts[1]) : r
    }, '')
  }



  // 새로운 분석 페이지로 이동하는 함수
  const navigateToHome = () => {
    setIsChatMode(false)
    setShowAnalysis(false)
    setMessages([])
    setAnalysisData("")
    setAnalysisError(null)
    setAnalysisProgress(0)
    setIsSidebarCollapsed(true)
    setIsMobileSidebarOpen(false)
    setIsMobileResultsOpen(false)
    setCurrentRoomId(null) // 현재 활성 채팅방 초기화
    // analyze 페이지의 깨끗한 상태로 이동 (파라미터 제거)
    router.push('/analyze')
  }

  // 채팅방 클릭 시 해당 채팅방으로 이동하고 분석 결과 로드
  const navigateToChatRoom = async (roomId: string) => {
    try {
      setLoadingRoomId(roomId)
      
      // 현재 활성 채팅방 업데이트
      setCurrentRoomId(roomId)
      
      // URL 업데이트
      const newUrl = `/analyze?roomId=${roomId}`
      window.history.pushState({}, '', newUrl)
      
      // 직접 채팅룸 데이터 로드
      await loadChatRoom(roomId)
    } catch (error) {
      console.error('채팅룸 로드 실패:', error)
      // 토스트 메시지 제거 - 에러는 분석 결과 영역에 표시됨
    } finally {
      setLoadingRoomId(null)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return '방금 전'
    } else if (diffInMinutes < 30) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 60) {
      return '30분 전'
    } else if (diffInMinutes < 120) {  // 2시간 미만
      return '1시간 전'
    } else if (diffInMinutes < 24 * 60) {  // 24시간 미만
      const diffInHours = Math.floor(diffInMinutes / 60)
      return `${diffInHours}시간 전`
    } else if (diffInMinutes < 24 * 60 * 7) {  // 1주일 미만
      const diffInDays = Math.floor(diffInMinutes / (24 * 60))
      return `${diffInDays}일 전`
    } else {
      return '오래된'
    }
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
    // 모바일에서는 분석 시작 시 사이드바를 닫고 결과 모달을 바로 열어 진행 상황을 보여줌
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false) // 사이드바 닫기
      setIsMobileResultsOpen(true)
    }
  }

  // 실시간 분석 결과 핸들러
  const handleAnalysisResult = (data: string, tokenCount?: number, progress?: number) => {
    setAnalysisData(data)
    if (progress !== undefined) setAnalysisProgress(progress)
  }

  // URL에 roomId를 추가하는 함수
  const updateUrlWithRoomId = (roomId: string) => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('roomId', roomId)
    window.history.replaceState(null, '', currentUrl.toString())
  }

  // 채팅방 목록을 불러오는 함수
  const loadChatRooms = async () => {
    try {
      setIsLoadingChatRooms(true)
      const authToken = token || localStorage.getItem('auth_token')
      
      if (!authToken) {
        console.log('🔒 인증 토큰 없음 - 채팅방 목록 로딩 건너뜀')
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/medical/chat-rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.log('🔒 인증 실패 - 채팅방 목록 로딩 실패')
          return
        }
        throw new Error(`채팅방 목록을 불러오는데 실패했습니다: ${response.status}`)
      }

      const apiResponse = await response.json()
      const chatRoomsList = apiResponse.success ? apiResponse.data : []
      
      console.log('📂 채팅방 목록 로딩 완료:', chatRoomsList.length, '개')
      setChatRooms(chatRoomsList)

    } catch (error) {
      console.error('❌ 채팅방 목록 로딩 오류:', error)
    } finally {
      setIsLoadingChatRooms(false)
    }
  }

  // 채팅룸 정보를 불러오는 함수
  const loadChatRoom = async (roomId: string) => {
    try {
      const authToken = token || localStorage.getItem('auth_token')
      
      if (!authToken) {
        throw new Error('인증 토큰을 찾을 수 없습니다. 다시 로그인해주세요.')
      }

      const response = await fetch(`${API_BASE_URL}/api/medical/chat-rooms/${roomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.')
        } else if (response.status === 404) {
          throw new Error('해당 채팅룸을 찾을 수 없습니다.')
        }
        throw new Error(`채팅룸 정보를 불러오는데 실패했습니다: ${response.status}`)
      }

      const apiResponse = await response.json()
      
      // API 응답 구조 확인 및 데이터 추출
      const chatRoom = apiResponse.success ? apiResponse.data : apiResponse
      
      // 결과 포맷팅
      const CATEGORY_NAMES_KR: { [key: string]: string } = {
        'prescription': '처방전',
        'test_result': '검사 결과',
        'diagnosis': '진단서',
        'medical_record': '진료기록',
        'health_checkup': '건강검진',
        'other': '기타'
      }

      const formattedChatRoom = {
        id: chatRoom.medical_analysis.id,
        model: chatRoom.medical_analysis.model,
        summary: chatRoom.medical_analysis.summary,
        result: chatRoom.medical_analysis.result,
        document_type: chatRoom.medical_analysis.document_type || 'other',
        document_type_name: chatRoom.medical_analysis.document_type_name || CATEGORY_NAMES_KR[chatRoom.medical_analysis.document_type] || '기타',
        created_at: chatRoom.medical_analysis.created_at
      }

      // 상태 초기화
      setIsAnalyzing(false)
      setAnalysisError(null)
      
      // 채팅 모드 활성화
      setIsChatMode(true)
      setShowAnalysis(true)
      setIsSidebarCollapsed(false)
      
      setAnalysisData(formattedChatRoom.result || '')
      setAnalysisProgress(100)
      setStatusMessage('저장된 분석 결과를 불러왔습니다.')
      
      // 채팅 히스토리 불러오기 (API 응답에 chatHistory가 있는 경우)
      if (chatRoom.chatHistory && Array.isArray(chatRoom.chatHistory)) {
        const formattedMessages: Message[] = []
        
        // chatHistory의 각 항목을 사용자 메시지와 AI 응답으로 분리하여 추가
        chatRoom.chatHistory.forEach((chat: any) => {
          // 사용자 메시지 추가
          if (chat.user_message) {
            formattedMessages.push({
              id: `user-${chat.id}`,
              role: "user",
              content: chat.user_message,
              timestamp: new Date(chat.created_at)
            })
          }
          
          // AI 응답 추가
          if (chat.ai_response) {
            formattedMessages.push({
              id: `ai-${chat.id}`,
              role: "assistant",
              content: chat.ai_response,
              timestamp: new Date(chat.created_at)
            })
          }
        })
        
        setMessages(formattedMessages)
      } else {
        // 히스토리가 없으면 기본 환영 메시지 추가
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "안녕하세요! 의료 문서 해석 AI입니다. 📋\n\n업로드하신 문서나 건강 정보에 대해 궁금한 점을 질문해주세요. 이해하기 쉬운 정보로 설명드리겠습니다.\n\n⚠️ 본 서비스는 교육 및 정보 제공 목적이며, 응급상황 시에는 즉시 119에 신고하거나 가까운 응급실을 방문하세요.",
          timestamp: new Date()
        }
        setMessages([welcomeMessage])
      }
      
      // 모바일에서는 사이드바 닫고 결과 모달 열기
      if (window.innerWidth < 768) {
        setIsMobileSidebarOpen(false)
        setIsMobileResultsOpen(true)
      } else {
        setIsResultPanelCollapsed(false)
      }

      // 성공적으로 로드됨 (토스트 메시지 제거)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '채팅룸 정보를 불러오는데 실패했습니다.'
      
      // 인증 오류인 경우 로그인 페이지로 리다이렉트
      if (errorMessage.includes('인증') || errorMessage.includes('로그인')) {
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setAnalysisError(errorMessage)
      }
    }
  }

  // 분석 완료 핸들러
  const handleAnalysisComplete = async () => {
    setIsAnalyzing(false)
    setAnalysisProgress(100)
    setStatusMessage("분석이 완료되었습니다.")
    
    // 채팅방 목록 갱신 (새로운 분석 결과로 인한 채팅방 생성/업데이트 반영)
    if (user && token && !isLoading) {
      try {
        await loadChatRooms()
      } catch (error) {
        console.error('채팅방 목록 갱신 실패:', error)
        // 갱신 실패해도 분석 완료 프로세스는 계속 진행
      }
    }
    
    // 분석 완료 시 결과 패널/모달 자동 열기
    if (window.innerWidth < 768) {
      // 모바일: 사이드바 닫고 결과 모달 열기
      setIsMobileSidebarOpen(false)
      setIsMobileResultsOpen(true)
    } else {
      // 데스크톱: 결과 패널이 접혀있다면 펼치기
      setIsResultPanelCollapsed(false)
    }
    
    // 환자 상태 설명 요청 메시지
    const statusRequestMessage = "분석된 의료문서를 바탕으로 이해하기 쉽게 마크다운이 아니라 대화식으로 설명해주세요."
    
    // 스트리밍으로 환자 상태 설명 요청
    try {
      setIsStreaming(true)
      setIsTyping(true)
      await streamMessage(statusRequestMessage)
    } catch (error) {
      // 오류 발생 시 기본 메시지 표시
      addMessage(
        "assistant",
        "안녕하세요! 문서 해석이 완료되었습니다. \n\n※ 본 정보는 교육 목적이며, 정확한 진단은 의료진과 상담하시기 바랍니다."
      )
    }
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
    setLoadingRoomId(null)
    setIsChatMode(false)
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
      
      // URL에서 현재 roomId 가져오기
      const urlParams = new URLSearchParams(window.location.search)
      const currentRoomId = urlParams.get('roomId') || null
      
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
          model: selectedModel,
          roomId: currentRoomId
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

  // 채팅 모드가 활성화되고 메시지가 있을 때 채팅 영역으로 스크롤
  useEffect(() => {
    if (isChatMode && messages.length > 0 && chatContainerRef.current) {
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      }, 100)
    }
  }, [isChatMode, messages.length])

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
      // 신규 사용자(가입 후 3일 이내)는 프리미엄 모델 무료 사용
      if (isNewUser) {
        setSelectedModel(newModel)
      } else {
        // 기존 사용자는 광고 시청 필요
        setPendingHeaderModel(newModel)
        setShowHeaderAdModal(true)
      }
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

  // 인라인 마크다운 처리 함수 (굵은 글씨, 기울임, 인라인 코드 등)
  const processInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text
    
    // **굵은 글씨** 처리
    let processed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // *기울임* 처리 (굵은 글씨와 겹치지 않도록)
    processed = processed.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    
    // `인라인 코드` 처리
    processed = processed.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // 링크 처리 [텍스트](URL)
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // 이미지 처리 ![alt](URL)
    processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm" />')
    
    // HTML을 JSX로 변환
    return <span dangerouslySetInnerHTML={{ __html: processed }} />
  }

  // 마크다운을 HTML로 변환하는 함수
  const renderMarkdown = (text: string) => {
    if (!text) return null
    
    // 줄 단위로 처리
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let i = 0
    
    while (i < lines.length) {
      const line = lines[i].trim()
      
      // 빈 줄 처리
      if (line === '') {
        elements.push(<br key={`br-${i}`} />)
        i++
        continue
      }
      
      // 헤더 처리 (# ## ### ####)
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1
        const headerText = line.replace(/^#+\s*/, '')
        const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        
        elements.push(
          <HeaderTag 
            key={`header-${i}`} 
            className={`font-bold mt-4 mb-2 ${
              level === 1 ? 'text-lg text-gray-900' :
              level === 2 ? 'text-base text-gray-800' :
              level === 3 ? 'text-sm text-gray-800' :
              'text-xs text-gray-700'
            }`}
          >
            {processInlineMarkdown(headerText)}
          </HeaderTag>
        )
        i++
        continue
      }
      
      // 중첩된 리스트 처리 (- * +)
      if (/^(\s*)[-*+]\s/.test(line)) {
        const renderNestedList = (startIndex: number): { elements: JSX.Element, nextIndex: number } => {
          const listItems: JSX.Element[] = []
          let j = startIndex
          const baseIndent = lines[startIndex].match(/^(\s*)[-*+]\s/)?.[1].length || 0
          
          while (j < lines.length) {
            const currentLine = lines[j]
            const trimmedLine = currentLine.trim()
            
            // 빈 줄은 건너뛰기
            if (!trimmedLine) {
              j++
              continue
            }
            
            // 리스트 아이템이 아니면 종료
            if (!/^(\s*)[-*+]\s/.test(currentLine)) {
              break
            }
            
            const indentMatch = currentLine.match(/^(\s*)[-*+]\s(.*)/)
            if (!indentMatch) {
              j++
              continue
            }
            
            const [, indent, itemText] = indentMatch
            const currentIndent = indent.length
            
            // 현재 레벨보다 깊은 들여쓰기면 종료 (하위 리스트로 처리됨)
            if (currentIndent > baseIndent) {
              break
            }
            
            // 현재 레벨보다 얕은 들여쓰기면 종료 (상위 레벨로 돌아감)
            if (currentIndent < baseIndent) {
              break
            }
            
            // 체크박스 리스트 처리
            if (itemText.startsWith('[ ]') || itemText.startsWith('[x]') || itemText.startsWith('[X]')) {
              const isChecked = itemText.startsWith('[x]') || itemText.startsWith('[X]')
              const checkboxText = itemText.replace(/^\[[ xX]\]\s/, '')
              
              listItems.push(
                <li key={`li-${j}`} className="mb-1 flex items-start">
                  <input 
                    type="checkbox" 
                    checked={isChecked} 
                    readOnly
                    className="mr-2 mt-1" 
                  />
                  <span>{processInlineMarkdown(checkboxText)}</span>
                </li>
              )
            } else {
              // 다음 줄이 더 깊은 들여쓰기인지 확인 (중첩된 리스트)
              let hasNestedList = false
              let nestedListElement: JSX.Element | null = null
              
              if (j + 1 < lines.length) {
                const nextLine = lines[j + 1]
                const nextIndentMatch = nextLine.match(/^(\s*)[-*+]\s/)
                if (nextIndentMatch && nextIndentMatch[1].length > currentIndent) {
                  hasNestedList = true
                  const nested = renderNestedList(j + 1)
                  nestedListElement = nested.elements
                  j = nested.nextIndex - 1 // -1 because j will be incremented
                }
              }
              
              listItems.push(
                <li key={`li-${j}`} className="mb-1">
                  <span>{processInlineMarkdown(itemText)}</span>
                  {nestedListElement}
                </li>
              )
            }
            
            j++
          }
          
          const marginLeft = baseIndent > 0 ? `${baseIndent / 2}rem` : '0.5rem'
          
          return {
            elements: (
              <ul 
                key={`ul-${startIndex}`} 
                className="list-disc mb-2"
                style={{ marginLeft }}
              >
                {listItems}
              </ul>
            ),
            nextIndex: j
          }
        }
        
        const result = renderNestedList(i)
        elements.push(result.elements)
        i = result.nextIndex
        continue
      }
      
      // 숫자 리스트 처리 (1. 2. 3.) - 기호로 대체
      if (/^\d+\.\s/.test(line)) {
        const listItems: JSX.Element[] = []
        let j = i
        let listNumber = 0
        
        // 다양한 기호들
        const symbols = ['●', '▸', '▶', '◆', '▪', '◾']
        
        while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
          const itemText = lines[j].trim().replace(/^\d+\.\s/, '')
          const symbol = symbols[listNumber % symbols.length]
          
          listItems.push(
            <li key={`oli-${j}`} className="ml-2 mb-1 flex items-start">
              <span className="text-emerald-600 mr-2 flex-shrink-0">{symbol}</span>
              <span className="flex-1">{processInlineMarkdown(itemText)}</span>
            </li>
          )
          listNumber++
          j++
        }
        
        elements.push(
          <ul key={`ul-${i}`} className="mb-2" style={{ listStyle: 'none' }}>
            {listItems}
          </ul>
        )
        i = j
        continue
      }
      
      // 인용문 처리 (>)
      if (line.startsWith('>')) {
        const quoteText = line.replace(/^>\s*/, '')
        elements.push(
          <blockquote 
            key={`quote-${i}`} 
            className="border-l-2 border-blue-400 pl-2 py-1 bg-blue-50 mb-2 italic text-gray-700 text-xs"
          >
            {processInlineMarkdown(quoteText)}
          </blockquote>
        )
        i++
        continue
      }
      
      // 구분선 처리 (---)
      if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
        elements.push(
          <hr key={`hr-${i}`} className="border-t border-gray-300 my-3" />
        )
        i++
        continue
      }
      
      // 테이블 처리
      if (line.includes('|') && lines[i + 1]?.includes('|')) {
        const tableRows: JSX.Element[] = []
        let j = i
        let isHeader = true
        
        while (j < lines.length && lines[j].includes('|')) {
          const row = lines[j].trim()
          
          // 구분선 스킵 (|---|---|)
          if (/^\|[\s\-\|:]+\|$/.test(row)) {
            j++
            continue
          }
          
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell)
          
          if (isHeader) {
            tableRows.push(
              <tr key={`tr-${j}`}>
                {cells.map((cell, cellIndex) => (
                  <th key={`th-${j}-${cellIndex}`} className="border border-gray-300 px-2 py-1 bg-gray-100 font-semibold text-left text-xs">
                    {processInlineMarkdown(cell)}
                  </th>
                ))}
              </tr>
            )
            isHeader = false
          } else {
            tableRows.push(
              <tr key={`tr-${j}`}>
                {cells.map((cell, cellIndex) => (
                  <td key={`td-${j}-${cellIndex}`} className="border border-gray-300 px-2 py-1 text-xs">
                    {processInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            )
          }
          j++
        }
        
        if (tableRows.length > 0) {
          elements.push(
            <table key={`table-${i}`} className="w-full border-collapse border border-gray-300 mb-2 text-xs">
              <tbody>{tableRows}</tbody>
            </table>
          )
        }
        i = j
        continue
      }
      
      // 코드 블록 처리 (```)
      if (line.startsWith('```')) {
        const codeLines: string[] = []
        i++ // 시작 ``` 다음 줄부터
        
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i])
          i++
        }
        
        elements.push(
          <pre 
            key={`code-${i}`} 
            className="bg-gray-100 p-2 rounded mb-2 overflow-x-auto"
          >
            <code className="text-xs font-mono text-gray-800">
              {codeLines.join('\n')}
            </code>
          </pre>
        )
        i++ // 종료 ``` 다음으로
        continue
      }
      
      // 일반 문단 처리
      elements.push(
        <p key={`p-${i}`} className="mb-2 leading-relaxed text-gray-800">
          {processInlineMarkdown(line)}
        </p>
      )
      i++
    }
    
    return <div className="markdown-content">{elements}</div>
  }

  // 프로필 드롭다운 토글 함수 (메모화)
  const toggleProfileDropdown = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev)
  }, [])

  return (
    <div className="min-h-screen md:h-screen flex md:overflow-hidden bg-gray-50">
      {/* 토스트 알림 */}
      <SimpleToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Mobile Analysis Results Modal */}
      {isMobileResultsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden">
          <div className="h-full w-full bg-white flex flex-col shadow-2xl">
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
              {analysisData ? (
                <AnalysisResults
                  isAnalyzing={isAnalyzing}
                  analysisData={analysisData}
                  hasError={!!analysisError}
                  errorMessage={analysisError || undefined}
                  progress={analysisProgress}
                  onTextDragToChat={handleTextDragToChat}
                />
              ) : isChatMode ? (
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
        {/* Sidebar Header - 고정 영역 */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <button
                onClick={() => router.push('/info')}
                className="flex items-center space-x-2 hover:text-emerald-400 transition-colors cursor-pointer group"
              >
                <Stethoscope className="w-6 h-6 text-emerald-400" />
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    또닥 AI
                  </span>
                  <div className="relative">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-200">
                      BETA
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      BETA
                    </div>
                  </div>
                </div>
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

        {/* Sidebar Fixed Content - 고정 영역 */}
        {!isSidebarCollapsed && (
          <div className="flex-shrink-0 p-4 border-b border-gray-700">
            {isChatMode ? (
              <>
                <Button
                  onClick={navigateToHome}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-start space-x-2 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>새로운 분석</span>
                </Button>
                <div className="text-xs md:text-sm text-gray-400 mt-4">
                  <p>AI와 직접 건강 정보 상담을 하고 있습니다. 궁금한 내용을 물어보세요.</p>
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
                  <p>처방전, 검사 결과지, 진단서 등을 업로드하여 AI 해석을 받아보세요.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sidebar Scrollable Content - 스크롤 영역 */}
        {!isSidebarCollapsed && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {/* 채팅방 목록 */}
              {chatRooms.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {isChatMode ? "이전 채팅" : "이전 분석"}
                  </h3>
                  <div className="space-y-2">
                    {chatRooms.map((room) => {
                      const isActive = currentRoomId === room.id
                      const isLoading = loadingRoomId === room.id
                      
                      return (
                        <button
                          key={room.id}
                          onClick={() => navigateToChatRoom(room.id)}
                          disabled={isLoading}
                          className={`w-full text-left p-2 rounded-lg transition-colors group relative ${
                            isLoading 
                              ? 'bg-gray-800 cursor-not-allowed' 
                              : isActive
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'hover:bg-gray-800'
                          }`}
                        >
                          {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-lg">
                              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            </div>
                          )}
                          <div className={`text-sm truncate transition-colors ${
                            isLoading 
                              ? 'text-gray-400' 
                              : isActive
                                ? 'text-emerald-400 font-medium'
                                : 'text-white group-hover:text-emerald-400'
                          }`}>
                            {room.title}
                          </div>
                          <div className={`text-xs mt-1 ${
                            isActive ? 'text-emerald-300' : 'text-gray-500'
                          }`}>
                            {formatDate(room.updated_at)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Bottom Fixed Content - 하단 고정 영역 */}
        {!isSidebarCollapsed && !isChatMode && !showAnalysis && (
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
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
        )}

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
                onClick={() => {
                  setIsMobileSidebarOpen(true)
                  // 모바일 분석 결과 모달이 열려있다면 닫기
                  if (isMobileResultsOpen) {
                    setIsMobileResultsOpen(false)
                  }
                }}
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
                    <SelectTrigger className="w-32 md:w-48">
                      <SelectValue placeholder="모델 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o-mini">
                        <div className="flex items-center w-full">
                          <span>gpt-4o-mini</span>
                          <div className="flex items-center space-x-1 ml-auto">
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">
                              FREE
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt-4o">
                        <div className="flex items-center w-full">
                          <span>gpt-4o</span>
                          <div className="flex items-center space-x-1 ml-auto">
                            <Crown className="w-3 h-3 text-amber-500" />
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt-4.1">
                        <div className="flex items-center w-full">
                          <span>gpt-4.1</span>
                          <div className="flex items-center space-x-1 ml-auto">
                            <Crown className="w-3 h-3 text-amber-500" />
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {isNewUser && (
                    <div className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg px-2 py-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-emerald-700">신규 3일 무료!</span>
                    </div>
                  )}
                  
                  {/* 모바일 분석 결과 보기 버튼 */}
                  {(analysisData || isAnalyzing) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMobileResultsOpen(true)}
                      className="md:hidden flex items-center space-x-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="text-xs">결과보기</span>
                    </Button>
                  )}
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
                        onClick={toggleProfileDropdown}
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
                              onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleLogout()
                              }}
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
                    onClick={toggleProfileDropdown}
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
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleLogout()
                          }}
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
        <div className="flex-1 flex overflow-hidden">
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
                        AI 의료 문서 해석
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
              onRoomIdReceived={updateUrlWithRoomId}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isNewUser={isNewUser}
            />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="flex-1 flex flex-col bg-white h-full min-h-0 overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto pt-2 pb-40 md:pb-4 md:pt-4" ref={chatContainerRef}>
                <div className="space-y-4 md:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-start space-x-3 md:space-x-4 max-w-[85%] md:max-w-3xl ${
                          message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ml-2 md:ml-4">
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
                          <div className="text-xs md:text-sm">
                            {message.role === "user" ? (
                              <div className="whitespace-pre-wrap">{message.content}</div>
                            ) : (
                              renderMarkdown(message.content)
                            )}
                          </div>
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
                      <div className="flex items-start space-x-3 md:space-x-4 max-w-[85%] md:max-w-3xl">
                        <div className="w-6 md:w-8 h-6 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ml-2 md:ml-4">
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
              <div className="border-t p-2 md:p-4 bg-white flex-shrink-0 md:static fixed bottom-0 left-0 right-0 z-20">
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
                      또닥 AI는 의료 전문가의 진단을 대체할 수 없습니다. 정확한 진단을 위해서는 의료진과 상담하세요.
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
                      {analysisData ? (
                        <AnalysisResults
                          isAnalyzing={isAnalyzing}
                          analysisData={analysisData}
                          hasError={!!analysisError}
                          errorMessage={analysisError || undefined}
                          progress={analysisProgress}
                          onTextDragToChat={handleTextDragToChat}
                        />
                      ) : isChatMode ? (
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


"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Camera, Loader2, AlertCircle, Info, Shield, Play, X, Crown, HelpCircle } from "lucide-react"
import { useApiRequest, useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { loadAd, trackAdImpression, trackAdClick, type AdData } from "@/lib/ad-service"

interface ImageUploadSectionProps {
  onAnalysisStart: () => void
  onAnalysisResult: (data: string, tokenCount?: number, progress?: number) => void
  onAnalysisComplete: () => void
  onError: (error: string) => void
  onStatusUpdate?: (status: string, type?: 'info' | 'warning' | 'error' | 'success') => void
  onRoomIdReceived?: (roomId: string) => void
  selectedModel?: string
  onModelChange?: (model: string) => void
  isNewUser?: boolean
}



export default function ImageUploadSection({ 
  onAnalysisStart, 
  onAnalysisResult, 
  onAnalysisComplete, 
  onError, 
  onStatusUpdate,
  onRoomIdReceived,
  selectedModel = "gpt-4o-mini",
  onModelChange,
  isNewUser = false
}: ImageUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState<{
    isReached: boolean
    message: string
    currentCount: number
    limit: number
  } | null>(null)
  const [limitBypass, setLimitBypass] = useState(false)

  const [showAdModal, setShowAdModal] = useState(false)
  const [pendingModel, setPendingModel] = useState<string>("")
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [adWatchTime, setAdWatchTime] = useState(0)
  const [currentAd, setCurrentAd] = useState<AdData | null>(null)
  const [isLoadingAd, setIsLoadingAd] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { apiRequest } = useApiRequest()
  const { token, user } = useAuth()
  const router = useRouter()
  
  // API URL 환경변수 설정
  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

  // 인증 체크 함수
  const checkAuthentication = (): boolean => {
    const currentToken = token || localStorage.getItem('auth_token')
    
    if (!currentToken) {
      // 토큰이 없으면 로그인 페이지로 리다이렉트
      router.push('/login?error=auth_required&message=파일 업로드를 위해 로그인이 필요합니다')
      return false
    }
    
    return true
  }





  // 파일 크기 검증 (5MB = 5 * 1024 * 1024 bytes)
  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (file.size > maxSize) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.')
      return false
    }
    
    // 기본 타입 검증
    const defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!defaultAllowedTypes.includes(file.type)) {
      setError('JPG, PNG, PDF 파일만 업로드 가능합니다.')
      return false
    }
    
    return true
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 인증 체크 - 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!checkAuthentication()) {
      return
    }

    setError(null)
    
    if (!validateFile(file)) {
      return
    }

    // 채팅방 개수 제한 확인 (제한 우회 상태가 아니고 신규 사용자가 아닐 때만)
    if (!limitBypass && !isNewUser) {
      try {
        const limitResponse = await apiRequest('/api/medical/check-analysis-limit', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!limitResponse.ok) {
          throw new Error('채팅방 개수 제한 확인 실패')
        }

        const limitData = await limitResponse.json()
        
        if (!limitData.success || !limitData.data.canCreateAnalysis) {
          // 채팅방 생성 불가능한 경우 - 프리미엄 유도 UI 표시
          setLimitReached({
            isReached: true,
            message: limitData.data.message || '채팅방 생성 제한에 도달했습니다.',
            currentCount: limitData.data.currentCount || 0,
            limit: limitData.data.limit || 3
          })
          return
        }
      } catch (error) {
        // 제한 확인 API 실패 시에도 에러 처리
        const errorMessage = error instanceof Error ? error.message : '채팅방 개수 제한 확인 중 오류가 발생했습니다.'
        setError(errorMessage)
        onError(errorMessage)
        return
      }
    }

    setIsUploading(true)
    setUploadedFile(file)
    onAnalysisStart()

    try {
      // FormData로 파일 및 선택 모델 준비 (서버에서 'medicalFile', 'model' 필드 사용)
      const formData = new FormData()
      formData.append('medicalFile', file)
      formData.append('model', selectedModel)

      // Authorization 헤더를 포함한 파일 업로드 및 SSE 연결 시작
      const response = await apiRequest('/api/medical/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          // FormData일 때는 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
        }
      })

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status} ${response.statusText}`)
      }

      // SSE 응답이므로 즉시 스트림 연결 시작
      startSSEConnection(response)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      setError(errorMessage)
      onError(errorMessage)
      setIsUploading(false)
    }
  }

  const startSSEConnection = (response: Response) => {
    if (!response.body) {
      setError('SSE 스트림을 받을 수 없습니다.')
      onError('SSE 스트림을 받을 수 없습니다.')
      setIsUploading(false)
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let accumulatedText = ''
    let buffer = '' // 불완전한 JSON 데이터를 위한 버퍼

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            setIsUploading(false)
            onAnalysisComplete()
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk // 버퍼에 청크 추가
          
          // 완전한 라인들을 처리
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 마지막 불완전한 라인은 버퍼에 보관

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                
                switch (data.type) {
                  case 'connected':
                    onStatusUpdate?.(data.message, 'info')
                    break
                    
                  case 'status':
                    onStatusUpdate?.(data.message, 'info')
                    // roomId가 있으면 URL 업데이트
                    if (data.roomId && onRoomIdReceived) {
                      onRoomIdReceived(data.roomId)
                    }
                    break
                    
                  case 'chunk':
                    // 실시간 텍스트 청크 - 서버에서 부분 텍스트를 보내는 경우
                    if (data.content) {
                      const newContent = data.content
                      accumulatedText += newContent
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    // 서버에서 누적된 전체 텍스트를 보내는 경우
                    else if (data.accumulated) {
                      accumulatedText = data.accumulated
                      console.log('📥 SSE accumulated 수신:', data.accumulated.length, '자')
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    break
                    
                  case 'progress':
                    // 진행 상황과 함께 텍스트 추가
                    
                    // 서버에서 accumulated 필드로 전체 누적 텍스트를 보내는 경우 (우선 처리)
                    if (data.accumulated) {
                      accumulatedText = data.accumulated
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    // accumulated가 없고 content만 있는 경우
                    else if (data.content) {
                      const newContent = data.content
                      accumulatedText += (accumulatedText ? '\n' : '') + newContent
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    } 
                    // 둘 다 없으면 진행률만 업데이트
                    else {
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    break
                    
                  case 'complete':
                    // 최종 결과 처리
                    if (data.result) {
                      if (data.result.format === 'text') {
                        accumulatedText = data.result.analysis
                        onAnalysisResult(accumulatedText, undefined, 100)
                      } else {
                        onAnalysisResult(accumulatedText, undefined, 100)
                      }
                    } else if (data.content) {
                      accumulatedText += (accumulatedText ? '\n' : '') + data.content
                      onAnalysisResult(accumulatedText, undefined, 100)
                    }
                    
                    setIsUploading(false)
                    onAnalysisComplete()
                    onStatusUpdate?.(data.message || '분석이 완료되었습니다.', 'success')
                    return
                    
                  case 'error':
                    throw new Error(data.message || '분석 중 오류가 발생했습니다.')
                    
                  case 'warning':
                    onStatusUpdate?.(data.message, 'warning')
                    break
                    
                                  default:
                  // 알 수 없는 타입이지만 content가 있다면 처리
                  if (data.content) {
                    accumulatedText += (accumulatedText ? '\n' : '') + data.content
                    onAnalysisResult(accumulatedText, undefined, data.progress || 0)
                  }
                  break
                }
              } catch (parseError) {
                // JSON 파싱이 실패한 경우, 단순 텍스트로 간주하여 실시간 누적
                const plainText = line.startsWith('data: ') ? line.slice(6) : line
                accumulatedText += plainText
                onAnalysisResult(accumulatedText)
              }
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'SSE 연결 중 오류가 발생했습니다.'
        setError(errorMessage)
        onError(errorMessage)
        setIsUploading(false)
      }

      setIsUploading(false)
      onAnalysisComplete()
    }

    readStream()
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files[0]) {
      // 인증 체크 - 토큰이 없으면 로그인 페이지로 리다이렉트
      if (!checkAuthentication()) {
        return
      }
      
      // 가상의 input 이벤트 생성
      const mockEvent = {
        target: { files: [files[0]] }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(mockEvent)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setError(null)
    setLimitReached(null)
    setLimitBypass(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getAcceptTypes = () => {
    return '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
  }

  const getFileExtensions = () => {
    return '.jpg,.jpeg,.png,.pdf'
  }

  // 모델 변경 핸들러
  const handleModelChange = async (newModel: string) => {
    if (newModel !== "gpt-4o-mini") {
      // 신규 사용자(가입 후 3일 이내)는 프리미엄 모델 무료 사용
      if (isNewUser) {
        onModelChange?.(newModel)
        return
      }
      
      // 기존 사용자는 광고 로딩 및 시청 확인
      setPendingModel(newModel)
      setIsLoadingAd(true)
      
      try {
        // 실제 광고 데이터 로딩
        const adData = await loadAd()
        setCurrentAd(adData)
        
        // 광고 노출 추적
        trackAdImpression(adData.id, newModel)
        
        setShowAdModal(true)
      } catch (error) {
        console.error('광고 로딩 실패:', error)
        // 광고 로딩 실패 시 무료로 모델 변경 허용
        onModelChange?.(newModel)
      } finally {
        setIsLoadingAd(false)
      }
    } else {
      // gpt-4o-mini는 바로 적용
      onModelChange?.(newModel)
    }
  }

  // 광고 시청 시작
  const startWatchingAd = () => {
    setIsWatchingAd(true)
    setAdWatchTime(0)
    
    // 15초 광고 타이머
    const timer = setInterval(() => {
      setAdWatchTime(prev => {
        if (prev >= 14) {
          clearInterval(timer)
          setIsWatchingAd(false)
          setShowAdModal(false)
          // 상태 변경을 다음 이벤트 루프로 연기
          setTimeout(() => {
            onModelChange?.(pendingModel)
          }, 0)
          return 15
        }
        return prev + 1
      })
    }, 1000)
  }

  // 광고 건너뛰기 (모델 변경 취소)
  const skipAd = () => {
    setShowAdModal(false)
    setPendingModel("")
    setIsWatchingAd(false)
    setAdWatchTime(0)
    setCurrentAd(null)
  }

  return (
    <div className="w-full">
      {/* Upload Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Content */}
        <div className="p-6">
          {/* GPT 모델 선택 */}
          {!uploadedFile && !isUploading && onModelChange && (
            <div className="mb-6">
              <div className="flex items-center justify-end space-x-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  분석 모델 선택
                </label>
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-48 bg-white border-gray-300">
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
              </div>
            </div>
          )}

          <div 
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${limitReached ? 'border-amber-300 bg-amber-50' :
                  error ? 'border-red-300 bg-red-50' : 
                  isUploading ? 'border-emerald-300 bg-emerald-50' :
                  uploadedFile ? 'border-green-300 bg-green-50' :
                  'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
                                                     {limitReached ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-semibold text-amber-700 mb-1">
                      채팅방 생성 제한 도달
                    </h3>
                    <p className="text-sm text-amber-600 mb-2">
                      무료 사용자는 최대 {limitReached.limit}개의 채팅방만 생성할 수 있습니다.
                    </p>
                    <p className="text-xs text-amber-500 mb-3">
                      현재 {limitReached.currentCount}개 사용 중
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-700 font-medium">
                        💡 30초 광고 시청으로 추가 분석 가능!
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                                         <Button
                       onClick={() => {
                         setLimitReached(null)
                         setLimitBypass(true)
                       }}
                       className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2"
                     >
                       OK - 분석 계속하기
                     </Button>
                    <Button
                      variant="outline"
                      onClick={resetUpload}
                      className="border-amber-300 text-amber-600 hover:bg-amber-50"
                    >
                      취소
                    </Button>
                  </div>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-red-700 mb-1">업로드 오류</h3>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUpload}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    다시 시도
                  </Button>
                </div>
              ) : isUploading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                    </div>
                    <div className="absolute -inset-1 border-2 border-emerald-200 rounded-xl animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-emerald-700 mb-1">분석 진행 중</h3>
                    <p className="text-sm text-emerald-600 mb-1">AI가 파일을 분석하고 있습니다...</p>
                    <p className="text-xs text-emerald-500">실시간으로 분석 결과가 표시됩니다</p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-green-700 mb-1">업로드 완료</h3>
                    <p className="text-sm text-green-600 font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-green-500">
                      크기: {(uploadedFile.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetUpload}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    다른 파일 업로드
                  </Button>
                </div>
                          ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 md:block hidden">
                      파일을 여기에 드래그하거나 클릭하여 업로드
                    </h3>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 md:hidden block">
                      파일 업로드
                    </h3>
                    
                    {/* Supported File Types */}
                    <div className="flex justify-center space-x-3 mb-4">
                      <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">PDF</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                          <Camera className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">JPG</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-white rounded-lg px-2 py-1 shadow-sm">
                        <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                          <Camera className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">PNG</span>
                      </div>
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept={getAcceptTypes()}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      onClick={() => {
                        // 인증 체크 - 토큰이 없으면 로그인 페이지로 리다이렉트
                        if (!checkAuthentication()) {
                          return
                        }
                        fileInputRef.current?.click()
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      파일 선택하기
                    </Button>
                    
                    {/* 파일 품질 안내 툴팁 */}
                    <div className="relative group">
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                          <div className="space-y-1">
                            <div className="font-medium">📸 파일 품질 안내</div>
                            <div>• 텍스트가 선명하고 잘 보이는 이미지</div>
                            <div>• 흐릿하거나 글씨가 작으면 인식 어려움</div>
                            <div>• 밝은 조명, 그림자 없는 환경에서 촬영</div>
                          </div>
                          {/* 툴팁 화살표 */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 mb-1">
                  🔒 개인정보 보호 안내
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  업로드된 문서 파일은 <strong>서버에 저장되지 않으며</strong>, 해석 완료 후 즉시 삭제됩니다. <br />
                <span className="text-sm text-yellow-700 block mt-2">※ 본 서비스는 교육 및 정보 제공 목적이며, 의료 진단을 대체하지 않습니다.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 광고 시청 모달 */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  프리미엄 모델 사용
                </h3>
                <button
                  onClick={skipAd}
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
                  <strong>{pendingModel}</strong> 모델을 사용하려면
                </p>
                <p className="text-sm text-gray-500">
                  15초 광고를 시청해주세요
                </p>
              </div>

              {!isWatchingAd ? (
                <div className="space-y-3">
                  <Button
                    onClick={startWatchingAd}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    광고 보고 사용하기
                  </Button>
                  <Button
                    onClick={skipAd}
                    variant="outline"
                    className="w-full"
                  >
                    취소
                  </Button>
                </div>
              ) : (
                                 <div className="space-y-4">
                   {/* 실제 광고 데이터 표시 */}
                   {currentAd && (
                     <div 
                       className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg text-center cursor-pointer hover:opacity-90 transition-opacity"
                       onClick={() => {
                         // 광고 클릭 추적
                         trackAdClick(currentAd.id, pendingModel)
                         // 실제 환경에서는 광고 URL로 이동
                         window.open(currentAd.clickUrl, '_blank')
                       }}
                     >
                       <h4 className="font-bold text-lg mb-2">{currentAd.title}</h4>
                       <p className="text-sm mb-3">{currentAd.description}</p>
                       {currentAd.price && (
                         <div className="bg-white/20 rounded-lg p-2">
                           <p className="text-xs">특가 {currentAd.price}</p>
                         </div>
                       )}
                       <p className="text-xs mt-2 opacity-75">클릭하여 자세히 보기</p>
                     </div>
                   )}
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {15 - adWatchTime}초
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(adWatchTime / 15) * 100}%` }}
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

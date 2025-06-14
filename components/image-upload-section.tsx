"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Camera, Loader2, AlertCircle, Info, Shield } from "lucide-react"
import { useApiRequest, useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface ImageUploadSectionProps {
  onAnalysisStart: () => void
  onAnalysisResult: (data: string, tokenCount?: number, progress?: number) => void
  onAnalysisComplete: () => void
  onError: (error: string) => void
  onStatusUpdate?: (status: string, type?: 'info' | 'warning' | 'error' | 'success') => void
}

interface SupportedFormat {
  extension: string
  mimeType: string
  description: string
  maxSize: number
}

export default function ImageUploadSection({ 
  onAnalysisStart, 
  onAnalysisResult, 
  onAnalysisComplete, 
  onError, 
  onStatusUpdate 
}: ImageUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [supportedFormats, setSupportedFormats] = useState<SupportedFormat[]>([])
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

  // 지원 형식 조회
  useEffect(() => {
    fetchSupportedFormats()
  }, [])

  const fetchSupportedFormats = async () => {
    try {
      const response = await apiRequest('/api/medical/supported-formats')
      if (response.ok) {
        const data = await response.json()
        // 응답이 배열인지 확인
        if (Array.isArray(data)) {
          setSupportedFormats(data)
        } else {
          console.warn('지원 형식 응답이 배열이 아닙니다:', data)
          setDefaultFormats()
        }
      } else {
        console.warn('지원 형식 조회 실패:', response.status)
        setDefaultFormats()
      }
    } catch (error) {
      console.error('지원 형식 조회 실패:', error)
      setDefaultFormats()
    }
  }

  const setDefaultFormats = () => {
    // 기본값 설정
    setSupportedFormats([
      { extension: 'JPG', mimeType: 'image/jpeg', description: '처방전', maxSize: 5 * 1024 * 1024 },
      { extension: 'PNG', mimeType: 'image/png', description: '검사 결과지', maxSize: 5 * 1024 * 1024 },
      { extension: 'PDF', mimeType: 'application/pdf', description: '진단서', maxSize: 5 * 1024 * 1024 }
    ])
  }

  // 파일 크기 검증 (5MB = 5 * 1024 * 1024 bytes)
  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (file.size > maxSize) {
      setError('파일 크기는 5MB를 초과할 수 없습니다.')
      return false
    }
    
    // supportedFormats가 유효한 배열인지 확인
    if (supportedFormats && Array.isArray(supportedFormats) && supportedFormats.length > 0) {
      const allowedTypes = supportedFormats.map(format => format.mimeType)
      if (!allowedTypes.includes(file.type)) {
        const supportedExtensions = supportedFormats.map(f => f.extension).join(', ')
        setError(`${supportedExtensions} 파일만 업로드 가능합니다.`)
        return false
      }
    } else {
      // 기본 타입 검증
      const defaultAllowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!defaultAllowedTypes.includes(file.type)) {
        setError('JPG, PNG, PDF 파일만 업로드 가능합니다.')
        return false
      }
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

    setIsUploading(true)
    setUploadedFile(file)
    onAnalysisStart()

    try {
      // FormData로 파일 준비 (서버에서 'medicalFile' 필드명 사용)
      const formData = new FormData()
      formData.append('medicalFile', file)

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
      console.error('업로드 오류:', error)
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

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('SSE 스트림 완료')
            setIsUploading(false)
            onAnalysisComplete()
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                console.log('SSE 데이터 수신:', data.type, data)
                
                switch (data.type) {
                  case 'connected':
                    console.log('분석 스트림 연결됨:', data.message)
                    onStatusUpdate?.(data.message, 'info')
                    break
                    
                  case 'status':
                    console.log('상태 업데이트:', data.message)
                    onStatusUpdate?.(data.message, 'info')
                    break
                    
                  case 'chunk':
                    // 실시간 텍스트 청크 - 서버에서 부분 텍스트를 보내는 경우
                    if (data.content) {
                      accumulatedText += data.content
                      console.log('텍스트 청크 추가:', data.content)
                      console.log('누적된 텍스트 길이:', accumulatedText.length)
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    // 서버에서 누적된 전체 텍스트를 보내는 경우
                    else if (data.accumulated) {
                      accumulatedText = data.accumulated
                      console.log('누적 텍스트 업데이트:', accumulatedText.length)
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    }
                    break
                    
                  case 'progress':
                    // 진행 상황과 함께 텍스트 추가
                    if (data.content) {
                      // 새로운 내용이 있으면 누적
                      accumulatedText += (accumulatedText ? '\n' : '') + data.content
                      console.log('진행 상황 텍스트 추가:', data.content)
                      console.log('현재 누적 텍스트:', accumulatedText.substring(0, 100) + '...')
                      onAnalysisResult(accumulatedText, undefined, data.progress)
                    } else {
                      // 텍스트 없이 진행률만 업데이트
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
                    
                    console.log('분석 완료, 최종 텍스트 길이:', accumulatedText.length)
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
                    console.log('알 수 없는 SSE 이벤트:', data.type, data)
                    break
                }
              } catch (parseError) {
                console.warn('SSE 데이터 파싱 실패:', parseError, line)
              }
            }
          }
        }
      } catch (error) {
        console.error('SSE 스트림 읽기 오류:', error)
        const errorMessage = error instanceof Error ? error.message : 'SSE 연결 중 오류가 발생했습니다.'
        setError(errorMessage)
        onError(errorMessage)
        setIsUploading(false)
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getAcceptTypes = () => {
    if (!supportedFormats || !Array.isArray(supportedFormats) || supportedFormats.length === 0) {
      return '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
    }
    return supportedFormats.map(format => format.mimeType).join(',')
  }

  const getFileExtensions = () => {
    if (!supportedFormats || !Array.isArray(supportedFormats) || supportedFormats.length === 0) {
      return '.jpg,.jpeg,.png,.pdf'
    }
    return supportedFormats.map(format => `.${format.extension.toLowerCase()}`).join(',')
  }

  return (
    <div className="w-full">
      {/* Upload Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Content */}
        <div className="p-6">
                      <div 
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${error ? 'border-red-300 bg-red-50' : 
                  isUploading ? 'border-emerald-300 bg-emerald-50' :
                  uploadedFile ? 'border-green-300 bg-green-50' :
                  'border-gray-300 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/50'
                }
              `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
                          {error ? (
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
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      파일을 여기에 드래그하거나 클릭하여 업로드
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
                  업로드된 진료 기록은 <strong>서버에 저장되지 않으며</strong>, 분석 완료 후 즉시 삭제됩니다. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, AlertCircle, CheckCircle, ExternalLink, Brain, Clock, Loader2, Activity, Download, Share, Calendar, Shield, MessageSquare, Stethoscope, ClipboardList, AlertTriangle, Target, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
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
  const [lastRenderedLength, setLastRenderedLength] = useState(0)

  // 텍스트 드래그 훅 사용
  const { 
    isDragging, 
    selectedText, 
    labelPosition, 
    showLabel,
    isMobile, 
    textDragHandlers, 
    onLabelClick, 
    clearSelection 
  } = useTextDrag({
    onTextSelected: (text: string) => {
      // 텍스트 선택 시에는 아직 채팅에 추가하지 않음 (라벨 클릭 시에만 추가)
    },
    onTextCleared: () => {
      // 텍스트 선택 해제
    },
    onTextDragToChat: onTextDragToChat
  })

  // 실시간 렌더링 최적화 - 새로운 컨텐츠가 추가될 때마다 애니메이션 트리거
  useEffect(() => {
    if (analysisData && analysisData.length > lastRenderedLength) {
      console.log('🔄 분석 결과 업데이트:', {
        이전길이: lastRenderedLength,
        현재길이: analysisData.length,
        신규내용: analysisData.slice(lastRenderedLength)
      })
      
      // 새로운 컨텐츠가 추가되었을 때
      setLastRenderedLength(analysisData.length)
    }
  }, [analysisData, isAnalyzing, lastRenderedLength])

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
      // JSON 파싱 실패, 일반 텍스트로 처리
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
              level === 1 ? 'text-xl text-gray-900' :
              level === 2 ? 'text-lg text-gray-800' :
              level === 3 ? 'text-base text-gray-800' :
              'text-sm text-gray-700'
            }`}
          >
            {processInlineMarkdown(headerText)}
          </HeaderTag>
        )
        i++
        continue
      }
      
      // 리스트 처리 (- * +)
      if (/^[-*+]\s/.test(line)) {
        const listItems: JSX.Element[] = []
        let j = i
        
        while (j < lines.length && /^[-*+]\s/.test(lines[j].trim())) {
          const itemText = lines[j].trim().replace(/^[-*+]\s/, '')
          
          // 체크박스 리스트 처리
          if (itemText.startsWith('[ ]') || itemText.startsWith('[x]') || itemText.startsWith('[X]')) {
            const isChecked = itemText.startsWith('[x]') || itemText.startsWith('[X]')
            const checkboxText = itemText.replace(/^\[[ xX]\]\s/, '')
            
            listItems.push(
              <li key={`li-${j}`} className="task-list-item ml-4 mb-1 flex items-start">
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
            listItems.push(
              <li key={`li-${j}`} className="ml-4 mb-1">
                {processInlineMarkdown(itemText)}
              </li>
            )
          }
          j++
        }
        
        elements.push(
          <ul key={`ul-${i}`} className="list-disc ml-4 mb-3">
            {listItems}
          </ul>
        )
        i = j
        continue
      }
      
      // 숫자 리스트 처리 (1. 2. 3.)
      if (/^\d+\.\s/.test(line)) {
        const listItems: JSX.Element[] = []
        let j = i
        
        while (j < lines.length && /^\d+\.\s/.test(lines[j].trim())) {
          const itemText = lines[j].trim().replace(/^\d+\.\s/, '')
          listItems.push(
            <li key={`oli-${j}`} className="ml-4 mb-1">
              {processInlineMarkdown(itemText)}
            </li>
          )
          j++
        }
        
        elements.push(
          <ol key={`ol-${i}`} className="list-decimal ml-4 mb-3">
            {listItems}
          </ol>
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
            className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50 mb-3 italic text-gray-700"
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
          <hr key={`hr-${i}`} className="border-t border-gray-300 my-6" />
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
                  <th key={`th-${j}-${cellIndex}`} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold text-left">
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
                  <td key={`td-${j}-${cellIndex}`} className="border border-gray-300 px-4 py-2">
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
            <table key={`table-${i}`} className="w-full border-collapse border border-gray-300 mb-4">
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
            className="bg-gray-100 p-4 rounded-lg mb-3 overflow-x-auto"
          >
            <code className="text-sm font-mono text-gray-800">
              {codeLines.join('\n')}
            </code>
          </pre>
        )
        i++ // 종료 ``` 다음으로
        continue
      }
      
      // 일반 문단 처리
      elements.push(
        <p key={`p-${i}`} className="mb-3 leading-relaxed text-gray-800">
          {processInlineMarkdown(line)}
        </p>
      )
      i++
    }
    
    return <div className="markdown-content">{elements}</div>
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

  if (hasError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <CardTitle className="text-red-700">해석 오류 발생</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              문서 해석 중 오류가 발생했습니다: {errorMessage}
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ※ 본 서비스는 교육 및 정보 제공 목적입니다. 정확한 의료 정보는 의료진과 상담하시기 바랍니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-emerald-500 animate-pulse" />
              <CardTitle className="text-emerald-700">AI가 문서를 해석하고 있습니다</CardTitle>
            </div>
            <div className="text-sm text-gray-500">{Math.round(progress)}%</div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-gray-600 mb-4">문서를 해석하고 있습니다...</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ※ 본 해석 결과는 교육 및 정보 제공 목적이며, 의료 진단을 대체하지 않습니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 일반 텍스트 렌더링 (기존 방식)
  const renderPlainText = (data: string) => (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        {/* 드래그 안내 문구 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-700">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium">
                {isMobile 
                  ? "텍스트를 길게 눌러 선택한 후 'Add to Chat' 버튼을 눌러주세요" 
                  : "텍스트를 드래그하거나 더블클릭한 후 'Add to Chat' 라벨을 클릭하여 채팅창에 입력하세요"
                }
              </span>
            </div>
          </div>
        </div>
        
        <div 
          ref={streamingRef}
          className="bg-white rounded-b-lg p-6 analysis-content relative"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'text'
          }}
          {...textDragHandlers}
        >
          <div className="prose prose-gray max-w-none">
            <div 
              className="text-gray-800 leading-relaxed text-sm select-text"
            >
              {renderMarkdown(data)}
              {/* 실시간 분석 중일 때 타이핑 커서 표시 */}
              {isAnalyzing && data && (
                <span className="inline-block w-0.5 h-4 bg-emerald-500 typing-cursor ml-1 align-middle"></span>
              )}
            </div>
            
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-gray-600 mt-4 pt-3 border-t border-gray-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {progress > 0 ? `분석 진행 중... ${progress}%` : '분석이 계속 진행 중입니다...'}
                </span>
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
              {isMobile 
                ? "텍스트를 길게 눌러 선택한 후 'Add to Chat' 버튼을 눌러주세요" 
                : "텍스트를 드래그하거나 더블클릭한 후 'Add to Chat' 라벨을 클릭하여 채팅창에 입력하세요"
              }
            </span>
          </div>
        </div>
      )}

      {/* 분석 상태 표시 - 분석 데이터가 없을 때만 표시 */}
      {isAnalyzing && !analysisData && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-emerald-50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 분석 시작</h3>
                            <p className="text-gray-600 mb-4">진료 기록을 분석하고 있습니다...</p>
            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            {progress > 0 && (
              <p className="text-sm text-gray-500 mt-2">{progress}% 완료</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 분석 결과 렌더링 */}
      {analysisData && (
        renderPlainText(analysisData)
      )}

      {/* To Chat 라벨 */}
      {showLabel && selectedText && labelPosition && (
        <div 
          className={`text-drag-label fixed z-50 bg-emerald-600 text-white rounded-lg shadow-lg cursor-pointer hover:bg-emerald-700 transition-all duration-200 transform ${
            isMobile 
              ? 'px-4 py-3 scale-100 hover:scale-105 active:scale-95' // 모바일에서는 더 크게
              : 'px-3 py-2 scale-95 hover:scale-100'
          }`}
          style={{
            left: isMobile 
              ? Math.max(10, Math.min(labelPosition.x - 75, window.innerWidth - 160)) // 모바일에서는 화면 경계 고려
              : labelPosition.x - 50,
            top: isMobile 
              ? Math.max(10, labelPosition.y - 70) // 모바일에서는 상단 여백 고려
              : labelPosition.y - 60,
          }}
          onClick={onLabelClick}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onTouchStart={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-2'}`}>
            <MessageSquare className={isMobile ? "w-5 h-5" : "w-4 h-4"} />
            <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium`}>
              {isMobile ? '채팅에 추가' : 'Add to Chat'}
            </span>
          </div>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-emerald-600 rotate-45"></div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-500" />
            <CardTitle className="text-emerald-700">문서 해석 결과</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              결과 저장
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>
        <CardDescription>
          AI가 해석한 의료 문서 내용입니다. 참고용으로 활용하시기 바랍니다.
        </CardDescription>
      </CardHeader>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">⚠️ 중요 안내사항</p>
            <p>본 해석 결과는 교육 및 정보 제공 목적이며, 의료 진단이나 치료를 대체할 수 없습니다. 정확한 진단 및 치료를 위해서는 반드시 의료진과 상담하시기 바랍니다.</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ※ 위 해석 결과는 AI에 의한 참고 정보입니다. 정확한 의료 정보는 의료진과 상담하시기 바랍니다.
        </p>
      </div>
    </div>
  )
}

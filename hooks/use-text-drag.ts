import { useCallback, useRef, useState, useEffect } from 'react'

interface UseTextDragOptions {
  onTextSelected?: (text: string, position: { x: number; y: number }) => void
  onTextCleared?: () => void
  onTextDragToChat?: (text: string) => void
}

export const useTextDrag = (options: UseTextDragOptions = {}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [labelPosition, setLabelPosition] = useState<{ x: number; y: number } | null>(null)
  const [showLabel, setShowLabel] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 모바일 디바이스 감지
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    }
    setIsMobile(checkMobile())
  }, [])

  // 상태 변화 디버깅
  useEffect(() => {
  
  }, [isDragging, selectedText, labelPosition, showLabel])
  const startPositionRef = useRef<{ x: number; y: number } | null>(null)
  const selectionRef = useRef<Selection | null>(null)
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    // 우클릭이나 다른 버튼 클릭은 무시
    if (event.button !== 0) return
    
    startPositionRef.current = { x: event.clientX, y: event.clientY }
    setIsDragging(false)
    setSelectedText('')
    setShowLabel(false)
    setLabelPosition(null)
  }, [])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    // 드래그 중인지 확인
    if (startPositionRef.current) {
      const deltaX = Math.abs(event.clientX - startPositionRef.current.x)
      const deltaY = Math.abs(event.clientY - startPositionRef.current.y)
      
      // 최소 드래그 거리 확인 (10px로 증가하여 더 정확한 드래그 감지)
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true)
        
        // 기존 타이머 제거
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current)
        }
        
        // 짧은 지연 후 텍스트 확인 (드래그 중 텍스트 선택이 완료될 시간 제공)
        dragTimeoutRef.current = setTimeout(() => {
          const selection = window.getSelection()
          if (selection && selection.toString().trim()) {
            const draggedText = selection.toString().trim()
            // 최소 텍스트 길이 확인 (3자 이상)
            if (draggedText.length >= 3) {
              setSelectedText(draggedText)
              selectionRef.current = selection
            }
          }
        }, 50)
      }
    }
  }, [isDragging])

  const handleMouseUp = useCallback((event: React.MouseEvent) => {
    // 타이머 정리
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current)
      dragTimeoutRef.current = null
    }
    
    // 드래그가 끝난 후 잠시 기다렸다가 최종 선택된 텍스트 확인
    setTimeout(() => {
      const selection = window.getSelection()
      const finalText = selection && selection.toString().trim()
      
      if (isDragging && finalText && finalText.length >= 3) {
        // 선택된 텍스트와 마우스 위치 저장
        setSelectedText(finalText)
        setLabelPosition({ x: event.clientX, y: event.clientY })
        setShowLabel(true) // 즉시 라벨 표시
        
        
        // 콜백 호출
        if (options.onTextSelected) {
          options.onTextSelected(finalText, { x: event.clientX, y: event.clientY })
        }
        
        selectionRef.current = selection
      }
      
      // 드래그 상태만 초기화
      setIsDragging(false)
      startPositionRef.current = null
    }, 100)
  }, [isDragging, options])

  // 더블 클릭으로 텍스트 선택
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim()
      
      if (selectedText.length >= 3) {
        
        setSelectedText(selectedText)
        setLabelPosition({ x: event.clientX, y: event.clientY })
        setShowLabel(true) // 즉시 라벨 표시
        
        if (options.onTextSelected) {
          options.onTextSelected(selectedText, { x: event.clientX, y: event.clientY })
        }
        
        selectionRef.current = selection
      }
    }
  }, [options])

  // 모바일용 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    startPositionRef.current = { x: touch.clientX, y: touch.clientY }
    setIsDragging(false)
    setSelectedText('')
    setShowLabel(false)
    setLabelPosition(null)
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (startPositionRef.current) {
      const touch = event.touches[0]
      const deltaX = Math.abs(touch.clientX - startPositionRef.current.x)
      const deltaY = Math.abs(touch.clientY - startPositionRef.current.y)
      
      if (deltaX > 10 || deltaY > 10) {
        setIsDragging(true)
      }
    }
  }, [])

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    // 터치 종료 시 선택된 텍스트 확인
    setTimeout(() => {
      const selection = window.getSelection()
      const selectedText = selection && selection.toString().trim()
      
      if (selectedText && selectedText.length >= 3) {
        // 터치 끝 위치를 라벨 위치로 사용 (changedTouches 사용)
        const touch = event.changedTouches[0]
        setSelectedText(selectedText)
        setLabelPosition({ x: touch.clientX, y: touch.clientY })
        setShowLabel(true)
        
        if (options.onTextSelected) {
          options.onTextSelected(selectedText, { x: touch.clientX, y: touch.clientY })
        }
        
        selectionRef.current = selection
      }
      
      setIsDragging(false)
      startPositionRef.current = null
    }, 150) // 터치 종료 후 약간의 지연
  }, [options])

  // 모바일에서 텍스트 선택 변화 감지
  useEffect(() => {
    if (!isMobile) return

    const handleSelectionChange = () => {
      // 기존 타이머가 있으면 제거
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }

      // 짧은 지연 후 선택 상태 확인 (사용자가 선택을 완료할 시간 제공)
      selectionTimeoutRef.current = setTimeout(() => {
        const selection = window.getSelection()
        const currentSelectedText = selection && selection.toString().trim()
        
        if (currentSelectedText && currentSelectedText.length >= 3) {
          // 선택된 텍스트가 있으면 라벨 표시
          const range = selection?.getRangeAt(0)
          if (range) {
            const rect = range.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.bottom + 10 // 선택 영역 아래쪽에 표시
            
            setSelectedText(currentSelectedText)
            setLabelPosition({ x: centerX, y: centerY })
            setShowLabel(true)
            
            if (options.onTextSelected) {
              options.onTextSelected(currentSelectedText, { x: centerX, y: centerY })
            }
            
            selectionRef.current = selection
          }
        } else if (!currentSelectedText && selectedText) {
          // 선택이 해제되면 라벨 숨김
          setShowLabel(false)
          setTimeout(() => {
            setSelectedText('')
            setLabelPosition(null)
          }, 200)
        }
      }, 300) // 300ms 지연으로 사용자가 선택을 완료할 시간 제공
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [isMobile, selectedText, options])



  // 마우스 오버 시 라벨 표시 (라벨이 이미 표시된 경우 무시)
  const handleMouseEnter = useCallback(() => {
    if (selectedText && !showLabel) {
      setShowLabel(true)
    }
  }, [selectedText, showLabel])

  // 마우스 아웃 시 라벨 숨김 (라벨 영역이 아닌 경우에만)
  const handleMouseLeave = useCallback((event: React.MouseEvent) => {
    // 라벨 영역으로 마우스가 이동하는 경우 숨기지 않음
    const relatedTarget = event.relatedTarget as HTMLElement
    if (relatedTarget && relatedTarget.closest('.text-drag-label')) {
      return
    }
    setShowLabel(false)
  }, [])

  // 라벨 클릭 시 텍스트 전송
  const handleLabelClick = useCallback(() => {
    if (selectedText) {
      // 선택 해제
      if (selectionRef.current) {
        selectionRef.current.removeAllRanges()
      }
      
      // 텍스트를 채팅에 추가하는 콜백 호출
      if (options.onTextDragToChat) {
        options.onTextDragToChat(selectedText.trim())
      }
      
      // 상태 초기화
      setSelectedText('')
      setLabelPosition(null)
      setShowLabel(false)
      selectionRef.current = null
      
      // 텍스트 해제 콜백 호출
      if (options.onTextCleared) {
        options.onTextCleared()
      }
    }
  }, [selectedText, labelPosition, options])

  // 텍스트 선택 해제
  const clearSelection = useCallback(() => {
    if (selectionRef.current) {
      selectionRef.current.removeAllRanges()
    }
    
    setSelectedText('')
    setLabelPosition(null)
    setShowLabel(false)
    selectionRef.current = null
    
    if (options.onTextCleared) {
      options.onTextCleared()
    }
  }, [options])

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current)
      }
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current)
      }
    }
  }, [])

  return {
    isDragging,
    selectedText,
    labelPosition, // 고정된 라벨 위치 (드래그 끝 위치 또는 더블클릭 위치)
    showLabel,
    isMobile, // 모바일 여부 추가
    textDragHandlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onDoubleClick: handleDoubleClick,
      // 모바일용 터치 이벤트 핸들러 추가
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    onLabelClick: handleLabelClick,
    clearSelection,
  }
} 
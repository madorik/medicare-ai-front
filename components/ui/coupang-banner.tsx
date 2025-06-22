"use client"

import { useEffect, useRef } from "react"

interface CoupangBannerProps {
  width?: string
  height?: string
  className?: string
}

export default function CoupangBanner({ 
  width = "200", 
  height = "700", 
  className = "" 
}: CoupangBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 쿠팡 스크립트가 이미 로드되었는지 확인
    if (typeof window !== 'undefined') {
      // 스크립트가 이미 있는지 확인
      const existingScript = document.querySelector('script[src="https://ads-partners.coupang.com/g.js"]')
      
      if (!existingScript) {
        // 스크립트 추가
        const script = document.createElement('script')
        script.src = 'https://ads-partners.coupang.com/g.js'
        script.async = true
        document.head.appendChild(script)
        
        script.onload = () => {
          // 스크립트 로드 후 배너 초기화
          initializeBanner()
        }
      } else {
        // 스크립트가 이미 있으면 바로 초기화
        initializeBanner()
      }
    }
  }, [width, height])

  const initializeBanner = () => {
    if (typeof window !== 'undefined' && (window as any).PartnersCoupang && bannerRef.current) {
      // 기존 내용 제거
      bannerRef.current.innerHTML = ''
      
      // 새 배너 생성
      try {
        new (window as any).PartnersCoupang.G({
          "id": 880146,
          "template": "carousel",
          "trackingCode": "AF2969243",
          "width": width,
          "height": height,
          "tsource": ""
        })
      } catch (error) {
        console.error('쿠팡 배너 초기화 실패:', error)
      }
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="text-xs text-gray-400 mb-2">광고</div>
      <div 
        ref={bannerRef}
        className="rounded-lg overflow-hidden shadow-sm"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  )
} 
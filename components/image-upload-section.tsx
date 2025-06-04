"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, Camera, Loader2 } from "lucide-react"

export default function ImageUploadSection() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // 시뮬레이션을 위한 지연
      setTimeout(() => {
        setUploadedFile(file.name)
        setIsUploading(false)
      }, 2000)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          진료 기록 업로드
        </CardTitle>
        <CardDescription>처방전, 검사 결과지, 진단서 등의 이미지를 업로드해주세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-gray-600">파일을 분석하고 있습니다...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-green-600 font-medium">업로드 완료: {uploadedFile}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFile(null)
                  const input = document.getElementById("file-upload") as HTMLInputElement
                  if (input) input.value = ""
                }}
              >
                다른 파일 업로드
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                <p className="text-sm text-gray-500">JPG, PNG, PDF 파일 지원 (최대 10MB)</p>
              </div>
              <input
                id="file-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                파일 선택하기
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>처방전</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>검사 결과지</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>진단서</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

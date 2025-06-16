"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Star, MessageCircle, Video, Phone, User } from "lucide-react"

export default function ExpertConsultation() {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null)

  const experts = [
    {
      id: 1,
      name: "김민수 건강상담사",
      specialty: "건강 정보 상담",
      experience: "15년",
      rating: 4.9,
      reviews: 127,
      available: true,
      nextSlot: "오늘 오후 2:00",
      image: "/placeholder.svg?height=60&width=60",
      consultationTypes: ["화상 상담", "전화 상담", "채팅 상담"],
      price: "30,000원",
    },
    {
      id: 2,
      name: "이지영 영양상담사",
      specialty: "영양 정보 상담",
      experience: "12년",
      rating: 4.8,
      reviews: 89,
      available: true,
      nextSlot: "내일 오전 10:00",
      image: "/placeholder.svg?height=60&width=60",
      consultationTypes: ["화상 상담", "채팅 상담"],
      price: "25,000원",
    },
    {
      id: 3,
      name: "박준호 운동상담사",
      specialty: "운동 건강 상담",
      experience: "20년",
      rating: 5.0,
      reviews: 203,
      available: false,
      nextSlot: "내일 오후 4:00",
      image: "/placeholder.svg?height=60&width=60",
      consultationTypes: ["화상 상담", "전화 상담"],
      price: "35,000원",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">건강 정보 상담</h3>
        <p className="text-gray-600">건강 관리 전문가와 1:1 정보 상담을 받아보세요</p>
        <p className="text-sm text-gray-500 mt-2">※ 교육 및 정보 제공 목적이며, 의료 진단을 대체하지 않습니다</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 전문가 목록 */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">상담 가능한 전문가</h4>
          {experts.map((expert) => (
            <Card
              key={expert.id}
              className={`cursor-pointer transition-all ${
                selectedExpert === expert.id ? "border-emerald-500 shadow-md" : "hover:shadow-sm"
              }`}
              onClick={() => setSelectedExpert(expert.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={expert.image || "/placeholder.svg"} alt={expert.name} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{expert.name}</h5>
                      {expert.available ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">상담 가능</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          상담 중
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {expert.specialty} • {expert.experience} 경력
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{expert.rating}</span>
                        <span>({expert.reviews})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{expert.nextSlot}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {expert.consultationTypes.includes("화상 상담") && <Video className="w-4 h-4 text-gray-400" />}
                        {expert.consultationTypes.includes("전화 상담") && <Phone className="w-4 h-4 text-gray-400" />}
                        {expert.consultationTypes.includes("채팅 상담") && (
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-emerald-600">{expert.price}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 상담 예약 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>정보 상담 예약</span>
              </CardTitle>
              <CardDescription>
                {selectedExpert
                  ? `${experts.find((e) => e.id === selectedExpert)?.name}님과의 건강 정보 상담을 예약하세요`
                  : "상담사를 선택해주세요"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedExpert ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">상담 방식 선택</label>
                      <div className="grid grid-cols-1 gap-2">
                        {experts
                          .find((e) => e.id === selectedExpert)
                          ?.consultationTypes.map((type, index) => (
                            <Button key={index} variant="outline" className="justify-start">
                              {type === "화상 상담" && <Video className="w-4 h-4 mr-2" />}
                              {type === "전화 상담" && <Phone className="w-4 h-4 mr-2" />}
                              {type === "채팅 상담" && <MessageCircle className="w-4 h-4 mr-2" />}
                              {type}
                            </Button>
                          ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">예약 가능 시간</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          오늘 14:00
                        </Button>
                        <Button variant="outline" size="sm">
                          오늘 16:00
                        </Button>
                        <Button variant="outline" size="sm">
                          내일 10:00
                        </Button>
                        <Button variant="outline" size="sm">
                          내일 14:00
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">상담료</span>
                        <span className="font-medium">{experts.find((e) => e.id === selectedExpert)?.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">예상 상담 시간</span>
                        <span className="font-medium">30분</span>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800">
                          ※ 본 상담은 교육 및 정보 제공 목적이며, 의료 진단이나 치료를 대체하지 않습니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">정보 상담 예약하기</Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>건강 정보 상담사를 선택해주세요</p>
                  <p className="text-xs mt-2">교육 및 정보 제공 목적</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 상담 안내 */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">상담 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p>상담 시작 10분 전에 알림을 보내드립니다</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p>상담 내용은 안전하게 암호화되어 보호됩니다</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <p>상담 후 요약 리포트를 제공합니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

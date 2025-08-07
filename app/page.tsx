"use client"

import { useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, Search, Plus, Eye, Lock } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useKeyboardShortcuts, createCommonShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"

// 더미 데이터 구조 변경 - 작성자 정보 제거하고 템플릿 정보 추가
const posts = [
  {
    id: 1,
    title: "던전 앤 드래곤 5판 - 스톰킹의 천둥",
    summary: "레벨 1-11 캠페인의 첫 번째 세션. 파티가 고블린 소굴을 발견하고...",
    thumbnail: "/fantasy-dungeon.png",
    tags: ["D&D 5e", "캠페인", "판타지"],
    date: "2024-01-15",
    views: 245,
    isPrivate: true,
    sessionInfo: {
      rule: "Dungeons & Dragons 5th Edition",
      scenario: "스톰킹의 천둥 - 1장: 고블린 소굴",
      author: "위저드 오브 더 코스트",
      playerCount: 4,
      overview: "신참 모험가들이 마을 근처의 고블린 문제를 해결하며 첫 모험을 시작하는 이야기",
      characters: [
        {
          name: "실바나스",
          player: "민수",
          class: "엘프 로그",
          thumbnail: "/character-elf-rogue.png"
        },
        {
          name: "멜로디",
          player: "영희",
          class: "인간 바드",
          thumbnail: "/character-human-bard.png"
        },
        {
          name: "그림",
          player: "지훈",
          class: "드워프 파이터",
          thumbnail: "/character-dwarf-fighter.png"
        },
        {
          name: "핀",
          player: "수연",
          class: "하플링 위저드",
          thumbnail: "/character-halfling-wizard.png"
        }
      ],
      highlight: "황금빛 석양이 마을을 물들이던 그 저녁, 네 명의 낯선 이들이 '황금 용' 여관에서 만났다. 멜로디의 유쾌한 웃음소리가 여관을 가득 채우고, 그림의 묵직한 발걸음이 바닥을 울렸다. 실바나스는 그림자 속에서 조용히 상황을 관찰했고, 핀은 작은 손으로 마법서의 페이지를 넘기며 미소를 지었다. 운명이 그들을 하나로 엮어낸 그 순간, 아무도 이것이 전설의 시작이 될 줄은 몰랐다."
    }
  },
  {
    id: 2,
    title: "콜 오브 크툴루 - 인스머스의 그림자",
    summary: "1920년대 배경의 호러 시나리오. 조사관들이 인스머스 마을에 도착하여...",
    thumbnail: "/placeholder-f4ck1.png",
    tags: ["CoC", "호러", "1920년대"],
    date: "2024-01-12",
    views: 189,
    isPrivate: true,
    sessionInfo: {
      rule: "Call of Cthulhu 7th Edition",
      scenario: "인스머스의 그림자",
      author: "H.P. 러브크래프트 원작",
      playerCount: 3,
      overview: "1920년대 뉴잉글랜드의 어촌 마을 인스머스에서 벌어지는 기괴한 사건들을 조사하는 이야기",
      characters: [
        {
          name: "존 워커",
          player: "철수",
          class: "사립탐정",
          thumbnail: "/character-detective.png"
        },
        {
          name: "메리 화이트",
          player: "지영",
          class: "고고학자",
          thumbnail: "/character-archaeologist.png"
        },
        {
          name: "토마스 브라운",
          player: "현우",
          class: "기자",
          thumbnail: "/character-journalist.png"
        }
      ],
      highlight: "안개가 자욱한 인스머스 항구에 도착한 세 명의 조사관들. 바다에서 들려오는 기이한 소리와 마을 사람들의 시선이 그들을 따라다녔다. 존의 예리한 직감이 위험을 감지했고, 메리는 고대 유물에서 느껴지는 불길한 기운에 몸서리쳤다. 토마스는 펜을 든 손이 떨렸지만, 진실을 밝혀내야 한다는 사명감으로 마음을 다잡았다."
    }
  },
  {
    id: 3,
    title: "사이버펑크 RED - 나이트 시티의 그림자",
    summary: "2045년 나이트 시티에서 벌어지는 사이버펑크 어드벤처...",
    thumbnail: "/cyberpunk-neon-city.png",
    tags: ["Cyberpunk RED", "SF", "액션"],
    date: "2024-01-10",
    views: 156,
    isPrivate: true,
    sessionInfo: {
      rule: "Cyberpunk RED",
      scenario: "나이트 시티의 그림자",
      author: "자작 시나리오",
      playerCount: 4,
      overview: "거대 기업의 음모에 맞서는 사이버펑크들의 이야기",
      characters: [
        {
          name: "잭 실버",
          player: "태민",
          class: "솔로",
          thumbnail: "/character-solo.png"
        },
        {
          name: "네온",
          player: "하늘",
          class: "넷러너",
          thumbnail: "/character-netrunner.png"
        },
        {
          name: "크롬",
          player: "준호",
          class: "테크",
          thumbnail: "/character-tech.png"
        },
        {
          name: "바이퍼",
          player: "소영",
          class: "노마드",
          thumbnail: "/character-nomad.png"
        }
      ],
      highlight: "네온사인이 빗물에 반사되는 나이트 시티의 밤. 네 명의 아웃사이더들이 어둠 속에서 만났다. 잭의 차가운 눈빛에는 복수의 불꽃이 타올랐고, 네온의 손끝에서는 전자의 춤이 펼쳐졌다. 크롬은 기계와 인간의 경계를 넘나들며, 바이퍼는 자유로운 영혼으로 길 위의 진실을 추구했다. 거대한 기업의 그림자가 드리운 도시에서, 그들만이 마지막 희망이었다."
    }
  },
  {
    id: 4,
    title: "패스파인더 2e - 에이지 오브 애시즈",
    summary: "아포칼립스 이후의 세계에서 펼쳐지는 모험...",
    thumbnail: "/post-apocalyptic-fantasy.png",
    tags: ["Pathfinder 2e", "아포칼립스", "판타지"],
    date: "2024-01-08",
    views: 203,
    isPrivate: true,
    sessionInfo: {
      rule: "Pathfinder 2nd Edition",
      scenario: "에이지 오브 애시즈 - 1부",
      author: "Paizo Publishing",
      playerCount: 3,
      overview: "대재앙 이후 황폐해진 세계에서 희망을 찾아 나서는 영웅들의 이야기",
      characters: [
        {
          name: "아샤",
          player: "민지",
          class: "오라클",
          thumbnail: "/character-oracle.png"
        },
        {
          name: "카이",
          player: "동현",
          class: "바바리안",
          thumbnail: "/character-barbarian.png"
        },
        {
          name: "루나",
          player: "예린",
          class: "레인저",
          thumbnail: "/character-ranger.png"
        }
      ],
      highlight: "재로 뒤덮인 하늘 아래, 세 명의 생존자가 폐허 속에서 서로를 발견했다. 아샤의 예언적 시야는 어둠 속에서도 희망의 빛을 찾아냈고, 카이의 원시적 힘은 절망을 분쇄했다. 루나는 황무지의 흔적을 읽으며 살아남을 길을 찾았다. 세상이 끝났다고 여겨지는 그 순간에도, 그들의 마음속에는 새로운 시작을 향한 불꽃이 꺼지지 않았다."
    }
  }
]

const allTags = Array.from(new Set(posts.flatMap(post => post.tags)))

export default function HomePage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const tagSelectRef = useRef<HTMLButtonElement>(null)
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 키보드 단축키 설정
  const shortcuts = [
    ...createCommonShortcuts(router),
    {
      key: '/',
      action: () => searchInputRef.current?.focus(),
      description: '/ - 검색창 포커스'
    },
    {
      key: 'v',
      action: () => setViewMode(prev => prev === 'grid' ? 'list' : 'grid'),
      description: 'V - 뷰 모드 전환'
    },
    {
      key: 't',
      action: () => tagSelectRef.current?.click(),
      description: 'T - 태그 필터 열기'
    },
    {
      key: 'r',
      action: () => {
        setSearchQuery('')
        setSelectedTag('all')
      },
      description: 'R - 필터 초기화'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  const filteredPosts = posts.filter(post => {
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag)
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.summary.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTag && matchesSearch
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">TRPG 로그 아카이브</h1>
            <Link href="/write">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                새 로그 작성
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              ref={searchInputRef}
              placeholder="로그 제목이나 내용으로 검색... (단축키: /)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger ref={tagSelectRef} className="w-full md:w-48">
              <SelectValue placeholder="태그 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 태그</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Posts */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="relative">
                    <Image
                      src={post.thumbnail || "/placeholder.svg"}
                      alt={post.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {post.isPrivate && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded">
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{post.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{post.date}</span>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={post.thumbnail || "/placeholder.svg"}
                          alt={post.title}
                          width={120}
                          height={80}
                          className="w-30 h-20 object-cover rounded"
                        />
                        {post.isPrivate && (
                          <div className="absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded">
                            <Lock className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{post.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{post.summary}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{post.date}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  )
}

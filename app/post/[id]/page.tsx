"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, Lock, Unlock, FileText } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useKeyboardShortcuts, createCommonShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help"
import { ReadingSettingsModal } from "@/components/reading-settings-modal"

// 컴포넌트 imports
import { SessionInfoTemplate } from "@/components/session-info-template"
import { SubPostSidebar } from "@/components/sub-post-sidebar"
import { SubPostContent } from "@/components/sub-post-content"

// 더미 데이터 (실제로는 API에서 가져옴)
const getPost = (id: string) => {
  const posts = [
    {
      id: 1,
      title: "던전 앤 드래곤 5판 - 스톰킹의 천둥",
      summary: "레벨 1-11 캠페인 시리즈. 신참 모험가들이 성장해나가는 이야기",
      thumbnail: "/fantasy-dungeon-goblins.png",
      tags: ["D&D 5e", "캠페인", "판타지"],
      date: "2024-01-15",
      views: 245,
      password: "1234",
      sessionInfo: {
        rule: "Dungeons & Dragons 5th Edition",
        scenario: "스톰킹의 천둥 캠페인",
        author: "위저드 오브 더 코스트",
        playerCount: 4,
        overview: "신참 모험가들이 마을 근처의 고블린 문제를 해결하며 첫 모험을 시작하고, 점차 더 큰 위험에 맞서게 되는 이야기",
        characters: [
          {
            name: "실바나스",
            player: "민수",
            class: "엘프 로그",
            description: "그림자 속에서 자란 고독한 엘프. 과거의 비밀을 간직하고 있으며, 신중하고 관찰력이 뛰어나다.",
            thumbnail: "/character-elf-rogue.png"
          },
          {
            name: "멜로디",
            player: "영희",
            class: "인간 바드",
            description: "떠돌이 음유시인으로 항상 밝고 긍정적이다. 사람들과 어울리기를 좋아하며 이야기와 노래로 분위기를 띄운다.",
            thumbnail: "/character-human-bard.png"
          },
          {
            name: "그림",
            player: "지훈",
            class: "드워프 파이터",
            description: "산악 지대 출신의 전사. 과묵하지만 동료를 위해서라면 목숨도 아끼지 않는 의리의 사나이다.",
            thumbnail: "/character-dwarf-fighter.png"
          },
          {
            name: "핀",
            player: "수연",
            class: "하플링 위저드",
            description: "호기심 많은 젊은 마법사. 작은 체구에 큰 꿈을 품고 있으며, 마법 연구에 열정적이다.",
            thumbnail: "/character-halfling-wizard.png"
          }
        ],
        highlight: "황금빛 석양이 마을을 물들이던 그 저녁, 네 명의 낯선 이들이 '황금 용' 여관에서 만났다. 멜로디의 유쾌한 웃음소리가 여관을 가득 채우고, 그림의 묵직한 발걸음이 바닥을 울렸다. 실바나스는 그림자 속에서 조용히 상황을 관찰했고, 핀은 작은 손으로 마법서의 페이지를 넘기며 미소를 지었다. 운명이 그들을 하나로 엮어낸 그 순간, 아무도 이것이 전설의 시작이 될 줄은 몰랐다."
      },
      subPosts: [
        {
          id: "session-1",
          title: "1세션: 황금 용 여관에서의 만남",
          description: "네 명의 모험가가 처음 만나 첫 퀘스트를 받게 되는 이야기",
          content: [
            {
              id: 1,
              type: 'system' as const,
              content: '황금빛 석양이 마을을 물들이던 저녁, "황금 용" 여관은 하루 종일 일한 사람들로 북적였다. 벽난로의 따뜻한 불빛이 여관 안을 은은하게 비추고 있었다.'
            },
            {
              id: 2,
              type: 'character' as const,
              character: '실바나스',
              content: '구석 테이블에 조용히 앉아 다른 손님들을 관찰하고 있다.'
            },
            {
              id: 3,
              type: 'system' as const,
              content: '이때 여관 문이 활짝 열리며 밝은 웃음소리와 함께 한 명의 바드가 들어섰다.'
            },
            {
              id: 4,
              type: 'character' as const,
              character: '멜로디',
              content: '활기차게 들어서며 "안녕하세요, 모든 분들! 오늘도 좋은 하루 보내셨나요?"'
            },
            {
              id: 5,
              type: 'whisper' as const,
              character: '실바나스',
              target: '핀',
              content: '"저 바드... 뭔가 수상하지 않나?"'
            },
            {
              id: 6,
              type: 'character' as const,
              character: '그림',
              content: '맥주잔을 내려놓으며 중얼거린다. "시끄럽군..."'
            },
            {
              id: 7,
              type: 'character' as const,
              character: '핀',
              content: '마법서에서 고개를 들어 새로 들어온 바드를 바라본다. "흥미로운 분이군요."'
            },
            {
              id: 8,
              type: 'whisper' as const,
              character: '핀',
              target: '실바나스',
              content: '"아니에요, 그냥 활발한 성격인 것 같은데요."'
            },
            {
              id: 9,
              type: 'system' as const,
              content: '여관의 분위기가 한층 활기를 띠는 가운데, 여관 주인이 서둘러 이들에게 다가왔다.'
            },
            {
              id: 10,
              type: 'character' as const,
              character: '여관주인',
              content: '급하게 다가와서 "모험가 여러분, 마을 촌장님이 찾고 계십니다. 급한 일이 있다고 하시더군요."'
            },
            {
              id: 11,
              type: 'system' as const,
              content: '네 명의 모험가들이 서로를 바라보며 일어선다. 운명이 그들을 하나로 엮어낸 순간이었다.'
            },
            {
              id: 12,
              type: 'system' as const,
              target: '멜로디',
              content: '여관주인이 멜로디에게만 조용히 말한다. "저분들... 정말 모험가가 맞나요?"'
            },
            {
              id: 13,
              type: 'system' as const,
              target: '실바나스',
              content: '실바나스만이 여관 구석에서 수상한 인물이 자신들을 지켜보고 있다는 것을 눈치챈다.'
            }
          ]
        },
        {
          id: "session-2",
          title: "2세션: 고블린 소굴 탐험",
          description: "첫 퀘스트를 받고 고블린 소굴로 향하는 모험가들",
          content: [
            {
              id: 1,
              type: 'system' as const,
              content: '다음 날 새벽, 네 명의 모험가들은 마을을 떠나 숲 속 깊은 곳으로 향했다. 아침 안개가 나무들 사이로 스며들어 신비로운 분위기를 자아냈다.'
            },
            {
              id: 2,
              type: 'character' as const,
              character: '실바나스',
              content: '땅을 살펴보며 흔적을 추적한다. "이쪽으로 발자국이 이어져 있다. 고블린들이 지나간 흔적 같다."'
            },
            {
              id: 3,
              type: 'character' as const,
              character: '그림',
              content: '"얼마나 많은 놈들이 있을까?"'
            },
            {
              id: 4,
              type: 'character' as const,
              character: '핀',
              content: '"발자국으로 보아 최소 6-7마리는 될 것 같습니다."'
            },
            {
              id: 5,
              type: 'whisper' as const,
              character: '멜로디',
              target: '그림',
              content: '그림에게 살짝 다가가 속삭인다. "괜찮으실 거죠? 처음이라 좀 떨리네요."'
            },
            {
              id: 6,
              type: 'character' as const,
              character: '멜로디',
              content: '밝게 웃으며 "우리가 충분히 상대할 수 있을 거예요! 용기를 내요!"'
            },
            {
              id: 7,
              type: 'system' as const,
              content: '한 시간 정도 숲을 헤매던 그들은 마침내 바위 틈새로 이어지는 동굴 입구를 발견했다. 동굴 입구에서 고약한 냄새가 풍겨온다.'
            },
            {
              id: 8,
              type: 'character' as const,
              character: '실바나스',
              content: '손짓으로 신호를 보내며 속삭인다. "조용히 하자. 안에서 소리가 들린다."'
            },
            {
              id: 9,
              type: 'system' as const,
              content: '동굴 깊숙한 곳에서 고블린들의 거친 웃음소리와 무언가를 두드리는 소리가 들려왔다.'
            }
          ]
        },
        {
          id: "session-3",
          title: "3세션: 첫 번째 전투",
          description: "고블린들과의 첫 전투에서 팀워크를 발휘하는 모험가들",
          content: [
            {
              id: 1,
              type: 'system' as const,
              content: '동굴 안으로 조심스럽게 들어선 모험가들. 횃불의 불빛이 벽면에 그림자를 드리우며 긴장감을 더했다.'
            },
            {
              id: 2,
              type: 'character' as const,
              character: '실바나스',
              content: '앞장서서 은밀하게 정찰을 시작한다. 뒤돌아보며 속삭인다. "앞쪽에 고블린 3마리가 있다. 뒤쪽에 더 있을 수도 있어."'
            },
            {
              id: 3,
              type: 'character' as const,
              character: '그림',
              content: '낮은 목소리로 "정면 돌파가 좋겠다."'
            },
            {
              id: 4,
              type: 'whisper' as const,
              character: '핀',
              target: '그림',
              content: '그림에게 조용히 말한다. "너무 성급하지 마세요. 계획이 필요해요."'
            },
            {
              id: 5,
              type: 'character' as const,
              character: '핀',
              content: '조용히 주문을 외우며 손가락을 움직인다. "잠깐, 제가 먼저 마법으로 혼란을 주겠습니다."'
            },
            {
              id: 6,
              type: 'system' as const,
              content: '갑자기 동굴 안에 밝은 빛이 번쩍이며 고블린들이 놀라 비명을 지른다.'
            },
            {
              id: 7,
              type: 'character' as const,
              character: '고블린',
              content: '"크아악! 침입자다!"'
            },
            {
              id: 8,
              type: 'character' as const,
              character: '그림',
              content: '방패를 들고 앞으로 돌진한다.'
            },
            {
              id: 9,
              type: 'character' as const,
              character: '멜로디',
              content: '격려하며 외친다. "모두 힘내세요! 우리가 이길 수 있어요!"'
            },
            {
              id: 10,
              type: 'system' as const,
              content: '멜로디의 격려가 동료들에게 용기를 불어넣는다. 치열한 전투가 벌어졌지만, 네 명의 팀워크는 완벽했다. 곧 고블린들은 모두 쓰러졌고, 동굴에는 다시 정적이 찾아왔다.'
            }
          ]
        }
      ]
    }
  ]
  
  return posts.find(p => p.id === parseInt(id)) || null
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const passwordInputRef = useRef<HTMLInputElement>(null)
  
  const [passwordInput, setPasswordInput] = useState('')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [readingSettings, setReadingSettings] = useState({
    showAvatars: true,
    fontSize: 14,
    lineSpacing: 1.5,
    paragraphSpacing: 2
  })
  const [activeSubPostId, setActiveSubPostId] = useState<string | null>(null)

  const post = getPost(params.id as string)

  // 키보드 단축키 설정
  const shortcuts = [
    ...createCommonShortcuts(router),
    {
      key: 'Escape',
      action: () => router.push('/'),
      description: 'ESC - 목록으로 돌아가기'
    },
    {
      key: 'p',
      action: () => {
        if (!isUnlocked) {
          passwordInputRef.current?.focus()
        }
      },
      description: 'P - 비밀번호 입력창 포커스'
    },
    {
      key: 'ArrowUp',
      action: () => {
        if (isUnlocked && post?.subPosts) {
          const currentIndex = post.subPosts.findIndex(sp => sp.id === activeSubPostId)
          if (currentIndex > 0) {
            setActiveSubPostId(post.subPosts[currentIndex - 1].id)
          }
        }
      },
      description: '↑ - 이전 세션'
    },
    {
      key: 'ArrowDown',
      action: () => {
        if (isUnlocked && post?.subPosts) {
          const currentIndex = post.subPosts.findIndex(sp => sp.id === activeSubPostId)
          if (currentIndex < post.subPosts.length - 1) {
            setActiveSubPostId(post.subPosts[currentIndex + 1].id)
          }
        }
      },
      description: '↓ - 다음 세션'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">게시글을 찾을 수 없습니다</h2>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === post.password) {
      setIsUnlocked(true)
      setPasswordError('')
      // 첫 번째 하위 포스트를 자동 선택
      if (post.subPosts && post.subPosts.length > 0) {
        setActiveSubPostId(post.subPosts[0].id)
      }
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.')
    }
  }

  const activeSubPost = post.subPosts?.find(sp => sp.id === activeSubPostId) || null

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                목록으로
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">TRPG 로그 상세</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Image
                src={post.thumbnail || "/placeholder.svg"}
                alt={post.title}
                width={200}
                height={150}
                className="rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{post.date}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{post.subPosts?.length || 0}개 세션</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* 공개 요약 */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  캠페인 정보
                </h3>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <SessionInfoTemplate sessionInfo={post.sessionInfo} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 세션 로그 섹션 */}
        {!isUnlocked ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                세션 로그 (비밀글)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5" />
                    비밀번호가 필요합니다
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    모든 세션 로그를 보려면 비밀번호를 입력해주세요.
                  </p>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      ref={passwordInputRef}
                      id="password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="비밀번호를 입력하세요 (단축키: P)"
                      required
                    />
                    {passwordError && (
                      <p className="text-sm text-destructive">{passwordError}</p>
                    )}
                  </div>
                  <Button type="submit">
                    <Unlock className="w-4 h-4 mr-2" />
                    잠금 해제
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-6">
            {/* Sticky 세션 목록 */}
            <SubPostSidebar
              subPosts={post.subPosts || []}
              activeSubPostId={activeSubPostId}
              onSubPostSelect={setActiveSubPostId}
              onSettingsClick={() => setSettingsOpen(true)}
            />
            
            {/* 세션 콘텐츠 */}
            <SubPostContent 
              subPost={activeSubPost} 
              characters={post.sessionInfo.characters}
              settings={readingSettings}
            />
          </div>
        )}
      </div>

      {/* 읽기 설정 모달 */}
      <ReadingSettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={readingSettings}
        onSettingsChange={setReadingSettings}
      />

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  )
}

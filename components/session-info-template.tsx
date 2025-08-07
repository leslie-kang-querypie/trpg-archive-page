import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface Character {
  name: string
  player: string
  class: string
  description: string
  thumbnail: string
}

interface SessionInfo {
  rule: string
  scenario: string
  author: string
  playerCount: number
  overview: string
  characters: Character[]
  highlight: string
}

interface SessionInfoTemplateProps {
  sessionInfo: SessionInfo
}

export function SessionInfoTemplate({ sessionInfo }: SessionInfoTemplateProps) {
  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">게임 시스템:</span>
            <span className="ml-2">{sessionInfo.rule}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">참가 인원:</span>
            <span className="ml-2">{sessionInfo.playerCount}명</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* 시나리오 정보 */}
      <div className="space-y-3">
        <h4 className="font-semibold">시나리오 정보</h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">제목:</span>
            <span className="ml-2">{sessionInfo.scenario}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">작가:</span>
            <span className="ml-2">{sessionInfo.author}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">개요:</span>
            <p className="mt-1 leading-relaxed">{sessionInfo.overview}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 캐릭터 정보 */}
      <div className="space-y-3">
        <h4 className="font-semibold">참가 캐릭터</h4>
        <div className="space-y-4">
          {sessionInfo.characters.map((character, index) => (
            <div key={index} className="flex gap-3 py-2">
              <Image
                src={character.thumbnail || "/placeholder.svg?height=50&width=50&query=character"}
                alt={character.name}
                width={50}
                height={50}
                className="rounded-full object-cover border flex-shrink-0"
              />
              <div className="flex-1 text-sm">
                <div className="font-medium">{character.name}</div>
                <div className="text-muted-foreground mb-1">{character.class} • {character.player}</div>
                {character.description && (
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {character.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 세션 하이라이트 */}
      <div className="space-y-3">
        <h4 className="font-semibold">세션 하이라이트</h4>
        <div className="text-sm leading-relaxed text-muted-foreground italic">
          {sessionInfo.highlight}
        </div>
      </div>
    </div>
  )
}

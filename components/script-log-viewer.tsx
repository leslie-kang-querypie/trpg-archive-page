import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export interface LogEntry {
  id: number
  type: 'system' | 'character' | 'whisper'
  character?: string
  target?: string  // 귓속말 대상 (system도 사용 가능)
  content: string
}

interface Character {
  name: string
  player: string
  class: string
  description: string
  thumbnail: string
}

interface ReadingSettings {
  showAvatars: boolean
  fontSize: number
  lineSpacing: number
  paragraphSpacing: number
}

interface ScriptLogViewerProps {
  entries: LogEntry[]
  characters: Character[]
  settings: ReadingSettings
  entriesPerPage?: number
}

export function ScriptLogViewer({ 
  entries, 
  characters, 
  settings,
  entriesPerPage = 20 
}: ScriptLogViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentEntries = entries.slice(startIndex, endIndex)

  const getCharacterInfo = (characterName: string) => {
    return characters.find(c => c.name === characterName)
  }

  // 동적 스타일 생성
  const getTextStyle = () => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineSpacing
  })

  const getParagraphSpacing = () => ({
    marginBottom: `${settings.paragraphSpacing * 0.5}rem`
  })

  const formatEntry = (entry: LogEntry, index: number) => {
    const key = `${entry.id}-${index}`
    const textStyle = getTextStyle()
    const paragraphStyle = getParagraphSpacing()
    
    if (entry.type === 'system') {
      if (entry.target) {
        // 시스템이 특정 캐릭터에게 비밀스럽게 전달하는 경우
        return (
          <div key={key} style={paragraphStyle}>
            <div className="flex gap-3">
              {settings.showAvatars && <div className="w-7 h-7 flex-shrink-0"></div>}
              <div className="flex-1 min-w-0 bg-amber-50 rounded-lg px-3 py-2">
                <div className="text-muted-foreground italic" style={textStyle}>
                  <ArrowRight className="w-3 h-3 inline mr-1" />
                  <span className="font-medium">{entry.target}</span>
                  <span className="ml-2">{entry.content}</span>
                </div>
              </div>
            </div>
          </div>
        )
      } else {
        // 일반 시스템 메시지
        return (
          <div key={key} style={{ ...paragraphStyle, marginBottom: `${settings.paragraphSpacing * 0.75}rem` }}>
            <div className="text-muted-foreground" style={textStyle}>
              {entry.content}
            </div>
          </div>
        )
      }
    }
    
    if (entry.type === 'whisper' && entry.character) {
      const characterInfo = getCharacterInfo(entry.character)
      
      return (
        <div key={key} style={paragraphStyle}>
          <div className="flex gap-3">
            {/* 화자 아바타 - 설정에 따라 표시/숨김 */}
            {settings.showAvatars && (
              characterInfo ? (
                <Avatar className="w-7 h-7 flex-shrink-0">
                  <AvatarImage 
                    src={characterInfo.thumbnail || "/placeholder.svg?height=40&width=40&query=character"} 
                    alt={entry.character}
                  />
                  <AvatarFallback className="bg-transparent border-0">
                    <span className="sr-only">{entry.character.charAt(0)}</span>
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-7 h-7 flex-shrink-0"></div>
              )
            )}
            
            <div className="flex-1 min-w-0 bg-amber-50 rounded-lg px-3 py-2">
              <div className="italic" style={textStyle}>
                <span className="font-bold">{entry.character}</span>
                {entry.target && (
                  <>
                    <ArrowRight className="w-3 h-3 inline mx-1" />
                    <span className="font-medium">{entry.target}</span>
                  </>
                )}
                <span className="ml-2">{entry.content}</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    if (entry.type === 'character' && entry.character) {
      const characterInfo = getCharacterInfo(entry.character)
      
      return (
        <div key={key} className="flex gap-3" style={paragraphStyle}>
          {/* 일반 캐릭터 - 설정에 따라 아바타 표시/숨김 */}
          {settings.showAvatars && (
            characterInfo ? (
              <Avatar className="w-7 h-7 flex-shrink-0">
                <AvatarImage 
                  src={characterInfo.thumbnail || "/placeholder.svg?height=40&width=40&query=character"} 
                  alt={entry.character}
                />
                <AvatarFallback className="bg-transparent border-0">
                  <span className="sr-only">{entry.character.charAt(0)}</span>
                </AvatarFallback>
              </Avatar>
            ) : (
              // NPC의 경우 아바타 공간만 확보 (투명)
              <div className="w-7 h-7 flex-shrink-0"></div>
            )
          )}
          
          <div className="flex-1 min-w-0">
            <div style={textStyle}>
              <span className="font-bold">{entry.character}</span>
              <span className="ml-4">{entry.content}</span>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const showPages = 5 // 보여줄 페이지 수
    
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
    let endPage = Math.min(totalPages, startPage + showPages - 1)
    
    // 끝에서 시작점 조정
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1)
    }

    // 이전 버튼
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </Button>
    )

    // 첫 페이지
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant={1 === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(1)}
        >
          1
        </Button>
      )
      if (startPage > 2) {
        pages.push(<span key="dots1" className="px-2 text-muted-foreground">...</span>)
      }
    }

    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      )
    }

    // 마지막 페이지
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="px-2 text-muted-foreground">...</span>)
      }
      pages.push(
        <Button
          key={totalPages}
          variant={totalPages === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </Button>
      )
    }

    // 다음 버튼
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </Button>
    )

    return pages
  }

  return (
    <div className="space-y-4">
      {/* 로그 내용 */}
      <div className="min-h-96">
        <div className="space-y-0">
          {currentEntries.map((entry, index) => formatEntry(entry, index))}
        </div>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4 border-t">
          {renderPagination()}
        </div>
      )}
    </div>
  )
}

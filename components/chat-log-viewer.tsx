import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, User, Gamepad2, Clock } from 'lucide-react'

interface ChatMessage {
  id: number
  type: 'ic' | 'ooc' | 'action' | 'system'
  character?: string
  player: string
  content: string
  timestamp: string
  avatar?: string
}

interface ChatLogViewerProps {
  messages: ChatMessage[]
  characters: Array<{
    name: string
    player: string
    thumbnail: string
  }>
}

export function ChatLogViewer({ messages, characters }: ChatLogViewerProps) {
  const [filter, setFilter] = useState<'all' | 'ic' | 'ooc' | 'action'>('all')

  const getCharacterAvatar = (playerName: string) => {
    const character = characters.find(c => c.player === playerName)
    return character?.thumbnail || "/diverse-group-characters.png"
  }

  const getCharacterName = (playerName: string) => {
    const character = characters.find(c => c.player === playerName)
    return character?.name || playerName
  }

  const filteredMessages = messages.filter(msg => 
    filter === 'all' || msg.type === filter
  )

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'ic':
        return 'bg-blue-50 border-blue-200'
      case 'ooc':
        return 'bg-gray-50 border-gray-200'
      case 'action':
        return 'bg-green-50 border-green-200'
      case 'system':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ic':
        return <MessageCircle className="w-3 h-3" />
      case 'ooc':
        return <User className="w-3 h-3" />
      case 'action':
        return <Gamepad2 className="w-3 h-3" />
      case 'system':
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ic':
        return 'IC'
      case 'ooc':
        return 'OOC'
      case 'action':
        return '액션'
      case 'system':
        return '시스템'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {/* 필터 버튼들 */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          전체
        </Button>
        <Button
          variant={filter === 'ic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ic')}
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          IC 대화
        </Button>
        <Button
          variant={filter === 'ooc' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('ooc')}
        >
          <User className="w-3 h-3 mr-1" />
          OOC
        </Button>
        <Button
          variant={filter === 'action' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('action')}
        >
          <Gamepad2 className="w-3 h-3 mr-1" />
          액션
        </Button>
      </div>

      {/* 채팅 로그 */}
      <ScrollArea className="h-96 border rounded-lg p-4">
        <div className="space-y-3">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg border ${getMessageStyle(message.type)}`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage 
                    src={getCharacterAvatar(message.player) || "/placeholder.svg"} 
                    alt={message.character || message.player}
                  />
                  <AvatarFallback>
                    {(message.character || message.player).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(message.type)}
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(message.type)}
                      </Badge>
                    </div>
                    <span className="font-medium text-sm">
                      {message.type === 'ic' && message.character 
                        ? message.character 
                        : message.player}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                  
                  <div className="text-sm leading-relaxed">
                    {message.type === 'action' ? (
                      <em>{message.content}</em>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

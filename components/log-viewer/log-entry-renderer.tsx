import { LogEntry, ReadingSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface LogEntryRendererProps {
  entry: LogEntry;
  settings: ReadingSettings;
  isEditing?: boolean;
  editingContent?: string;
  onEdit?: (content: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEditingContentChange?: (content: string) => void;
  showEditControls?: boolean;
}

export function LogEntryRenderer({
  entry,
  settings,
  isEditing = false,
  editingContent = '',
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditingContentChange,
  showEditControls = false,
}: LogEntryRendererProps) {
  const getTextStyle = () => ({
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineSpacing,
  });

  const getParagraphStyle = () => ({
    marginBottom: `${settings.paragraphSpacing * 0.5}rem`,
  });

  const textStyle = getTextStyle();
  const paragraphStyle = getParagraphStyle();

  const renderEditingControls = () => {
    if (!isEditing || !onSave || !onCancel || !onEditingContentChange) return null;
    
    return (
      <div className="space-y-2">
        <Textarea
          value={editingContent}
          onChange={e => onEditingContentChange(e.target.value)}
          className="min-h-[60px]"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            저장
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            취소
          </Button>
        </div>
      </div>
    );
  };

  const renderActionButtons = () => {
    if (!showEditControls || isEditing) return null;
    
    return (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onEdit && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(entry.content)}
            className="h-6 px-2 text-xs"
          >
            편집
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="relative group border-l-2 border-transparent hover:border-blue-200 pl-3">
      {renderActionButtons()}
      
      <div style={paragraphStyle}>
        {/* 시스템 메시지 */}
        {entry.type === 'system' && (
          <div
            className={`text-muted-foreground ${settings.centerSystemMessages ? 'text-center' : ''}`}
            style={textStyle}
          >
            {isEditing ? renderEditingControls() : entry.content}
          </div>
        )}

        {/* 캐릭터 대화 */}
        {entry.type === 'character' && entry.character && (
          <div className="flex gap-3">
            {settings.showAvatars && (
              <div className="w-7 h-7 flex-shrink-0 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                {entry.character?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div style={textStyle}>
                <span className="font-bold">{entry.character}</span>
                {isEditing ? (
                  <div className="mt-2">
                    {renderEditingControls()}
                  </div>
                ) : (
                  <span className="ml-4">{entry.content}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OOC */}
        {entry.type === 'ooc' && (
          <div className="flex gap-3">
            {settings.showAvatars && (
              <div className="w-7 h-7 flex-shrink-0"></div>
            )}
            <div className="flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <div className="flex items-center gap-2" style={textStyle}>
                <span className="font-medium">{entry.character}</span>
                {isEditing ? (
                  <div className="mt-2 w-full">
                    {renderEditingControls()}
                  </div>
                ) : (
                  <span className="text-muted-foreground">{entry.content}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 귓속말 */}
        {entry.type === 'whisper' && entry.character && (
          <div className="bg-amber-50 rounded-lg px-3 py-2 italic">
            <div className="flex items-start gap-3">
              {settings.showAvatars && (
                <div className="w-6 h-6 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                  {entry.character.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0" style={textStyle}>
                <span className="font-bold">{entry.character}</span>
                {entry.target && (
                  <>
                    <span className="mx-1">→</span>
                    <span className="font-medium">{entry.target}</span>
                  </>
                )}
                {isEditing ? (
                  <div className="mt-2">
                    {renderEditingControls()}
                  </div>
                ) : (
                  <span className="ml-2">{entry.content}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 주사위 굴리기 */}
        {entry.type === 'dice' && entry.diceResult && (
          <div className="flex gap-3">
            {settings.showAvatars && (
              <div className="w-7 h-7 flex-shrink-0"></div>
            )}
            <div className="flex-1 min-w-0 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
              <div className="flex items-center gap-2 flex-wrap" style={textStyle}>
                <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <span className="font-bold">{entry.character}</span>
                <span>굴림:</span>
                <span className="bg-gray-200 px-2 py-1 rounded text-sm font-mono">
                  {entry.diceResult.dice}
                </span>
                <span>=</span>
                <span className="font-mono text-sm text-gray-600">
                  [{entry.diceResult.rolls?.join(', ')}]
                  {entry.diceResult.modifier ? ` + ${entry.diceResult.modifier}` : ''}
                </span>
                <span>=</span>
                <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold">
                  {entry.diceResult.result}
                </span>
              </div>
              {isEditing ? (
                <div className="mt-2">
                  {renderEditingControls()}
                </div>
              ) : (
                entry.content && (
                  <div className="mt-1 text-sm text-gray-600" style={textStyle}>
                    {entry.content}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 데미지/힐링 */}
        {entry.type === 'damage' && entry.damageInfo && (
          <div className="flex gap-3">
            {settings.showAvatars && (
              <div className="w-7 h-7 flex-shrink-0"></div>
            )}
            <div
              className={`flex-1 min-w-0 rounded-lg px-3 py-2 border ${
                entry.damageInfo.type === 'damage'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center gap-2" style={textStyle}>
                <div
                  className={`w-4 h-4 rounded-full ${
                    entry.damageInfo.type === 'damage' ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  <span className="text-white text-xs flex items-center justify-center w-full h-full">
                    ♥
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    entry.damageInfo.type === 'damage'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {entry.damageInfo.type === 'damage' ? '데미지' : '힐링'}
                </span>
                <span className="font-bold">{entry.damageInfo.target}</span>
                <span>{entry.damageInfo.type === 'damage' ? '받은 피해:' : '회복:'}</span>
                <span
                  className={`px-2 py-1 rounded font-bold text-white ${
                    entry.damageInfo.type === 'damage' ? 'bg-red-600' : 'bg-green-600'
                  }`}
                >
                  {entry.damageInfo.amount}
                </span>
              </div>
              {isEditing ? (
                <div className="mt-2">
                  {renderEditingControls()}
                </div>
              ) : (
                entry.content && (
                  <div className="mt-1 text-sm text-gray-600" style={textStyle}>
                    {entry.content}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* 핸드아웃 */}
        {entry.type === 'handout' && entry.handoutInfo && (
          <div className="flex gap-3">
            {settings.showAvatars && (
              <div className="w-7 h-7 flex-shrink-0"></div>
            )}
            <div
              className={`flex-1 min-w-0 rounded-lg px-3 py-2 border ${
                entry.handoutInfo.isSecret
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2" style={textStyle}>
                  <div
                    className={`w-4 h-4 rounded ${
                      entry.handoutInfo.isSecret ? 'bg-gray-600' : 'bg-gray-400'
                    } flex items-center justify-center`}
                  >
                    <span className="text-white text-xs">📄</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      entry.handoutInfo.isSecret
                        ? 'bg-gray-700 text-gray-200 border-gray-600'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {entry.handoutInfo.isSecret ? '비밀 핸드아웃' : '핸드아웃'}
                  </span>
                  {entry.handoutInfo.category && (
                    <span
                      className={`px-2 py-1 rounded text-xs border ${
                        entry.handoutInfo.isSecret
                          ? 'border-gray-600 text-gray-300'
                          : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {entry.handoutInfo.category}
                    </span>
                  )}
                  <span
                    className={entry.handoutInfo.isSecret ? 'text-gray-400' : 'text-gray-500'}
                  >
                    →
                  </span>
                  <span
                    className={`font-bold ${
                      entry.handoutInfo.isSecret ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {entry.handoutInfo.target}
                  </span>
                </div>
                <div className="pl-6">
                  <div
                    className={`font-medium mb-1 ${
                      entry.handoutInfo.isSecret ? 'text-gray-100' : 'text-gray-900'
                    }`}
                    style={textStyle}
                  >
                    {entry.handoutInfo.title}
                  </div>
                  {isEditing ? (
                    <div className="">
                      {renderEditingControls()}
                    </div>
                  ) : (
                    <div
                      className={`text-sm ${
                        entry.handoutInfo.isSecret ? 'text-gray-200' : 'text-gray-700'
                      }`}
                      style={textStyle}
                    >
                      {entry.content}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
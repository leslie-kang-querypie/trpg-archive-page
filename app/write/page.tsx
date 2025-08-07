'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ArrowLeft, Minus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcuts, createCommonShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsHelp } from '@/components/keyboard-shortcuts-help';

interface Character {
  name: string;
  player: string;
  class: string;
  description: string;
  thumbnail: string;
}

interface SubPost {
  id: string;
  title: string;
  description: string;
  content: string;
}

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // 세션 정보 필드들
  const [rule, setRule] = useState('');
  const [scenario, setScenario] = useState('');
  const [scenarioAuthor, setScenarioAuthor] = useState('');
  const [overview, setOverview] = useState('');
  const [characters, setCharacters] = useState<Character[]>([
    { name: '', player: '', class: '', description: '', thumbnail: '' },
  ]);
  const [highlight, setHighlight] = useState('');

  // 하위 포스트들
  const [subPosts, setSubPosts] = useState<SubPost[]>([{ id: '1', title: '', description: '', content: '' }]);

  // 키보드 단축키 설정
  const shortcuts = [
    ...createCommonShortcuts(router),
    {
      key: 's',
      ctrlKey: true,
      action: () => handleSubmit(new Event('submit') as any),
      description: 'Ctrl+S - 로그 저장',
    },
    {
      key: 'Escape',
      action: () => router.push('/'),
      description: 'ESC - 작성 취소',
    },
  ];

  useKeyboardShortcuts(shortcuts);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addCharacter = () => {
    setCharacters([...characters, { name: '', player: '', class: '', description: '', thumbnail: '' }]);
  };

  const removeCharacter = (index: number) => {
    if (characters.length > 1) {
      setCharacters(characters.filter((_, i) => i !== index));
    }
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const addSubPost = () => {
    const newId = (subPosts.length + 1).toString();
    setSubPosts([...subPosts, { id: newId, title: '', description: '', content: '' }]);
  };

  const removeSubPost = (index: number) => {
    if (subPosts.length > 1) {
      setSubPosts(subPosts.filter((_, i) => i !== index));
    }
  };

  const updateSubPost = (index: number, field: keyof SubPost, value: string) => {
    const updated = [...subPosts];
    updated[index] = { ...updated[index], [field]: value };
    setSubPosts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionInfo = {
      rule,
      scenario,
      author: scenarioAuthor,
      playerCount: characters.length,
      overview,
      characters: characters.filter(char => char.name && char.player),
      highlight,
    };

    console.log({
      title,
      password,
      tags,
      thumbnailUrl,
      sessionInfo,
      subPosts: subPosts.filter(sp => sp.title && sp.content),
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">새 TRPG 캠페인 작성</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>캠페인의 기본적인 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">캠페인 제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="예: 던전 앤 드래곤 5판 - 스톰킹의 천둥"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail">썸네일 URL</Label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl}
                  onChange={e => setThumbnailUrl(e.target.value)}
                  placeholder="캠페인 분위기를 나타내는 이미지 URL"
                />
              </div>

              <div className="space-y-2">
                <Label>태그</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    placeholder="태그 입력"
                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="모든 세션 로그 열람을 위한 비밀번호"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 캠페인 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>캠페인 정보 (공개)</CardTitle>
              <CardDescription>이 정보는 모든 방문자에게 공개됩니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule">게임 시스템 *</Label>
                  <Input
                    id="rule"
                    value={rule}
                    onChange={e => setRule(e.target.value)}
                    placeholder="예: Dungeons & Dragons 5th Edition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario">캠페인/시나리오 제목 *</Label>
                  <Input
                    id="scenario"
                    value={scenario}
                    onChange={e => setScenario(e.target.value)}
                    placeholder="예: 스톰킹의 천둥 캠페인"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioAuthor">시나리오 작가 *</Label>
                <Input
                  id="scenarioAuthor"
                  value={scenarioAuthor}
                  onChange={e => setScenarioAuthor(e.target.value)}
                  placeholder="예: 위저드 오브 더 코스트"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overview">캠페인 개요 *</Label>
                <Textarea
                  id="overview"
                  value={overview}
                  onChange={e => setOverview(e.target.value)}
                  placeholder="캠페인의 전체적인 줄거리나 배경을 간단히 설명해주세요."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="highlight">캠페인 하이라이트 *</Label>
                <Textarea
                  id="highlight"
                  value={highlight}
                  onChange={e => setHighlight(e.target.value)}
                  placeholder="캠페인의 분위기나 인상적인 순간을 서정적인 문체로 한 문단 정도 작성해주세요."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* 캐릭터 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                참가 캐릭터
                <Button type="button" onClick={addCharacter} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  캐릭터 추가
                </Button>
              </CardTitle>
              <CardDescription>캠페인에 참가한 캐릭터들의 정보를 입력해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {characters.map((character, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">캐릭터 {index + 1}</h4>
                    {characters.length > 1 && (
                      <Button type="button" onClick={() => removeCharacter(index)} size="sm" variant="outline">
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>캐릭터명 *</Label>
                      <Input
                        value={character.name}
                        onChange={e => updateCharacter(index, 'name', e.target.value)}
                        placeholder="예: 실바나스"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>플레이어명 *</Label>
                      <Input
                        value={character.player}
                        onChange={e => updateCharacter(index, 'player', e.target.value)}
                        placeholder="예: 민수"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>클래스/직업 *</Label>
                      <Input
                        value={character.class}
                        onChange={e => updateCharacter(index, 'class', e.target.value)}
                        placeholder="예: 엘프 로그"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>캐릭터 썸네일 URL</Label>
                      <Input
                        value={character.thumbnail}
                        onChange={e => updateCharacter(index, 'thumbnail', e.target.value)}
                        placeholder="캐릭터 이미지 URL"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>캐릭터 설명</Label>
                    <Textarea
                      value={character.description}
                      onChange={e => updateCharacter(index, 'description', e.target.value)}
                      placeholder="캐릭터의 성격, 배경, 특징 등을 간단히 설명해주세요."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 세션 로그들 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  세션 로그들 (비밀글)
                </div>
                <Button type="button" onClick={addSubPost} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  세션 추가
                </Button>
              </CardTitle>
              <CardDescription>각 세션별로 로그를 작성해주세요. 비밀번호를 입력한 사용자만 볼 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subPosts.map((subPost, index) => (
                <div key={subPost.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      세션 {index + 1}
                    </h4>
                    {subPosts.length > 1 && (
                      <Button type="button" onClick={() => removeSubPost(index)} size="sm" variant="outline">
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>세션 제목 *</Label>
                      <Input
                        value={subPost.title}
                        onChange={e => updateSubPost(index, 'title', e.target.value)}
                        placeholder="예: 1세션: 황금 용 여관에서의 만남"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>세션 설명</Label>
                      <Input
                        value={subPost.description}
                        onChange={e => updateSubPost(index, 'description', e.target.value)}
                        placeholder="이 세션에서 일어난 일을 간단히 요약해주세요"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>세션 로그 *</Label>
                      <div className="text-xs text-muted-foreground mb-2 p-3 bg-muted/50 rounded">
                        <strong>대본 형식 작성 가이드:</strong>
                        <br />• <strong>대화:</strong> 캐릭터명: "대사 내용"
                        <br />• <strong>액션:</strong> *행동 설명*
                        <br />• <strong>내레이션:</strong> 상황 설명 (따옴표 없이)
                        <br />
                        <br />
                        <strong>예시:</strong>
                        <br />
                        황금빛 석양이 마을을 물들이던 저녁...
                        <br />
                        *실바나스가 구석 테이블에 조용히 앉는다.*
                        <br />
                        멜로디: "안녕하세요, 모든 분들!"
                      </div>
                      <Textarea
                        value={subPost.content}
                        onChange={e => updateSubPost(index, 'content', e.target.value)}
                        placeholder="대본 형식으로 세션 로그를 작성해주세요..."
                        rows={12}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              캠페인 저장 (Ctrl+S)
            </Button>
            <Link href="/">
              <Button type="button" variant="outline">
                취소 (ESC)
              </Button>
            </Link>
          </div>
        </form>
      </div>

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp shortcuts={shortcuts} />
    </div>
  );
}

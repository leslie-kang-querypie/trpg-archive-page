'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Plus, X, FileText, User, Shield, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Character, SubPost } from '@/types';
import { SessionInfo, Post } from '@/lib/types';

export default function WritePage() {
  const router = useRouter();
  
  // Post 기본 정보 상태
  const [postData, setPostData] = useState({
    title: '',
    summary: '',
    thumbnail: '',
    tags: [] as string[],
    password: '',
    isPrivate: true
  });

  // 세션 정보 상태
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    rule: '',
    scenario: '',
    author: '',
    playerCount: 1,
    overview: '',
    characters: [],
    highlight: ''
  });

  // 캐릭터 관리 상태
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: '',
    player: '',
    class: '',
    description: '',
    thumbnail: ''
  });
  const [editingCharacterIndex, setEditingCharacterIndex] = useState<number>(-1);

  // 서브포스트 관리 상태
  const [subPosts, setSubPosts] = useState<SubPost[]>([]);
  const [newSubPost, setNewSubPost] = useState<SubPost>({
    id: '',
    title: '',
    description: '',
    content: []
  });
  const [editingSubPostIndex, setEditingSubPostIndex] = useState<number>(-1);

  // 태그 입력 상태
  const [tagInput, setTagInput] = useState('');

  // 태그 추가 함수
  const addTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // 태그 제거 함수
  const removeTag = (tagToRemove: string) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 캐릭터 추가/수정 함수
  const handleCharacterSubmit = () => {
    if (!newCharacter.name.trim()) {
      alert('캐릭터 이름을 입력해주세요.');
      return;
    }

    const updatedCharacters = [...sessionInfo.characters];
    
    if (editingCharacterIndex >= 0) {
      // 수정
      updatedCharacters[editingCharacterIndex] = { ...newCharacter };
      setEditingCharacterIndex(-1);
    } else {
      // 추가
      updatedCharacters.push({ ...newCharacter });
    }
    
    setSessionInfo(prev => ({
      ...prev,
      characters: updatedCharacters,
      playerCount: updatedCharacters.length
    }));
    
    // 폼 초기화
    setNewCharacter({
      name: '',
      player: '',
      class: '',
      description: '',
      thumbnail: ''
    });
  };

  // 캐릭터 편집 시작
  const editCharacter = (index: number) => {
    setNewCharacter({ ...sessionInfo.characters[index] });
    setEditingCharacterIndex(index);
  };

  // 캐릭터 삭제
  const deleteCharacter = (index: number) => {
    const updatedCharacters = sessionInfo.characters.filter((_, i) => i !== index);
    setSessionInfo(prev => ({
      ...prev,
      characters: updatedCharacters,
      playerCount: updatedCharacters.length
    }));
  };

  // 서브포스트 추가/수정 함수
  const handleSubPostSubmit = () => {
    if (!newSubPost.id.trim() || !newSubPost.title.trim()) {
      alert('서브포스트 ID와 제목을 입력해주세요.');
      return;
    }

    const updatedSubPosts = [...subPosts];
    
    if (editingSubPostIndex >= 0) {
      // 수정
      updatedSubPosts[editingSubPostIndex] = { ...newSubPost };
      setEditingSubPostIndex(-1);
    } else {
      // 추가
      updatedSubPosts.push({ ...newSubPost });
    }
    
    setSubPosts(updatedSubPosts);
    
    // 폼 초기화
    setNewSubPost({
      id: '',
      title: '',
      description: '',
      content: []
    });
  };

  // 서브포스트 편집 시작
  const editSubPost = (index: number) => {
    setNewSubPost({ ...subPosts[index] });
    setEditingSubPostIndex(index);
  };

  // 서브포스트 삭제
  const deleteSubPost = (index: number) => {
    setSubPosts(prev => prev.filter((_, i) => i !== index));
  };

  // 서브포스트 JSON 파일 업로드
  const handleSubPostUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const subPostData = JSON.parse(content);
        
        // SubPost 형태인지 확인
        if (subPostData.id && subPostData.title && subPostData.content) {
          setSubPosts(prev => [...prev, subPostData]);
        } else {
          alert('올바른 서브포스트 JSON 형태가 아닙니다.');
        }
      } catch (error) {
        alert('파일 파싱에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  // 완성된 Post 다운로드
  const handleDownload = () => {
    if (!postData.title.trim()) {
      alert('포스트 제목을 입력해주세요.');
      return;
    }

    const completePost: Post = {
      id: Date.now(), // 임시 ID
      title: postData.title,
      summary: postData.summary,
      thumbnail: postData.thumbnail,
      tags: postData.tags,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      password: postData.password,
      isPrivate: postData.isPrivate,
      sessionInfo,
      subPosts
    };

    const blob = new Blob([JSON.stringify(completePost, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `trpg_post_${postData.title.replace(/\s+/g, '_')}_${completePost.date}.json`;
    link.click();
  };

  return (
    <>
      <Header title="TRPG 포스트 작성" showBackButton />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">새 포스트 작성</h1>
              <p className="text-muted-foreground">
                TRPG 캠페인 포스트를 작성하고 JSON 파일로 저장하세요.
              </p>
            </div>
            <Button 
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON 다운로드
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 포스트 기본 정보 */}
          <div className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  기본 정보
                </CardTitle>
                <CardDescription>
                  포스트의 기본 정보를 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="캠페인 제목을 입력하세요"
                  />
                </div>
                
                <div>
                  <Label htmlFor="summary">요약</Label>
                  <Textarea
                    id="summary"
                    value={postData.summary}
                    onChange={(e) => setPostData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="캠페인 요약을 입력하세요"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="thumbnail">썸네일 URL</Label>
                  <Input
                    id="thumbnail"
                    value={postData.thumbnail}
                    onChange={(e) => setPostData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="썸네일 이미지 URL"
                  />
                </div>

                <div>
                  <Label>태그</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="태그를 입력하세요"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {postData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="w-3 h-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-private"
                      checked={postData.isPrivate}
                      onCheckedChange={(checked) => setPostData(prev => ({ ...prev, isPrivate: checked }))}
                    />
                    <Label htmlFor="is-private" className="flex items-center gap-2">
                      {postData.isPrivate ? <Shield className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      비밀글
                    </Label>
                  </div>

                  {postData.isPrivate && (
                    <div>
                      <Label htmlFor="password">비밀번호</Label>
                      <Input
                        id="password"
                        type="password"
                        value={postData.password}
                        onChange={(e) => setPostData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="비밀번호를 설정하세요"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 세션 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>세션 정보</CardTitle>
                <CardDescription>
                  캠페인의 세션 정보를 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule">룰</Label>
                    <Input
                      id="rule"
                      value={sessionInfo.rule}
                      onChange={(e) => setSessionInfo(prev => ({ ...prev, rule: e.target.value }))}
                      placeholder="D&D 5e, CoC 등"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scenario">시나리오</Label>
                    <Input
                      id="scenario"
                      value={sessionInfo.scenario}
                      onChange={(e) => setSessionInfo(prev => ({ ...prev, scenario: e.target.value }))}
                      placeholder="시나리오명"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="author">작성자/GM</Label>
                  <Input
                    id="author"
                    value={sessionInfo.author}
                    onChange={(e) => setSessionInfo(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="GM 이름"
                  />
                </div>

                <div>
                  <Label htmlFor="overview">개요</Label>
                  <Textarea
                    id="overview"
                    value={sessionInfo.overview}
                    onChange={(e) => setSessionInfo(prev => ({ ...prev, overview: e.target.value }))}
                    placeholder="캠페인 개요를 입력하세요"
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="highlight">하이라이트</Label>
                  <Textarea
                    id="highlight"
                    value={sessionInfo.highlight}
                    onChange={(e) => setSessionInfo(prev => ({ ...prev, highlight: e.target.value }))}
                    placeholder="인상 깊었던 장면이나 하이라이트"
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 캐릭터 및 서브포스트 관리 */}
          <div className="space-y-6">
            {/* 캐릭터 관리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  캐릭터 관리
                </CardTitle>
                <CardDescription>
                  캠페인에 참여하는 캐릭터들을 추가하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 캐릭터 입력 폼 */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="char-name">캐릭터명 *</Label>
                      <Input
                        id="char-name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="캐릭터 이름"
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-player">플레이어</Label>
                      <Input
                        id="char-player"
                        value={newCharacter.player}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, player: e.target.value }))}
                        placeholder="플레이어 이름"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="char-class">클래스/직업</Label>
                      <Input
                        id="char-class"
                        value={newCharacter.class}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, class: e.target.value }))}
                        placeholder="전사, 마법사 등"
                      />
                    </div>
                    <div>
                      <Label htmlFor="char-thumbnail">아바타 URL</Label>
                      <Input
                        id="char-thumbnail"
                        value={newCharacter.thumbnail}
                        onChange={(e) => setNewCharacter(prev => ({ ...prev, thumbnail: e.target.value }))}
                        placeholder="캐릭터 이미지 URL"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="char-description">설명</Label>
                    <Textarea
                      id="char-description"
                      value={newCharacter.description}
                      onChange={(e) => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="캐릭터 설명"
                      className="min-h-[60px]"
                    />
                  </div>

                  <Button onClick={handleCharacterSubmit} className="w-full">
                    {editingCharacterIndex >= 0 ? '캐릭터 수정' : '캐릭터 추가'}
                  </Button>
                  
                  {editingCharacterIndex >= 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingCharacterIndex(-1);
                        setNewCharacter({
                          name: '',
                          player: '',
                          class: '',
                          description: '',
                          thumbnail: ''
                        });
                      }}
                      className="w-full"
                    >
                      취소
                    </Button>
                  )}
                </div>

                {/* 캐릭터 목록 */}
                <div className="space-y-2">
                  <Label>등록된 캐릭터 ({sessionInfo.characters.length}명)</Label>
                  {sessionInfo.characters.map((character, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{character.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {character.player} • {character.class}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editCharacter(index)}
                        >
                          편집
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteCharacter(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 서브포스트 관리 */}
            <Card>
              <CardHeader>
                <CardTitle>서브포스트 관리</CardTitle>
                <CardDescription>
                  각 회차별 로그를 서브포스트로 추가하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 서브포스트 입력 폼 */}
                <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="subpost-id">서브포스트 ID *</Label>
                      <Input
                        id="subpost-id"
                        value={newSubPost.id}
                        onChange={(e) => setNewSubPost(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="session_01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subpost-title">제목 *</Label>
                      <Input
                        id="subpost-title"
                        value={newSubPost.title}
                        onChange={(e) => setNewSubPost(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="1회차: 모험의 시작"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subpost-description">설명</Label>
                    <Textarea
                      id="subpost-description"
                      value={newSubPost.description}
                      onChange={(e) => setNewSubPost(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="회차 설명"
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubPostSubmit} className="flex-1">
                      {editingSubPostIndex >= 0 ? '서브포스트 수정' : '서브포스트 추가'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('subpost-upload')?.click()}
                    >
                      JSON 업로드
                    </Button>
                    <input
                      id="subpost-upload"
                      type="file"
                      accept=".json"
                      onChange={handleSubPostUpload}
                      className="hidden"
                    />
                  </div>
                  
                  {editingSubPostIndex >= 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditingSubPostIndex(-1);
                        setNewSubPost({
                          id: '',
                          title: '',
                          description: '',
                          content: []
                        });
                      }}
                      className="w-full"
                    >
                      취소
                    </Button>
                  )}
                </div>

                {/* 서브포스트 목록 */}
                <div className="space-y-2">
                  <Label>등록된 서브포스트 ({subPosts.length}개)</Label>
                  {subPosts.map((subPost, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{subPost.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {subPost.id} • {subPost.content.length}개 로그
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => editSubPost(index)}
                        >
                          편집
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteSubPost(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
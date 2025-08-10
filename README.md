# TRPG 로그 아카이브

TRPG(Table Role-Playing Game) 세션 로그를 저장하고 공유할 수 있는 웹 아카이브 플랫폼입니다.

## 주요 기능

### 📚 로그 아카이브

- **다양한 TRPG 시스템 지원**: 시노비가미, CoC, D&D 등
- **검색 및 필터링**: 룰, 인원수, 태그별 검색 가능
- **그리드/리스트 뷰**: 사용자 취향에 맞는 보기 모드
- **비공개 포스트**: 패스워드로 보호되는 민감한 로그

### 🛠️ 로그 작성 도구

- **Roll20 파싱**: 브라우저에서 Roll20 채팅 로그를 자동 파싱
- **지능형 메시지 분류**: IC(In Character), OOC(Out of Character), 시스템 메시지 자동 구분
- **실시간 편집**: 범위 선택을 통한 로그 편집 및 미리보기
- **캐릭터 매핑**: 발신자와 캐릭터 자동 매핑

### 🎭 세션 관리

- **캐릭터 정보**: 플레이어, 클래스, 설명, 썸네일 관리
- **세션 정보**: 룰, 시나리오, 작가, 하이라이트 등
- **서브포스트**: 여러 세션으로 구성된 캠페인 지원

### 🎨 사용자 경험

- **다크/라이트 테마**: 테마 전환 지원
- **키보드 단축키**: 빠른 네비게이션 (/, V, T, R 등)
- **반응형 디자인**: 모바일부터 데스크탑까지
- **페이지네이션**: 대용량 로그 목록 효율적 관리

## 기술 스택

- **프레임워크**: Next.js 15 (React 19)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI
- **패키지 매니저**: pnpm
- **배포**: Vercel

## 시작하기

### 개발 환경 설정

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 브라우저에서 http://localhost:3000 접속
```

### 빌드 및 배포

```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 타입 검사
pnpm type-check

# 린트 및 포맷팅
pnpm lint
pnpm format
```

## 프로젝트 구조

```
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API 라우트 (포스트 관리)
│   ├── post/[id]/         # 개별 포스트 페이지
│   └── write/             # 로그 작성 도구
│       ├── parse/         # Roll20 로그 파싱
│       ├── edit/          # 로그 편집
│       ├── session/       # 포스트 관리
│       └── info/          # 작성 가이드
├── components/            # 재사용 가능한 컴포넌트
│   ├── log-viewer/        # 로그 뷰어 컴포넌트
│   ├── parse/             # 파싱 관련 컴포넌트
│   └── ui/                # 기본 UI 컴포넌트
├── data/                  # JSON 데이터 저장소
│   └── posts/             # 포스트별 데이터
├── lib/                   # 유틸리티 및 타입 정의
└── hooks/                 # 커스텀 React 훅
```

## 데이터 구조

### 포스트 (Post)

```typescript
interface Post {
  id: number;
  title: string;
  summary: string;
  thumbnail: string;
  tags: string[];
  date: string;
  password: string; // SHA-256 해시
  isPrivate: boolean;
  oocPassword: string; // OOC 구간 접근 패스워드
  sessionInfo: SessionInfo;
  subPosts: SubPost[];
}
```

### 세션 정보 (SessionInfo)

```typescript
interface SessionInfo {
  rule: string; // TRPG 룰 (예: "시노비가미 RPG")
  scenario: string; // 시나리오 명
  author: string; // 시나리오 작가
  playerCount: number; // 플레이어 수
  overview: string; // 세션 개요
  characters: Character[]; // 캐릭터 목록
  highlight: string; // 하이라이트
}
```

## 사용법

### 1. 로그 파싱

1. `/write/parse`에서 Roll20 브라우저 스크립트 실행
2. 채팅 로그 데이터 복사 & 붙여넣기
3. 발신자-캐릭터 매핑 설정
4. JSON 데이터 생성

### 2. 로그 편집

1. `/write/edit`에서 파싱된 데이터 로드
2. 범위 선택으로 필요한 구간 편집
3. 실시간 미리보기 확인
4. SubPost JSON 출력

### 3. 포스트 작성

1. `/write/session`에서 세션 정보 입력
2. 캐릭터 정보 및 썸네일 설정
3. 서브포스트 통합 관리
4. 최종 포스트 생성

## 키보드 단축키

- `/`: 검색창 포커스
- `V`: 그리드/리스트 뷰 전환
- `T`: 태그 필터 열기
- `R`: 필터 초기화
- `W`: 작성 페이지로 이동
- `H`: 홈으로 이동
- `?`: 단축키 도움말 표시

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 포크 및 브랜치 생성
3. 변경사항 커밋
4. 풀 리퀘스트 생성

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 배포

현재 Vercel을 통해 배포되며, `main` 브랜치에 푸시될 때 자동으로 배포됩니다.

**배포 URL**: [https://vercel.com/sakang07s-projects/trpg-archive-page](https://vercel.com/sakang07s-projects/trpg-archive-page)

# 자동출석 (Attendance) — 모바일 웹앱

발표용 프로토타입(`legacy/`)이 소개하던 **출석체크 앱**을 실제 동작하는 모바일 기준 웹앱으로 구현한 프로젝트입니다.
디자인은 프로토타입과 동일한 톤(딥블루 `#004386` / 딥베리 `#A6165F`)을 유지했습니다.

- **프론트엔드** — React + Vite + TypeScript (페이지별 `.tsx` + `.css` 분리)
- **백엔드** — Node.js + Express (기능별 라우트/컨트롤러/서비스 분리)
- **저장소** — 의존성 없는 JSON 파일 저장소 (`server/data/db.json`, 네이티브 빌드 불필요)
- **단일 인스턴스** — 빌드된 프론트엔드를 Express 가 같은 포트에서 함께 서빙

```
p2/
├─ client/                 # React + Vite + TS 프론트엔드
│  └─ src/
│     ├─ pages/            # 페이지별 tsx + css (Login, Signup, Classes, Attend, MyPage,
│     │                    #                     Lectures, LiveSession, Overview, Late)
│     ├─ components/       # 공통 UI (PageHeader, TabLayout, ui, icons, Face …)
│     ├─ context/          # AuthContext (JWT 세션)
│     └─ lib/              # api 클라이언트, 타입, 포맷 유틸
├─ server/                 # Node + Express 백엔드
│  └─ src/
│     ├─ routes/           # auth · users · lectures · sessions
│     ├─ controllers/      # 기능별 핸들러
│     ├─ services/         # 출석 도메인 로직
│     ├─ middleware/       # 인증 / 에러
│     ├─ db/               # JSON 저장소 + 시드
│     └─ utils/            # jwt · password · time · id …
└─ legacy/                 # 발표용 프로토타입 원본 (참고용 보관)
```

## 빠른 시작

### 1. 의존성 설치 (최초 1회)
```bash
npm run install:all
```

### 2-A. 운영 모드 — 단일 인스턴스 (프론트 빌드 + 한 포트에서 서빙)
```bash
npm run build      # client/dist 생성
npm start          # http://localhost:4000  (API + 화면 모두)
```
브라우저에서 **http://localhost:4000** 접속.

> 한 줄로: `npm run build:start`

### 2-B. 개발 모드 — 핫리로드 (터미널 2개)
```bash
npm run dev:server   # http://localhost:4000  (API)
npm run dev:client   # http://localhost:5173  (Vite, /api 는 4000 으로 프록시)
```
개발 중에는 **http://localhost:5173** 로 접속합니다.

## 데모 계정 (비밀번호 공통 `demo1234`)

| 역할 | 이메일 | 설명 |
|------|--------|------|
| 학생 | `student@demo.com` | 김지훈 · 인공지능 개론 등 4과목 수강, 진행 중 출석 세션 존재 |
| 교수자 | `prof@demo.com` | 박재현 · 4개 강의 담당 |

로그인 화면의 **학생 데모 / 교수자 데모** 버튼으로 자동 입력됩니다.
회원가입에서 새 학생/교수자 계정도 만들 수 있습니다.

## 핵심 흐름

**학생** — 로그인 → 오늘 수업 → (진행 중인 수업) 자동 출석
- 블루투스/위치/네트워크 상태가 모두 ON 이면 자동 출석 성공, 하나라도 OFF 면 실패 화면 + 원인 안내
- 자동 출석이 어려우면 교수자 화면의 **6자리 인증번호** 로도 출석 가능
- 시작 후 일정 시간(기본 지각 10분 / 결석 30분)에 따라 출석·지각·결석 자동 판정

**교수자** — 로그인 → 오늘 강의 → 출석 시작 → 진행 현황(실시간 폴링)
- 인증번호 표시, 실시간 출석 인원/피드, 출석률
- 출석 마감 시 미출석자는 자동 결석 처리
- 전체 현황: 도넛 통계 · 탭 필터 · 학생별 출결 수동 수정 · **CSV 내보내기**
- 지각 학생 관리(기준/평균 지각)

## 데이터 초기화
```bash
npm run seed:reset      # server/data/db.json 을 비우고 데모 데이터 재생성
```

## 환경 변수 (server/.env, 선택)
`server/.env.example` 참고 — `PORT`, `JWT_SECRET`, `JWT_EXPIRES`, `DATA_FILE`.

## 배포 메모 (단일 인스턴스)
1. `npm run install:all`
2. `npm run build`  → `client/dist` 생성
3. `JWT_SECRET` 등 환경변수 설정 후 `npm start`
4. Express(`server`)가 `client/dist` 정적 파일과 `/api` 를 같은 포트에서 서빙하므로
   인스턴스(또는 컨테이너) 하나로 동작합니다. 리버스 프록시는 `PORT` 로만 연결하면 됩니다.

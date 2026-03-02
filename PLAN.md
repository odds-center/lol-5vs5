# LoL 5:5 내전 팀 짜기 사이트 — 개발 계획서 (업데이트)

## 1. 프로젝트 개요

- **목적**: 롤 내전 시 MMR 기반 5:5 팀 분배 및 역할 배정
- **서비스명**: LoL 5vs5 내전 (부제: 관악구 피바라기)
- **스택**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **배포**: Vercel 무료 호스팅, **클라이언트 전용** (API Route / 서버 DB 미사용)
- **저장소**: 모든 데이터 **localStorage** — 새로고침 후에도 유지

---

## 2. 핵심 요구사항 정리 (구현 반영)

| # | 요구사항 | 구현 내용 |
|---|----------|-----------|
| 1 | MMR 기반 팀 분배 | **팀 나누기**: MMR 스네이크 드래프트(1·2위→각 팀, 3·4위→각 팀 …). **다시 나누기**: 참가자 10명 랜덤 셔플 후 앞5/뒤5로 1팀·2팀 재구성 |
| 2 | 5:5 고정 | 정확히 10명 입력란 고정, 각 팀 5명 |
| 3 | 역할군 | 탑, 정글, 미드, 원딜, 서폿. 참가자별 선호 선택 가능(선택). 역할당 최대 2명 선택 제한 |
| 4 | 역할 랜덤 배정 | 팀 확정 후 「역할 랜덤 배정」으로 팀 내 5명을 5역할에 1:1 랜덤 배정 |
| 5 | localStorage 영속화 | `lol-5vs5-players`, `lol-5vs5-last-assignment` 키로 저장·복원 |
| 6 | UI/UX | 탭(참가자/결과), LoL 테마, 역할 아이콘(public/roles/*.svg) |

---

## 3. 데이터 모델 (localStorage)

### 3.1 저장할 데이터 구조

```ts
type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

interface Player {
  id: string;              // slot-0 ~ slot-9
  name: string;
  mmr: number;
  rolePreference?: Role | '';  // 선호 역할 (빈 문자열 = 미정)
}

interface TeamAssignment {
  teamA: Player[];
  teamB: Player[];
  rolesA: Record<Role, Player>;
  rolesB: Record<Role, Player>;
  createdAt: number;
}
```

### 3.2 localStorage 키

| 키 | 용도 |
|----|------|
| `lol-5vs5-players` | 플레이어 10슬롯 `Player[]` (항상 10개, slot-0~slot-9) |
| `lol-5vs5-last-assignment` | 마지막 팀/역할 배정 결과 `TeamAssignment` |

---

## 4. 페이지/화면 구성 (현재 구현)

### 4.1 단일 페이지, 탭 구분

- **참가자 탭**
  - 10행 고정 테이블: `#` | 닉네임 | MMR | 역할군
  - 역할군: select (미정 / 탑 / 정글 / 미드 / 원딜 / 서폿), **라인당 최대 2명** 제한
  - **팀 나누기** 버튼 (유효 10명일 때만 활성) → 클릭 시 결과 탭으로 전환

- **결과 탭**
  - 팀 A / 팀 B 카드: MMR 합계·평균, 역할별 명단(아이콘+이름+MMR)
  - **다시 나누기**: 참가자 명단 10명 랜덤 셔플 후 1팀·2팀 재구성 (누를 때마다 다른 조합)
  - **역할 랜덤 배정**: 팀 유지, 팀 내 역할만 랜덤 재배정
  - **참가자 수정**: 참가자 탭으로 이동

### 4.2 스타일

- LoL 느낌: 다크 배경, 골드 포인트, 팀 A 블루/팀 B 레드 톤
- 역할 아이콘: `public/roles/top.svg`, `jungle.svg`, `mid.svg`, `bottom.svg`, `support.svg`

---

## 5. 핵심 로직 (구현 기준)

### 5.1 팀 나누기 (최초 1회)

- **함수**: `divideTeams(players)` (MMR 스네이크)
- **로직**: 10명을 MMR 내림차순 정렬 후, 인덱스 0,2,4,6,8 → 1팀, 1,3,5,7,9 → 2팀
- **역할**: 동시에 `createEmptyAssignment`로 팀별 역할 초기 배정(선호 반영 후 나머지 랜덤)

### 5.2 다시 나누기

- **함수**: `divideTeamsRandom(players)`
- **로직**: 10명 Fisher–Yates 셔플 후 앞 5명 → 1팀, 뒤 5명 → 2팀. 참가자 명단(`playersRef`) 기준으로 호출
- **목적**: 누를 때마다 다른 1팀·2팀 조합

### 5.3 역할 랜덤 배정

- **함수**: `assignRoles(team)` (팀 5명 → 5역할 1:1 랜덤)
- **호출 시점**: 「역할 랜덤 배정」 클릭 시. 선호 역할 무시, 팀 내 완전 랜덤

---

## 6. 기술 구현 요약

- **Next.js 14** App Router, `'use client'`에서만 localStorage 접근, 마운트 후 로드
- **반응형**: Tailwind flex/grid, 탭·테이블·카드 레이아웃
- **역할 아이콘**: `components/RoleIcon.tsx`에서 `public/roles/*.svg` 매핑 (adc → bottom.svg)

---

## 7. 폴더 구조 (현재)

```
lol-5vs5/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ParticipantSlots.tsx
│   ├── RoleIcon.tsx
│   └── TeamDivisionResult.tsx
├── lib/
│   ├── storage.ts
│   ├── teamAlgorithm.ts    # divideTeams, divideTeamsRandom
│   └── roleAssignment.ts   # assignRoles, assignRolesWithPreferences
├── public/
│   └── roles/
│       ├── top.svg
│       ├── jungle.svg
│       ├── mid.svg
│       ├── bottom.svg
│       └── support.svg
├── types/
│   └── index.ts
├── PLAN.md
├── README.md
└── package.json
```

---

## 8. 배포 (Vercel)

- 저장소 연결 후 자동 빌드
- 환경 변수 불필요
- `next build` 로컬 확인 후 푸시

---

이 문서는 현재 구현 상태를 반영한 계획서입니다.  
추가·변경 요구가 있으면 요구사항을 반영해 계획과 구현을 함께 수정하면 됩니다.

# MAKER — 나이롱뽕 게임 개발 에이전트

## 역할
`bbong/game.html`(손풀기/나이롱뽕 게임)과 `bbong/index.html`(점수판)을 **생성·수정·배포·커밋**하는 역할.

## 책임 범위
- 기능 추가, 버그 수정, UI 개선, 게임 룰 구현
- 변경 사항 git commit (commit message: 한국어, 변경 내용 명확히)
- GitHub main 브랜치 push → Vercel 자동 배포 확인
- 작업 전/후 REVIEWER에게 검증 요청

## 작업 원칙
1. `game.html` 한 파일에 HTML+CSS+JS 전부 포함 (base64 화투 이미지 포함으로 파일 1.6MB)
2. 전역 상태는 `GS` 객체 하나로 관리
3. JS는 ES5 호환 스타일 유지 (var, function, for 루프)
4. 수정 후 반드시 REVIEWER에게 검증 의뢰
5. 리뷰 통과 후 커밋·배포

## 주요 파일 구조
```
bbong/
  game.html      — 손풀기 게임 (메인 작업 파일)
  index.html     — 점수판 (iframe으로 game.html 호출)
  wallpaper01.jpg
MAKER.md
REVIEWER.md
```

## 게임 상태(GS) 주요 필드
| 필드 | 설명 |
|------|------|
| `GS.players` | 플레이어 배열 (index 0 = 인간) |
| `GS.hands[i]` | i번 플레이어 패 (카드 배열) |
| `GS.deck` | 남은 덱 |
| `GS.discard` | 버린 패 더미 |
| `GS.bagaji` | 활성 바가지 배열 `[{player, month}]` |
| `GS.phase` | 현재 페이즈: draw/discard/bbong-window/bbong-extra/natural-3/result |
| `GS.cur` | 현재 차례 플레이어 인덱스 |
| `GS.deckRecycled` | 덱 재섞기 사용 여부 (1회만 허용) |
| `GS.stopBy` | 스톱/종료 선언자 인덱스 |
| `GS.bagajiTriggeredBy` | 바가지 밟은 플레이어 인덱스 |
| `GS.naturals` | 자연 선언한 플레이어 인덱스 배열 |
| `GS.firstTurn` | 첫 턴 여부 (스톱 불가 조건) |

## 나이롱뽕 룰 요약
- 화투 48장, 2~6인
- 선은 6장, 나머지는 5장으로 시작
- 자기 차례: 덱에서 1장 뽑아 6장 → 특수패 체크 후 1장 버려 5장으로
- **특수패 (6장 보유 시):**
  - 총통: 같은 달 4장 → 즉시 종료, 마이너스
  - 60부작: 합계 ≥ 60 → 즉시 종료, 마이너스
  - 또이또이: 쌍 3세트 (2+2+2) → 즉시 종료
  - 100부작: 합계 ≤ 10 → 즉시 종료
  - 스트레이트: 연속 6달 → 즉시 종료
  - 자연: 같은 달 3장 보유 → 3장 버리고 나머지 1장 더 버리기
- **뽕:** 누군가 버린 패와 같은 달 2장 보유 시 선언
  - 3장 버리고(2장 매칭+1장 추가 버리기) 2장 남김
- **바가지:** 2장이 쌍일 때 함정 설치, 다른 플레이어가 그 달을 버리면 발동
- **스톱:** 2명 이상 2장 상태일 때 선언 가능 (첫 턴 불가)
- **덱 소진:** 버린 패 재섞기 1회 허용, 그 후 소진 시 라운드 종료

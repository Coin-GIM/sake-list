const XLSX = require('xlsx');

const PLAYERS = ['황','곤','이셔뷩','몽끼','짐서방','뚜부'];

// ── Sheet 1: 게임목록 ──────────────────────────────────────
const gameListHeader = [
  '게임ID','날짜','장소','참여인원','총라운드',
  ...PLAYERS.map(p => p + '_합계'),
  '1위','2위','3위','종료여부'
];

// ── Sheet 2: 라운드기록 ────────────────────────────────────
const roundHeader = [
  '게임ID','날짜','장소','라운드번호',
  ...PLAYERS,
  '라운드승자'
];

// ── Sheet 3: 플레이어통계 ──────────────────────────────────
// COUNTIF / SUMIF 수식으로 게임목록·라운드기록 시트 참조
const statHeader = [
  '플레이어','참여게임수',
  '게임_1위','게임_2위','게임_3위',
  '라운드_1위','라운드_2위','라운드_3위',
  '총점합계','게임당평균점수'
];

const statRows = PLAYERS.map((p, i) => {
  const row = i + 2; // 데이터 시작 행(헤더=1)
  return [
    p,
    { f: `COUNTIF(게임목록!H${row}:H${row},"*")` }, // 참여게임수 (수동 입력 필요)
    { f: `COUNTIF(게임목록!L:L,A${row})` },          // 게임 1위
    { f: `COUNTIF(게임목록!M:M,A${row})` },          // 게임 2위
    { f: `COUNTIF(게임목록!N:N,A${row})` },          // 게임 3위
    { f: `COUNTIF(라운드기록!L:L,A${row})` },        // 라운드 1위
    '',                                                // 라운드 2위 (수동)
    '',                                                // 라운드 3위 (수동)
    { f: `SUMIF(게임목록!L:L,A${row},게임목록!F:F)+SUMIF(게임목록!M:M,A${row},게임목록!G:G)` },
    ''
  ];
});

// 실제로는 플레이어 합계 열이 F~K(6명)이므로 수식을 단순화
// 아래는 각 플레이어 행별로 합계 열 인덱스를 고정하여 생성
const statRowsSimple = PLAYERS.map((p, i) => {
  const colLetter = String.fromCharCode(70 + i); // F=황, G=곤, H=이셔뷩, I=몽끼, J=짐서방, K=뚜부
  const r = i + 2;
  return [
    p,
    { f: `COUNTA(게임목록!B:B)-1` },               // 전체 게임 수 (참여 여부 미구분)
    { f: `COUNTIF(게임목록!L:L,"${p}")` },          // 게임 1위
    { f: `COUNTIF(게임목록!M:M,"${p}")` },          // 게임 2위
    { f: `COUNTIF(게임목록!N:N,"${p}")` },          // 게임 3위
    { f: `COUNTIF(라운드기록!L:L,"${p}")` },        // 라운드 1위
    { f: `COUNTIF(라운드기록!L:L,"${p}_2위")` },    // 라운드 2위 (앱에서 기록 시)
    '',
    { f: `SUM(게임목록!${colLetter}:${colLetter})-게임목록!${colLetter}1` }, // 전체 합계
    { f: `IF(B${r}=0,"",ROUND(I${r}/B${r},1))` }   // 게임당 평균
  ];
});

// ── 워크북 생성 ────────────────────────────────────────────
const wb = XLSX.utils.book_new();

// Sheet 1
const ws1 = XLSX.utils.aoa_to_sheet([
  gameListHeader,
  // 예시 데이터 행 (빈 행으로 시작)
]);
// 열 너비 설정
ws1['!cols'] = [
  {wch:14},{wch:12},{wch:18},{wch:8},{wch:8},
  {wch:8},{wch:8},{wch:10},{wch:8},{wch:10},{wch:8},
  {wch:10},{wch:10},{wch:10},{wch:8}
];
XLSX.utils.book_append_sheet(wb, ws1, '게임목록');

// Sheet 2
const ws2 = XLSX.utils.aoa_to_sheet([roundHeader]);
ws2['!cols'] = [
  {wch:14},{wch:12},{wch:18},{wch:10},
  {wch:6},{wch:6},{wch:10},{wch:8},{wch:10},{wch:8},
  {wch:12}
];
XLSX.utils.book_append_sheet(wb, ws2, '라운드기록');

// Sheet 3
const ws3 = XLSX.utils.aoa_to_sheet([statHeader, ...statRowsSimple]);
ws3['!cols'] = [
  {wch:10},{wch:10},{wch:10},{wch:10},{wch:10},
  {wch:10},{wch:10},{wch:10},{wch:12},{wch:14}
];
XLSX.utils.book_append_sheet(wb, ws3, '플레이어통계');

// Sheet 4: 데이터 (앱 게임 데이터 JSON 저장셀)
const ws4 = XLSX.utils.aoa_to_sheet([['[]']]);
ws4['!cols'] = [{wch:20}];
XLSX.utils.book_append_sheet(wb, ws4, '데이터');

// ── 파일 저장 ──────────────────────────────────────────────
const filename = '나이롱뽕_게임기록.xlsx';
XLSX.writeFile(wb, filename);
console.log('생성 완료:', filename);

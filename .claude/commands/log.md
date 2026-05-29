---
description: 일일 작업 로그를 생성/갱신합니다. 사용법: /log [추가 메모]
---

오늘의 작업을 `docs/logs/YYYY-MM-DD.md`에 정리합니다.

## 핵심 원칙

- 이 명령은 **읽기 전용 명령이 아닙니다.**
- 마지막에는 반드시 `docs/logs/YYYY-MM-DD.md`를 `Write` 또는 `Edit`로 생성/갱신합니다.
- 수집 결과를 사용자에게 보여주기만 하고 종료하면 실패입니다.
- 기존 일일 로그가 있으면 덮어쓰기 전에 내용을 읽고, 중복되지 않게 병합합니다.
- 세션 원문(`docs/logs/sessions/*.md`)은 요약 근거로만 사용하고, 민감정보가 있으면 일일 로그에 옮기지 않습니다.

## 수행

1. 오늘 날짜와 대상 파일 확인 (`TODAY=$(date +"%Y-%m-%d")`, `DAILY_FILE="docs/logs/${TODAY}.md"`)
2. `docs/logs/`가 없으면 생성
3. `DAILY_FILE`이 없으면 `_DAILY_TEMPLATE.md` 또는 기본 양식으로 **새 파일 생성**
4. 다음 정보 수집: 오늘 세션 목록, 변경/완료 티켓, 회고 채워진 티켓, micro-fixes 추가분, git commit 목록, `/log` 뒤 추가 메모
5. 수집 근거를 짧게 보여주고 추가 내용 확인
6. 응답 유무와 관계없이 최종적으로 `DAILY_FILE`을 생성/갱신

## 1차 파일 준비

```bash
TODAY=$(date +"%Y-%m-%d")
DAILY_FILE="docs/logs/${TODAY}.md"
mkdir -p docs/logs docs/logs/sessions

if [ ! -f "$DAILY_FILE" ]; then
  if [ -f docs/logs/_DAILY_TEMPLATE.md ]; then
    cp docs/logs/_DAILY_TEMPLATE.md "$DAILY_FILE"
  else
    cat > "$DAILY_FILE" <<EOF
# ${TODAY} 작업 로그

## 오늘 한 일
- 

## 완료/진행 티켓
- 

## 만난 트러블
- 

## 학습/결정 사항
- 

## 내일 할 일
- 

## 근거

### 오늘 커밋

### 오늘 변경된 티켓

### 오늘 세션
EOF
  fi
fi
```

## 수집 명령

```bash
TODAY=$(date +"%Y-%m-%d")

printf "\n## sessions\n"
ls docs/logs/sessions/session-${TODAY}* 2>/dev/null || true

printf "\n## changed tickets\n"
git log --since="00:00" --name-only --pretty=format: -- docs/tickets/ 2>/dev/null | sort -u || true

printf "\n## ticket retrospectives\n"
git log --since="00:00" -p -- docs/tickets/ 2>/dev/null | grep -A4 "^+## 회고" || true

printf "\n## commits\n"
git log --since="00:00" --oneline 2>/dev/null || true
```

## 작성 규칙

수집 후 다음 형식으로 `docs/logs/YYYY-MM-DD.md`를 갱신합니다.

```markdown
# <YYYY-MM-DD> 작업 로그

## 오늘 한 일
- <완료/진행한 핵심 작업 요약>

## 완료/진행 티켓
- <티켓 ID와 상태. 없으면 "없음">

## 만난 트러블
- <문제와 해결. 없으면 "없음">

## 학습/결정 사항
- <오늘 확정한 설계/운영 결정. 없으면 "없음">

## 내일 할 일
- <후속 작업. 없으면 "미정">

## 근거

### 오늘 커밋
<git log --since="00:00" --oneline 결과 요약>

### 오늘 변경된 티켓
<docs/tickets 변경 목록 요약>

### 오늘 세션
<docs/logs/sessions/session-${TODAY}* 목록 요약>
```

## 마무리

- `DAILY_FILE`을 실제로 생성/갱신했는지 확인합니다.
- 마지막 응답에는 갱신된 파일 경로와 핵심 요약 3~5줄만 보여줍니다.
- `/log` 뒤에 사용자가 적은 문구는 "사용자 메모"로 반영합니다.

> ⚠️ 이 프로젝트는 풀팀 모드라 micro 흐름이 없으므로 micro-fixes 수집은 보통 생략합니다.

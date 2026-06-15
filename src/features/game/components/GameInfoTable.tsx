import type { JSX } from 'react';
import { css, cx } from 'styled-system/css';
import {
  type GameDetail,
  mapPlayModeLabels,
} from '@/features/game/api/gameDetail';

// 게임 정보 테이블(게임 상세 페이지 4014:3937).
// dl/dt/dd 구조 — 라벨(dt)은 fg.subtle 고정폭, 값(dd)은 fg.default.
// 컨테이너: bg.surface 반투명 + border.default + radius xl(~10px) + 좌우 24·상하 18 패딩.
// 항목: 장르 / 플레이 모드 / 연령 등급 / 한글 지원(자막·음성·UI) / 최소 사양 / 권장 사양.
// 사양 값은 fg.subtle. semantic token만 사용, 타 도메인 import 금지(이 파일은 gameDetail만 import).

const styles = {
  // 테이블 컨테이너 — 반투명 surface + 보더 + 라운드 + 패딩(좌우 24·상하 18).
  box: css({
    bg: 'bg.surface',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 'xl', // 10px
    px: '6', // 24px
    py: '4.5', // 18px
  }),
  // 행 묶음(dl) — 각 행(라벨·값 쌍) 사이 12px 간격.
  list: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3', // 12px
    m: '0',
  }),
  // 한 행 = 라벨(dt) + 값(dd) 가로 배치. 값이 길면 줄바꿈되도록 라벨만 상단 정렬.
  row: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
  }),
  // 라벨(dt) — 고정폭 88px, 12px, fg.subtle.
  label: css({
    flexShrink: 0,
    w: '88px',
    fontSize: 'sm', // 12px
    color: 'fg.subtle',
    m: '0',
  }),
  // 값(dd) — 12px, fg.default. 남은 폭을 차지하고 0폭까지 줄어들 수 있게.
  value: css({
    flex: '1',
    minW: '0',
    fontSize: 'sm', // 12px
    color: 'fg.default',
    m: '0',
  }),
  // 한글 지원 값 묶음 — 자막/음성/UI 각 항목을 가로 나열(폭 부족 시 줄바꿈).
  koreanWrap: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '3',
  }),
  // 한글 지원 단일 항목(라벨 + 지원 점).
  koreanItem: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.5',
  }),
  // 지원 여부 점 — 6px 원. 지원=success / 미지원=danger.
  dot: css({
    w: '1.5', // 6px
    h: '1.5',
    borderRadius: 'full',
    flexShrink: 0,
  }),
  // 사양 값(최소/권장) — 값은 fg.subtle로 한 단계 낮춘다.
  specValue: css({
    color: 'fg.subtle',
  }),
};

// 한글 지원 점 색 — 지원=success.default(초록), 미지원=danger.default(빨강).
const dotColorClass = {
  on: css({ bg: 'success.default' }),
  off: css({ bg: 'danger.default' }),
};

// 사양(SystemSpec)을 한 줄 문자열로 합친다. 빈 값은 제외하고 " / "로 join.
function joinSpec(spec: GameDetail['systemRequirements']['minimum']): string {
  return [spec.os, spec.processor, spec.memory, spec.graphics, spec.storage]
    .filter(Boolean)
    .join(' / ');
}

// 한글 지원 단일 항목 렌더 — 라벨 + 지원 여부 점.
// supported: 음성/UI는 해당 언어 목록에 '한국어' 포함 여부, 자막은 koreanSub 그대로 사용.
function KoreanSupportItem({
  label,
  supported,
}: {
  label: string;
  supported: boolean;
}) {
  return (
    <span className={styles.koreanItem}>
      <span>{label}</span>
      <span
        className={cx(
          styles.dot,
          supported ? dotColorClass.on : dotColorClass.off,
        )}
        // 색만으로 정보가 전달되지 않도록 지원 여부를 보조 텍스트로 노출.
        aria-label={supported ? '지원' : '미지원'}
        role="img"
      />
    </span>
  );
}

export interface GameInfoTableProps {
  detail: GameDetail;
}

export function GameInfoTable({ detail }: GameInfoTableProps): JSX.Element {
  const {
    genres,
    playModes,
    ageRating,
    koreanSub,
    audioLanguages,
    interfaceLanguages,
    systemRequirements,
  } = detail;

  // 음성/UI 한글 지원 여부 — 언어 목록에 '한국어'가 포함되어 있으면 지원.
  const audioKorean = audioLanguages.includes('한국어');
  const interfaceKorean = interfaceLanguages.includes('한국어');

  return (
    <div className={styles.box}>
      <dl className={styles.list}>
        {/* 장르 — 배열을 ' · '로 join. */}
        <div className={styles.row}>
          <dt className={styles.label}>장르</dt>
          <dd className={styles.value}>{genres.join(' · ') || '미기재'}</dd>
        </div>

        {/* 플레이 모드 — 코드 배열을 PLAY_MODE_LABELS로 라벨 변환 후 ' · ' join. */}
        <div className={styles.row}>
          <dt className={styles.label}>플레이 모드</dt>
          <dd className={styles.value}>
            {mapPlayModeLabels(playModes).join(' · ') || '미기재'}
          </dd>
        </div>

        {/* 연령 등급 — 원문 그대로. */}
        <div className={styles.row}>
          <dt className={styles.label}>연령 등급</dt>
          <dd className={styles.value}>{ageRating || '미기재'}</dd>
        </div>

        {/* 한글 지원 — 자막(koreanSub)·음성(audioLanguages)·UI(interfaceLanguages) 각 지원 점. */}
        <div className={styles.row}>
          <dt className={styles.label}>한글 지원</dt>
          <dd className={styles.value}>
            <span className={styles.koreanWrap}>
              <KoreanSupportItem label="자막" supported={koreanSub} />
              <KoreanSupportItem label="음성" supported={audioKorean} />
              <KoreanSupportItem label="UI" supported={interfaceKorean} />
            </span>
          </dd>
        </div>

        {/* 최소 사양 — os/processor/memory/graphics/storage join. 값은 fg.subtle. */}
        <div className={styles.row}>
          <dt className={styles.label}>최소 사양</dt>
          <dd className={cx(styles.value, styles.specValue)}>
            {joinSpec(systemRequirements.minimum) || '미기재'}
          </dd>
        </div>

        {/* 권장 사양 — 동일 join. 값은 fg.subtle. */}
        <div className={styles.row}>
          <dt className={styles.label}>권장 사양</dt>
          <dd className={cx(styles.value, styles.specValue)}>
            {joinSpec(systemRequirements.recommended) || '미기재'}
          </dd>
        </div>
      </dl>
    </div>
  );
}

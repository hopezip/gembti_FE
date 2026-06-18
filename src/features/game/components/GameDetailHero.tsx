import { css, cx } from 'styled-system/css';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { pageContainer, pageGutter } from '@/components/layout/PageContainer';
import {
  type GameDetail,
  mapPlayModeLabels,
} from '@/features/game/api/gameDetail';

export interface GameDetailHeroProps {
  detail: GameDetail;
}

// 게임 상세 Hero (REC-DET-FE-001, Figma 4014:3959).
// 풀블리드 커버 배경 + 좌→우 어두운 그라데이션 오버레이 위에, 좌측 정렬 콘텐츠를 PageContainer 폭(1232px)으로 둔다.
// 구성: 카테고리 칩(외곽선 pill) → 제목 → 별점 → 메타 3컬럼(개발/퍼블리셔·발행일·플레이모드) → 가격블록 → 구매 버튼.
// semantic token만 사용, 다른 도메인 import 없음. 런타임 이미지 URL만 style 인라인(Panda 정적 추출 불가).
// 배경 fallback: themeImageUrl→bannerUrl→thumbnailUrl→bg.surfaceRaised(이미지 모두 없을 때).
export function GameDetailHero({ detail }: GameDetailHeroProps) {
  const {
    title,
    categories,
    rating,
    developer,
    publisher,
    releaseDate,
    playModes,
    priceInfo,
    onSale,
    steamUrl,
    themeImageUrl,
    bannerUrl,
    thumbnailUrl,
  } = detail;

  // 배경 이미지 우선순위 — 썸네일(헤더 이미지) 우선, 없으면 theme/banner. 셋 다 없으면 undefined→bg.surfaceRaised fallback.
  const coverUrl = thumbnailUrl || themeImageUrl || bannerUrl || undefined;

  // 플레이 모드 코드 → 한국어 라벨. 빈 배열이면 메타 컬럼에 '-' 표기.
  const playModeLabel =
    playModes.length > 0 ? mapPlayModeLabels(playModes).join(', ') : '-';

  // 세일 적용 = 세일가 존재 + onSale + 할인율 양수. 셋 다 충족할 때만 세일가/취소선/배지를 노출한다.
  // (on_sale=false인데 sale_price가 남은 응답에서 세일가가 잘못 대표가로 선택되는 것을 방지.)
  const hasSalePrice = priceInfo.salePrice != null;
  const isSaleActive = hasSalePrice && onSale && priceInfo.discountRate > 0;

  // 화면 표시 가격: 세일 적용 시 세일가, 아니면 정가(?? 로 null 좁힘).
  const displayPrice =
    (isSaleActive ? priceInfo.salePrice : null) ?? priceInfo.originalPrice;

  return (
    <section
      className={css({
        position: 'relative',
        // 풀블리드 커버. 이미지 없으면 surfaceRaised 단색.
        bg: 'bg.surfaceRaised',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
      })}
      style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}
    >
      {/* 오버레이 — 좌측 텍스트 영역 가독성 확보 (HeroBanner와 동일 패턴). */}
      <div
        aria-hidden="true"
        className={css({
          position: 'absolute',
          inset: '0',
          zIndex: '1',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.82) 28%, rgba(0,0,0,0.45) 52%, rgba(0,0,0,0.12) 72%, transparent 100%)',
        })}
      />

      {/* 콘텐츠 — PageContainer 폭(1232px). */}
      <div
        className={cx(
          css(pageGutter),
          css({ position: 'relative', zIndex: '2' }),
        )}
      >
        <div className={css(pageContainer)}>
          {/* 좌측 텍스트 컬럼 — 1232 컨테이너 안에서 좌측(flex-start)에 붙인다(Figma 좌측 정렬). */}
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '5',
              maxW: 'min(640px, 100%)',
              py: '16',
              // 오버레이 없이 밝은 배경 이미지 위에서도 텍스트가 읽히도록 그림자(메인 배너와 동일 패턴).
              textShadow:
                '0 1px 6px token(colors.bg.canvas), 0 2px 16px token(colors.bg.canvas)',
            })}
          >
            {/* 카테고리 칩 — 외곽선 pill(neutral tone), 가로 나열. filled는 글자 안 보여 미사용. */}
            {categories.length > 0 && (
              <div
                className={css({
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '2',
                })}
              >
                {categories.map((c) => (
                  <Tag
                    key={c}
                    className={css({
                      bg: 'rgba(0,0,0,0.45)',
                      backdropFilter: 'blur(6px)',
                      color: 'fg.default',
                      borderColor: 'rgba(255,255,255,0.25)',
                      py: '2px',
                    })}
                  >
                    {c}
                  </Tag>
                ))}
              </div>
            )}

            {/* 제목 — 30px Bold. 음수 letterSpacing은 30px↑ 헤딩 허용(DESIGN_SYSTEM 1.2.4). */}
            <h1
              className={css({
                fontSize: '6xl', // 30px
                fontWeight: 'bold',
                color: 'fg.default',
                letterSpacing: 'tight',
                lineHeight: 'tight',
              })}
            >
              {title}
            </h1>

            {/* 별점 — ★(accent) + 숫자 20px Bold. rating null이면 숨김. */}
            {rating != null && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                })}
              >
                <span
                  className={css({
                    fontSize: '3xl', // 20px
                    color: 'accent.default',
                    lineHeight: 'none',
                  })}
                >
                  ★
                </span>
                <span
                  className={css({
                    fontSize: '3xl', // 20px
                    fontWeight: 'bold',
                    color: 'fg.default',
                    lineHeight: 'none',
                  })}
                >
                  {rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* 메타 3컬럼 — 라벨(12px fg.subtle) 위, 값(14px Bold fg.default) 아래. */}
            <div
              className={css({
                display: 'flex',
                gap: '10',
                flexWrap: 'wrap',
              })}
            >
              <MetaColumn
                label="개발 / 퍼블리셔"
                value={
                  developer && publisher
                    ? `${developer} / ${publisher}`
                    : developer || publisher || '-'
                }
              />
              <MetaColumn label="발행일" value={releaseDate || '-'} />
              <MetaColumn label="플레이 모드" value={playModeLabel} />
            </div>

            {/* 가격블록 — 세일가 30px Bold accent + 정가(취소선 fg.muted) + 할인배지. */}
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '3',
              })}
            >
              <span
                className={css({
                  fontSize: '6xl', // 30px
                  fontWeight: 'bold',
                  color: 'accent.default',
                  lineHeight: 'none',
                })}
              >
                {formatPrice(displayPrice)}
              </span>

              {/* 세일 적용 중일 때만 정가 취소선 노출. */}
              {isSaleActive && (
                <span
                  className={css({
                    fontSize: 'lg', // 14px
                    color: 'fg.muted',
                    textDecoration: 'line-through',
                    lineHeight: 'none',
                  })}
                >
                  {formatPrice(priceInfo.originalPrice)}
                </span>
              )}

              {/* 할인배지 — danger 배경 + 흰 글씨(fg.onAccent) + 작은 라운드. */}
              {isSaleActive && (
                <span
                  className={css({
                    bg: 'danger.default',
                    color: 'fg.onAccent',
                    borderRadius: 'sm', // 4px
                    px: '2',
                    py: '0.5',
                    fontSize: 'sm', // 12px
                    fontWeight: 'bold',
                    lineHeight: 'none',
                  })}
                >
                  -{priceInfo.discountRate}%
                </span>
              )}
            </div>

            {/* 구매 버튼 — 스팀 스토어로 가는 외부 링크(새 탭). steamUrl이 null이면 구매 경로가 없어 숨긴다. */}
            {steamUrl && (
              <Button variant="primary" size="lg" asChild>
                <a href={steamUrl} target="_blank" rel="noopener noreferrer">
                  구매하러 가기
                  <span aria-hidden className={css({ lineHeight: 'none' })}>
                    →
                  </span>
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// 메타 3컬럼의 단일 컬럼 — 라벨(12px fg.subtle) 위, 값(14px Bold fg.default) 아래.
function MetaColumn({ label, value }: { label: string; value: string }) {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '1',
      })}
    >
      <span className={css({ fontSize: 'sm', color: 'fg.subtle' })}>
        {label}
      </span>
      <span
        className={css({
          fontSize: 'lg', // 14px
          fontWeight: 'bold',
          color: 'fg.default',
        })}
      >
        {value}
      </span>
    </div>
  );
}

// 원화 가격 포맷(천 단위 콤마). 0원 이하(무료 게임)는 '무료'로 표기한다.
function formatPrice(price: number): string {
  if (price <= 0) return '무료';
  return `${price.toLocaleString('ko-KR')}원`;
}

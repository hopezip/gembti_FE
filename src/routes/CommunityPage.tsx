import { css } from 'styled-system/css';
import { ChatbotFab } from '@/features/chatbot/components/ChatbotFab';
import { CommunityEntryBar } from '@/features/community/components/CommunityEntryBar';
import { CommunitySidebar } from '@/features/community/components/CommunitySidebar';
import { CommunityTabs } from '@/features/community/components/CommunityTabs';
import { FeedSortBar } from '@/features/community/components/FeedSortBar';
import { GameRecommendStrip } from '@/features/community/components/GameRecommendStrip';
import { PostWriteRow } from '@/features/community/components/PostWriteRow';

// 커뮤니티 페이지 (COMMU-FE-001 Shell + COMMU-FE-002 피드 헤더).
// 레이아웃: [CommunityEntryBar] → [GameRecommendStrip] → [2컬럼: 메인 | CommunitySidebar 280px]
// 메인: [CommunityTabs] → [PostWriteRow] → [FeedSortBar] → 피드(PR3 예정)
// ChatbotFab는 fixed position으로 뷰포트 우하단에 고정.
export function CommunityPage() {
  return (
    <main>
      <CommunityEntryBar />
      <GameRecommendStrip />

      <div
        className={css({
          display: 'flex',
          alignItems: 'flex-start',
          gap: '7',
          px: { base: '7', '2xl': '8' },
          pt: '0',
          pb: '16',
        })}
      >
        {/* 메인 콘텐츠 영역 */}
        <div
          className={css({
            flex: '1',
            minW: '0',
            display: 'flex',
            flexDirection: 'column',
          })}
        >
          <CommunityTabs />

          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
              pt: '4',
            })}
          >
            <PostWriteRow />
            <FeedSortBar />

            {/* 피드 목록 — PR3 구현 예정 */}
            <div
              className={css({
                minH: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'lg',
                border: '1px dashed',
                borderColor: 'border.default',
                color: 'fg.subtle',
                fontSize: 'md',
                fontFamily: 'mono',
              })}
            >
              피드 목록 — PR3 구현 예정
            </div>
          </div>
        </div>

        <div className={css({ pt: '6' })}>
          <CommunitySidebar />
        </div>
      </div>

      <ChatbotFab />
    </main>
  );
}

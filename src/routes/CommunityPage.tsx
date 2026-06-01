import { css } from 'styled-system/css';
import { ChatbotFab } from '@/features/chatbot/components/ChatbotFab';
import { CommunityEntryBar } from '@/features/community/components/CommunityEntryBar';
import { CommunitySidebar } from '@/features/community/components/CommunitySidebar';

// 커뮤니티 페이지 (COMMU-FE-001).
// 레이아웃: [CommunityEntryBar 55px] → [2컬럼: 메인 콘텐츠 flex-1 | CommunitySidebar 280px]
// 메인 콘텐츠 영역은 PR2(피드)/PR3(상세) 구현 후 채운다.
// ChatbotFab는 fixed position으로 뷰포트 우하단에 고정.
export function CommunityPage() {
  return (
    <main>
      <CommunityEntryBar />

      <div
        className={css({
          display: 'flex',
          alignItems: 'flex-start',
          gap: '7',
          px: { base: '7', '2xl': '8' },
          pt: '6',
          pb: '16',
        })}
      >
        {/* 메인 콘텐츠 영역 — PR2에서 탭·작성 버튼·피드 구현 */}
        <div
          className={css({
            flex: '1',
            minW: '0',
            minH: '600px',
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
          커뮤니티 피드 — PR2 구현 예정
        </div>

        <CommunitySidebar />
      </div>

      <ChatbotFab />
    </main>
  );
}

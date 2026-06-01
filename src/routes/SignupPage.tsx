import { AuthCard } from '@/features/auth/components/AuthCard';
import { AuthDivider } from '@/features/auth/components/AuthDivider';
import { AuthTabs } from '@/features/auth/components/AuthTabs';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { SteamButton } from '@/features/auth/components/SteamButton';

// /signup 페이지 엔트리 — Figma auth-modal(signup, 335:7578) STEP 1/2 · 계정정보.
// 로그인과 동일하게 AuthCard 슬롯을 조립한다:
//   세그먼트 탭(회원가입 active) → eyebrow(STEP) + 헤딩/부제 → Steam 자리 → 구분선 → 회원가입 폼.
// 이번 범위는 STEP1(계정정보) + 클라 검증 + mock 제출이다.
// "인증 코드 받기"(STEP2 이메일 인증)와 이메일 실시간 중복확인은 LOGIN-FE-004(백엔드 의존)로 분리한다.
export function SignupPage() {
  return (
    <AuthCard
      tabs={<AuthTabs active="signup" />}
      eyebrow="STEP 1 / 2 · 계정 정보"
      heading="회원가입"
      subtitle="이메일과 비밀번호를 입력해주세요. 다음 단계에서 인증 코드를 받게 돼요."
    >
      {/* Steam 소셜 가입 자리(비활성, 후속 LOGIN-FE-002) */}
      <SteamButton label="Steam 계정으로 가입하기" />

      {/* 구분선 "— 또는 이메일로 가입 —" */}
      <AuthDivider>또는 이메일로 가입</AuthDivider>

      <SignupForm />
    </AuthCard>
  );
}

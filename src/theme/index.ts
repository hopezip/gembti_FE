// GAMBITI · theme 진입점
// 분해된 토큰/시맨틱/recipe/textStyles를 모아 panda.config.ts 가 소비하기 좋은 형태로 export.
// 규칙 본진은 src/theme/README.md 참조. 값 변경은 cross 흐름(출처 SSOT는 docs/design).
import { recipes } from './recipes';
import { semanticTokens } from './semantic-tokens';
import { textStyles } from './text-styles';
import { tokens } from './tokens';

// theme.extend 안에 들어갈 묶음 (tokens / semanticTokens / recipes)
export const themeExtend = {
  tokens,
  semanticTokens,
  recipes,
};

// ⚠️ textStyles는 theme.extend 밖(theme 직속)에 등록해야 산출물이 분해 전과 동일하다.
export { textStyles };

// 개별 접근이 필요할 때를 위해 재노출
export { tokens, semanticTokens, recipes };

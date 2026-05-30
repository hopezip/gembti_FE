// GAMBITI · recipes 모음 (panda theme.extend.recipes 에 등록되는 객체)
// 새 recipe 추가 절차: recipes/<name>.ts 를 defineRecipe로 만든 뒤, 아래 객체에 1줄 등록한다.
// ⚠️ 등록 key는 styled-system 산출물 이름과 직결된다 — 기존 key(button/input/tag/chip/gameCard) 변경 금지.
import { button } from './button';
import { chip } from './chip';
import { gameCard } from './game-card';
import { input } from './input';
import { tag } from './tag';

export const recipes = {
  button,
  input,
  tag,
  chip,
  gameCard, // game-card.ts (파일명만 케밥, key는 gameCard 유지)
  // ← 새 recipe는 여기에 한 줄 추가
};

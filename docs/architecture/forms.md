# forms.md — 폼 (React Hook Form + Zod)

## 핵심 규칙 (인라인 룰 추출용)

- React Hook Form + Zod 조합. `zodResolver`로 결합
- Zod 스키마는 `src/lib/schemas/`에 모음 (컴포넌트 인라인 정의 금지)
- 같은 Zod 스키마를 API 응답 검증에도 재사용
- 에러 메시지는 Zod에서 한국어로. 폼은 DESIGN_SYSTEM.md의 `Field` 래퍼 구조(label/help/error)를 따른다

## 폴더/파일 위치

- `src/lib/schemas/` — Zod 스키마 모음 (auth.ts, profile.ts, party.ts ...)
- `src/features/<domain>/components/<Form>.tsx` — 폼 컴포넌트
- `src/components/ui/field.tsx` — Field 래퍼 (label row + help + error)

## 패턴

```typescript
// ✅ src/lib/schemas/auth.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요'),
  password: z.string()
    .min(10, '비밀번호는 10자 이상이어야 합니다')
    .regex(/(?=.*[a-zA-Z])(?=.*\d)/, '영문과 숫자를 포함해야 합니다'),
  nickname: z.string().min(1, '닉네임을 입력해주세요'),
});
export type SignupInput = z.infer<typeof signupSchema>;

// ✅ RHF + Zod 결합
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
const { register, handleSubmit, formState: { errors } } = useForm<SignupInput>({
  resolver: zodResolver(signupSchema),
});
```

## 안티패턴

- 폼 검증을 useState + 수동 if문으로
- Zod 스키마를 컴포넌트 안에 인라인 정의 (재사용 못함)
- 에러 메시지를 영어로 (화면 문구는 한국어)

## 관련 문서
- `data_fetching.md` (useMutation 결합)
- `../../docs/design/DESIGN_SYSTEM.md` (Field 컴포넌트 사양)

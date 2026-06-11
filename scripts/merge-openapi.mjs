// merge-openapi.mjs — openapi.json(확정) + openapi.draft.json(임시) 병합 하네스 (TASK-DEVEX-018)
//
// 목적: 자동(백엔드 확정) 입력 openapi.json 과 수동(프론트 임시) 입력 openapi.draft.json 의
//   paths / components.schemas 를 얕은 병합해 .openapi.merged.json 으로 출력한다.
//   이후 openapi-typescript 가 이 병합 결과로 src/types/api.ts 를 생성한다.
//
// 규칙:
//   - 키 충돌(같은 path 또는 같은 schema 이름이 양쪽에 존재) 시 openapi.json(확정) 우선으로 덮고
//     stderr 에 경고를 출력한다 — "확정분이 임시분을 이긴다"는 전환 규칙과 일치.
//   - draft 파일이 없으면 openapi.json 을 그대로 복사한다.
//   - 메타(openapi/info/servers 등)는 확정(openapi.json) 쪽을 기준으로 한다.
//
// 사용: node scripts/merge-openapi.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const BASE_PATH = resolve(ROOT, 'docs/03-api/openapi.json');
const DRAFT_PATH = resolve(ROOT, 'docs/03-api/openapi.draft.json');
const OUT_PATH = resolve(ROOT, '.openapi.merged.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

if (!existsSync(BASE_PATH)) {
  console.error(
    `[merge-openapi] 확정 스펙(openapi.json)이 없습니다: ${BASE_PATH}`,
  );
  process.exit(1);
}

const base = readJson(BASE_PATH);

// draft 가 없으면 base 만 복사하고 종료.
if (!existsSync(DRAFT_PATH)) {
  writeFileSync(OUT_PATH, `${JSON.stringify(base, null, 2)}\n`, 'utf-8');
  console.error('[merge-openapi] draft 없음 → openapi.json 만 복사했습니다.');
  process.exit(0);
}

const draft = readJson(DRAFT_PATH);

// 결과는 base(확정) 메타를 기준으로 시작한다.
const merged = {
  ...base,
  paths: { ...(draft.paths ?? {}) },
  components: {
    ...(base.components ?? {}),
    schemas: { ...(draft.components?.schemas ?? {}) },
  },
};

// paths 병합: draft 를 먼저 깐 뒤 base 로 덮는다(확정 우선). 충돌 시 경고.
for (const [path, def] of Object.entries(base.paths ?? {})) {
  if (path in merged.paths) {
    console.error(
      `[merge-openapi] ⚠️ path 충돌: ${path} → openapi.json(확정)으로 덮어씁니다(draft 무시).`,
    );
  }
  merged.paths[path] = def;
}

// components.schemas 병합: draft 를 먼저 깐 뒤 base 로 덮는다(확정 우선). 충돌 시 경고.
const baseSchemas = base.components?.schemas ?? {};
for (const [name, def] of Object.entries(baseSchemas)) {
  if (name in merged.components.schemas) {
    console.error(
      `[merge-openapi] ⚠️ schema 충돌: ${name} → openapi.json(확정)으로 덮어씁니다(draft 무시).`,
    );
  }
  merged.components.schemas[name] = def;
}

// base 의 기타 components(securitySchemes 등)는 위 spread 로 이미 보존됨.

writeFileSync(OUT_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8');

const pathCount = Object.keys(merged.paths).length;
const schemaCount = Object.keys(merged.components.schemas).length;
console.error(
  `[merge-openapi] 병합 완료 → .openapi.merged.json (paths ${pathCount}, schemas ${schemaCount})`,
);

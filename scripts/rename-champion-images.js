#!/usr/bin/env node
/**
 * HTML에서 챔피언명-이미지파일명 매핑을 추출하고 public/champion/ 내 파일을 챔피언명.webp 로 변경합니다.
 * 사용법: node scripts/rename-champion-images.js [html파일경로]
 * HTML이 없으면 매핑 JSON 파일(scripts/champion-image-mapping.json)을 사용합니다.
 */

const fs = require('fs');
const path = require('path');

const CHAMPION_DIR = path.join(__dirname, '..', 'public', 'champion');
const MAPPING_FILE = path.join(__dirname, 'champion-image-mapping.json');

/** span 내부 텍스트만 추출 (태그 제거, <br> → 공백, 공백 정규화) */
function normalizeDisplayName(raw) {
  return raw
    .replace(/<br[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMappingFromHtml(html) {
  const mapping = {};
  // 블록 단위: div._1f60cc95e5049b3d 안에 img(data-src) → span._0b705aa6354582f4a03e30e3bc5fb47a(표시명)
  const blockRegex = /<div\s+class="_1f60cc95e5049b3d"[^>]*>[\s\S]*?(?:data-src|src)="(?:https?:)?\/\/i\.namu\.wiki\/i\/([^"]+\.webp)"[\s\S]*?class="_0b705aa6354582f4a03e30e3bc5fb47a"[^>]*>([\s\S]*?)<\/span\s*>/gi;
  let m;
  while ((m = blockRegex.exec(html)) !== null) {
    const filename = m[1].trim();
    const displayName = normalizeDisplayName(m[2]);
    if (displayName && filename) mapping[filename] = displayName;
  }
  return mapping;
}

function main() {
  let mapping = {};
  const htmlPath = process.argv[2];

  if (htmlPath && fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    mapping = extractMappingFromHtml(html);
    console.log(`HTML에서 ${Object.keys(mapping).length}개 매핑 추출`);
  }

  if (Object.keys(mapping).length === 0 && fs.existsSync(MAPPING_FILE)) {
    mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    console.log(`JSON에서 ${Object.keys(mapping).length}개 매핑 로드`);
  }

  if (Object.keys(mapping).length === 0) {
    console.error('매핑이 없습니다. HTML 파일 경로를 인자로 주거나 champion-image-mapping.json을 생성하세요.');
    process.exit(1);
  }

  const files = fs.readdirSync(CHAMPION_DIR);
  let renamed = 0;
  for (const file of files) {
    if (file.startsWith('.') || !file.endsWith('.webp')) continue;
    const name = mapping[file];
    if (!name) continue;
    const newName = `${name}.webp`;
    if (newName === file) continue;
    const oldPath = path.join(CHAMPION_DIR, file);
    const newPath = path.join(CHAMPION_DIR, newName);
    if (fs.existsSync(newPath)) {
      console.warn(`건너뜀 (이미 존재): ${newName}`);
      continue;
    }
    fs.renameSync(oldPath, newPath);
    console.log(`${file} -> ${newName}`);
    renamed++;
  }
  console.log(`\n총 ${renamed}개 파일 이름 변경 완료`);
}

main();

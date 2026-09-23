const fs = require('fs');
const path = require('path');

console.log('🧪 Verifying Tamil language and font size configuration...');

// 1. Check index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
const hasMuktaMalar = indexHtml.includes('Mukta+Malar');
const hasNotoSansTamil = indexHtml.includes('Noto+Sans+Tamil');
console.log('1. index.html fonts:', { hasMuktaMalar, hasNotoSansTamil });

if (!hasMuktaMalar || !hasNotoSansTamil) {
  console.error('❌ Missing Tamil Google Fonts in index.html');
  process.exit(1);
}

// 2. Check index.css
const indexCss = fs.readFileSync(path.join(__dirname, '../frontend/src/index.css'), 'utf8');
const hasFontSizeClasses = indexCss.includes('font-size-large') && indexCss.includes('font-size-xlarge');
const hasTamilFontFamily = indexCss.includes('Mukta Malar') && indexCss.includes('Noto Sans Tamil');
const hasTamilLangSelector = indexCss.includes('html[lang="ta"]');
console.log('2. index.css styles:', { hasFontSizeClasses, hasTamilFontFamily, hasTamilLangSelector });

if (!hasFontSizeClasses || !hasTamilFontFamily || !hasTamilLangSelector) {
  console.error('❌ Missing font scaling or Tamil font family in index.css');
  process.exit(1);
}

// 3. Check LanguageContext.jsx
const langCtx = fs.readFileSync(path.join(__dirname, '../frontend/src/context/LanguageContext.jsx'), 'utf8');
const hasTamilGlossary = langCtx.includes('செயல்பாடுகள்') && langCtx.includes('முகப்புப்பலகை') && langCtx.includes('தமிழ்');
const hasFontSizeCycle = langCtx.includes('cycleFontSize') && langCtx.includes('font-size-');
console.log('3. LanguageContext.jsx:', { hasTamilGlossary, hasFontSizeCycle });

if (!hasTamilGlossary || !hasFontSizeCycle) {
  console.error('❌ Missing Tamil glossary or font size controls in LanguageContext.jsx');
  process.exit(1);
}

// 4. Check built assets in frontend/dist
const distDir = path.join(__dirname, '../frontend/dist/assets');
const assetFiles = fs.readdirSync(distDir);
const jsBundle = assetFiles.find(f => f.endsWith('.js'));
if (jsBundle) {
  const bundleContent = fs.readFileSync(path.join(distDir, jsBundle), 'utf8');
  const hasTamilInBundle = bundleContent.includes('முகப்புப்பலகை') && bundleContent.includes('தமிழ்');
  const hasSelectorInBundle = bundleContent.includes('A+ (110%)');
  console.log('4. frontend/dist built bundle:', { hasTamilInBundle, hasSelectorInBundle });
  if (!hasTamilInBundle || !hasSelectorInBundle) {
    console.error('❌ Compiled bundle does not include Tamil translations or font controls');
    process.exit(1);
  }
}

console.log('✅ ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');

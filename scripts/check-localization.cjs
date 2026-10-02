const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const dictionary = require('../src/lib/translations.json');
function load(file) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } });
  const exports = {};
  vm.runInNewContext(outputText, { exports, require: () => dictionary });
  return exports;
}
const i18n = load('src/lib/i18n.ts');
const { showcase, demoFlows } = load('src/lib/showcase.ts');
for (const [key, values] of Object.entries(dictionary)) {
  assert.equal(values.length, 4, key);
  assert.ok(values.every(value => typeof value === 'string' && value.trim()), key);
}
for (const locale of ['ru', 'uk', 'en', 'de']) {
  assert.equal(i18n.validLocale(locale), locale);
  assert.ok(i18n.translate('Search', locale));
  assert.ok(i18n.translate('Search\nSearch', locale).split('\n').every(line => line === i18n.translate('Search', locale)));
  assert.equal(i18n.translate('  Search ', locale), `  ${i18n.translate('Search', locale)} `);
}
assert.equal(i18n.validLocale('bad'), 'ru');
assert.equal(i18n.translate('WUTSHY', 'de'), 'WUTSHY');
const source = { heading: 'Search', array: [{ text: 'About' }] };
const localized = i18n.translateContent(source, 'de');
assert.equal(localized.array[0].text, 'Über mich');
assert.equal(source.heading, 'Search');
assert.equal(i18n.contentDictionary(source, localized).Search, 'Suche');
assert.equal(i18n.contentDictionary({ text: 'a\nb' }, { text: 'c\nd' }).b, 'd');
const brands = new Set(['/voicecontrol', 'COWBOY BEBOP ✦', 'Cowboy Bebop', '# Cowboy Bebop']);
for (const project of showcase) assert.ok(dictionary[project.description], project.id);
for (const flow of Object.values(demoFlows)) {
  for (const text of [flow.welcome, ...flow.actions.flatMap(action => [action.label, action.reply])]) {
    for (const line of text.split('\n').filter(Boolean)) assert.ok(dictionary[line] || brands.has(line), `Untranslated demo: ${line}`);
  }
}
console.log(`Localization checks passed: ${Object.keys(dictionary).length} entries, 4 locales, all demo messages.`);

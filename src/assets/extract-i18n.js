const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

// 读取 xlsx 文件
const workbook = xlsx.readFile("src/assets/translated_R12.xlsx");
const sheetName = workbook.SheetNames[1];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

// 生成多语言对象
const en = {};
const zh = {};
const ja = {};
const fr = {};
const es = {};
const pt = {};
const de = {};
const it = {};

rows.forEach((row) => {
  if (row.Key) {
    if (row.English) en[row.Key] = row.English;
    if (row.Chinese) zh[row.Key] = row.Chinese;
    if (row.Japanese) ja[row.Key] = row.Japanese;
    if (row.French) fr[row.Key] = row.French;
    if (row.Spanish) es[row.Key] = row.Spanish;
    if (row.Portuguese) pt[row.Key] = row.Portuguese;
    if (row.German) de[row.Key] = row.German;
    if (row.Italian) it[row.Key] = row.Italian;
  }
});

// 写入 json 文件
fs.writeFileSync(
  path.join(__dirname, "i18n/en.json"),
  JSON.stringify(en, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/zh.json"),
  JSON.stringify(zh, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/ja.json"),
  JSON.stringify(ja, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/fr.json"),
  JSON.stringify(fr, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/es.json"),
  JSON.stringify(es, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/pt.json"),
  JSON.stringify(pt, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/de.json"),
  JSON.stringify(de, null, 2),
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "i18n/it.json"),
  JSON.stringify(it, null, 2),
  "utf8"
);

console.log("多语言提取完成！");

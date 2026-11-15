import fs from 'fs';
import path from 'path';

const tempDir = path.join(process.env.TEMP, 'excel_inspect');
const sharedXml = fs.readFileSync(path.join(tempDir, 'xl/sharedStrings.xml'), 'utf8');

const strings = [];
const regex = /<si>(.*?)<\/si>/gs;
let m;
while ((m = regex.exec(sharedXml)) !== null) {
  const tMatches = [...m[1].matchAll(/<t[^>]*>(.*?)<\/t>/gs)].map(x => x[1]).join('');
  strings.push(tMatches);
}

function dumpSheet(sheetFileName, sheetName) {
  console.log(`\n=================== ${sheetName} (${sheetFileName}) ===================`);
  const sheetXml = fs.readFileSync(path.join(tempDir, `xl/worksheets/${sheetFileName}`), 'utf8');
  const rowRegex = /<row r="(\d+)"[^>]*>(.*?)<\/row>/gs;
  let rMatch;
  while ((rMatch = rowRegex.exec(sheetXml)) !== null) {
    const rowNum = rMatch[1];
    const cRegex = /<c r="([A-Z]+\d+)"(?:[^>]*?t="([^"]+)")?[^>]*>(?:<v>([^<]+)<\/v>)?<\/c>/gs;
    let cMatch;
    const cells = [];
    while ((cMatch = cRegex.exec(rMatch[2])) !== null) {
      const ref = cMatch[1];
      const type = cMatch[2];
      const val = cMatch[3];
      let text = val;
      if (type === 's' && val !== undefined) {
        text = strings[parseInt(val, 10)];
      }
      cells.push(`${ref}: ${text}`);
    }
    console.log(`Row ${rowNum.padStart(2)}: ${cells.join(' | ')}`);
  }
}

dumpSheet('sheet1.xml', '전체현황요약');
dumpSheet('sheet2.xml', '고객영역(Client)');
dumpSheet('sheet3.xml', '용역영역(Service)');
dumpSheet('sheet4.xml', '관리자영역(Admin)');

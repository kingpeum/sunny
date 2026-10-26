const doc = new DOMParser().parseFromString(html, 'text/html');
const title = doc.querySelector('.subreporttitle')?.textContent.trim();
if (title !== '직영관') throw new Error('직영관 페이지인지 확인하지 못했습니다.');
const tables = doc.querySelectorAll('#calendar table.calendar_box');
if (tables.length !== 1) throw new Error('직영관 식단 표가 변경되었습니다.');
const range = doc.querySelector('#monthcontrol .year_month')?.textContent.match(/(20\d{2})\.(\d{2})\.(\d{2})\s*~\s*(20\d{2})\.(\d{2})\.(\d{2})/);
if (!range) throw new Error('식단의 날짜 범위를 확인하지 못했습니다.');
const start = `${range[1]}-${range[2]}-${range[3]}`, end = `${range[4]}-${range[5]}-${range[6]}`;
if (Date.parse(end) - Date.parse(start) !== 6 * 86400000) throw new Error('일주일 날짜 범위가 아닙니다.');
const days = Array.from({length:7}, (_, i) => ({date:new Date(Date.parse(start)+i*86400000).toISOString().slice(0,10),breakfast:[],lunch:[],dinner:[]}));
const table=tables[0], headers=table.querySelectorAll('thead tr:first-child th');
if(headers.length!==8)throw new Error('날짜 열이 변경되었습니다.');
days.forEach((day,i)=>{if(Number(headers[i+1].textContent.match(/\((\d{1,2})\)/)?.[1])!==Number(day.date.slice(-2)))throw new Error('날짜 열이 일치하지 않습니다.');});
const seen=new Set();
for(const row of table.querySelectorAll('tbody tr')){
 const id=({'아침':'breakfast','점심':'lunch','저녁':'dinner'})[row.querySelector('th')?.textContent.trim()];
 const cells=row.querySelectorAll('td');
 if(!id||seen.has(id)||cells.length!==7)throw new Error('끼니 구분이 변경되었습니다.');seen.add(id);
 cells.forEach((cell,i)=>{
  if([...cell.querySelectorAll('a[href*="sMenu="]')].some(a=>!a.getAttribute('href').includes('sMenu=B7100')))throw new Error('다른 관 식단이 포함되어 있습니다.');
  const copy=cell.cloneNode(true);copy.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
  const text=copy.textContent.replace(/\u00a0/g,' ').trim();
  if(!text||/^[-–—\s]+$/.test(text)||/(미급식|급식\s*없|식사\s*없|미운영|미제공|휴무|휴관|휴업|공휴일|급식\s*중단|등록된.*없|준비\s*중|추후\s*공지)/.test(text))return;
  const items=text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
  if(items.some(s=>/[가-힣a-zA-Z]/.test(s)))days[i][id]=items;
 });
}
if(seen.size!==3)throw new Error('세 끼를 확인하지 못했습니다.');
return JSON.stringify(days);

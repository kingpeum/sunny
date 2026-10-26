const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..');const script=fs.readFileSync(path.join(root,'BapTime/MealParser.js'),'utf8');const html=fs.readFileSync(path.join(__dirname,'jbnu-calendar.fixture.html'),'utf8');
 const browser=await chromium.launch({headless:true,...process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}: {}});
 try{const page=await browser.newPage();await page.goto('about:blank');const parse=html=>page.evaluate(({html,script})=>JSON.parse(new Function('html',script)(html)),{html,script});
 const days=await parse(html);assert.equal(days.length,7);assert.equal(days[0].date,'2026-10-25');assert.equal(days[6].date,'2026-10-31');
 const day=days.find(d=>d.date==='2026-10-26');assert.equal(day.breakfast.length,8);assert.equal(day.lunch.length,6);assert.equal(day.dinner.length,6);assert.ok(day.lunch.includes('순살감자탕'));assert.deepEqual(days[0].breakfast,[]);assert.deepEqual(days[6].dinner,[]);
 await assert.rejects(()=>parse(html.replace('직영관','참빛관')));
 await assert.rejects(()=>parse(html.replace('(25)','(24)')));
 await assert.rejects(()=>parse(html.replace('2026.10.31','2026.11.01')));
 const closed=await parse(html.replace('잡곡밥<br> 새우계란국<br> 청양풍돈불고기<br> 톳국수야채무침<br> 포기김치<br> 우유<br> 씨리얼<br> 구운계란','공휴일 미급식'));
 assert.deepEqual(closed.find(d=>d.date==='2026-10-26').breakfast,[]);
 console.log('PASS: iOS-bundled parser, real school week, full 8/6/6 items, empty days, wrong hall, wrong dates, holiday suppression. Native Swift build and device delivery not tested.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

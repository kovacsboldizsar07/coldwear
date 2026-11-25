import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
p.on('console', m => console.log('CONSOLE', m.type(), m.text().slice(0,500)));
p.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0,800)));
p.on('requestfailed', r => console.log('REQFAILED', r.url(), r.failure()?.errorText));
p.on('response', async r => { const u=r.url(); if(u.includes('_serverFn')||u.includes('myshopify')){ let body=''; try{body=(await r.text()).slice(0,1500)}catch(e){body='ERR '+e.message} console.log('RESP', r.status(), r.request().method(), u.slice(0,200), '\n', body, '\n----'); }});
p.on('request', r => { if(r.url().includes('_serverFn')) console.log('REQ', r.method(), r.url().slice(0,300), (r.postData()||'').slice(0,500)); });
const res = await p.goto('https://coldwear.hu/', { waitUntil: 'networkidle', timeout: 60000 });
const html = await res.text();
const i = html.indexOf('Ár betöltése'); console.log('SSR skeleton present:', i>=0);
const m = html.match(/9[ . ]?990|14[ . ]?990/g); console.log('SSR prices:', m);
await p.waitForTimeout(8000);
for (let k=0;k<3;k++){ const r2=await p.reload({waitUntil:"networkidle"}); const h=await r2.text(); console.log("RELOAD",k,"SSR skeleton:",h.includes("Ár betöltése"),"prices:",h.match(/(8|14|1\d)[ .\u00a0]?\d{3}[ \u00a0]?Ft/g)?.slice(0,6)); }
console.log('DOM skeletons:', await p.locator('[aria-label="Ár betöltése"]').count());
console.log('BODY prices:', (await p.locator('body').innerText()).match(/[\d  .]+ ?Ft/g)?.slice(0,20));
await b.close();

import { chromium } from '@playwright/test';
import fs from 'node:fs';
const label=process.argv[2] || 'before';
const baseURL=process.argv[3] || 'http://localhost:3000';
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
for(const scenario of ['ar-mobile','en-mobile','ar-desktop']) {
  for(let run=1;run<=3;run++) {
    const mobile=scenario.endsWith('mobile');
    const locale=scenario.startsWith('ar')?'ar':'en';
    const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile});
    const page=await context.newPage();
    const client=await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled',{cacheDisabled:true});
    if(mobile) {
      await client.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8,connectionType:'cellular4g'});
      await client.send('Emulation.setCPUThrottlingRate',{rate:4});
    }
    await page.addInitScript(()=>{
      window.__audit={lcp:0,cls:0,longTasks:[],lcpElement:''};
      new PerformanceObserver(list=>{for(const e of list.getEntries()){window.__audit.lcp=e.startTime;window.__audit.lcpElement=e.element?.tagName+' '+(e.element?.className||'');}}).observe({type:'largest-contentful-paint',buffered:true});
      new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__audit.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
      new PerformanceObserver(list=>{for(const e of list.getEntries())window.__audit.longTasks.push(e.duration);}).observe({type:'longtask',buffered:true});
    });
    await page.goto(`${baseURL}/${locale}`,{waitUntil:'networkidle',timeout:60000});
    await page.waitForTimeout(1200);
    const data=await page.evaluate(()=>{
      const r=performance.getEntriesByType('resource');
      const nav=performance.getEntriesByType('navigation')[0];
      const sum=(items)=>Math.round(items.reduce((s,e)=>s+e.encodedBodySize,0)/1024*10)/10;
      const a=window.__audit;
      return {lcpMs:Math.round(a.lcp),lcpElement:a.lcpElement,cls:Number(a.cls.toFixed(5)),fcpMs:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),longTaskTotalMs:Math.round(a.longTasks.reduce((x,y)=>x+y,0)),longTaskMaxMs:Math.round(Math.max(0,...a.longTasks)),totalEncodedKiB:sum([...r,nav]),jsEncodedKiB:sum(r.filter(e=>new URL(e.name).pathname.endsWith('.js'))),imageEncodedKiB:sum(r.filter(e=>new URL(e.name).pathname==='/_next/image')),fontEncodedKiB:sum(r.filter(e=>new URL(e.name).pathname.endsWith('.woff2'))),requests:r.length+1,images:[...document.images].map(img=>({displayWidth:Math.round(img.getBoundingClientRect().width),naturalWidth:img.naturalWidth,currentSrc:img.currentSrc.replace(location.origin,''),loading:img.loading})),largest:r.sort((a,b)=>b.encodedBodySize-a.encodedBodySize).slice(0,8).map(e=>({url:e.name.replace(location.origin,''),KiB:Math.round(e.encodedBodySize/1024)}))};
    });
    results.push({scenario,run,...data});
    console.log(JSON.stringify({scenario,run,lcpMs:data.lcpMs,cls:data.cls,jsKiB:data.jsEncodedKiB,imageKiB:data.imageEncodedKiB,totalKiB:data.totalEncodedKiB}));
    await context.close();
  }
}
await browser.close();
const output={recordedAt:new Date().toISOString(),label,method:'Production localhost, cold browser cache, warm server image cache. Mobile: 390x844 DPR2, 1.6Mbps down, 150ms latency, 4x CPU slowdown. Desktop: 1440x1000 DPR1, unthrottled. Three fresh browser contexts each. Encoded response body KiB excludes headers; measurements are local lab results, not field metrics.',results};
fs.writeFileSync(`docs/performance-${label}.json`,JSON.stringify(output,null,2));

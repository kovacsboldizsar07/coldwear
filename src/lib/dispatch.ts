// Add confirmed Hungarian public holidays and exceptional working/non-working days here.
export const dispatchCalendar={holidays:['2026-01-01','2026-03-15','2026-04-03','2026-04-06','2026-05-01','2026-05-25','2026-08-20','2026-10-23','2026-11-01','2026-12-25','2026-12-26'],extraClosed:['2026-01-02','2026-08-21','2026-12-24'],extraOpen:['2026-01-10','2026-08-08','2026-12-12']};
export function dispatchMessage(now:Date,calendar=dispatchCalendar){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Budapest',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
 const get=(key:string)=>parts.find(p=>p.type===key)?.value||'0';const y=+get('year'),m=+get('month'),d=+get('day'),hour=+get('hour'),minute=+get('minute');
 const date=new Date(Date.UTC(y,m-1,d));
 const isOpen=(day:Date)=>{const key=day.toISOString().slice(0,10);return !calendar.holidays.includes(key)&&!calendar.extraClosed.includes(key)&&(calendar.extraOpen.includes(key)||(day.getUTCDay()>0&&day.getUTCDay()<6))};
 if(isOpen(date)&&hour<14){const left=14*60-hour*60-minute;return `Rendeld meg ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')} percen belül, és még ma feladjuk.`}
 do{date.setUTCDate(date.getUTCDate()+1)}while(!isOpen(date));
 return `A következő feladás: ${new Intl.DateTimeFormat('hu-HU',{weekday:'long',timeZone:'UTC'}).format(date)}.`;
}

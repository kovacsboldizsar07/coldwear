import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
const schema=z.object({token:z.string().max(200),permission:z.string().max(200).optional(),session_id:z.string().uuid(),visitor_id:z.string().uuid().nullable(),event_name:z.enum(['PageView','ViewContent','AddToCart','InitiateCheckout','Lead','bundle_select','size_select','size_chart_open','upsell_add','block_view','cta_click']),event_id:z.string().uuid(),page_path:z.string().max(500),event_data:z.record(z.union([z.string().max(500),z.number().finite(),z.boolean(),z.null(),z.array(z.string().max(100)).max(50)])).refine(v=>Object.keys(v).length<=20),angle:z.enum(['default','bike','fishing']),consent_level:z.enum(['necessary','statistics','marketing']),source:z.record(z.string().max(512)).refine(v=>Object.keys(v).every(k=>['utm_source','utm_medium','utm_campaign','utm_content','fbclid','gclid','ttclid'].includes(k))),fbp:z.string().max(300).regex(/^fb\.\d\.\d+\.\d+$/).optional(),fbc:z.string().max(600).regex(/^fb\.\d\.\d+\.\S+$/).optional()});
// Real visitor IP for Meta matching: Cloudflare header first, then the standard proxy headers.
function clientIp(request:Request){return request.headers.get('cf-connecting-ip')||request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||null}
export const Route=createFileRoute('/api/public/collect')({server:{handlers:{POST:async({request})=>{
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return new Response(null,{status:403});
 const raw=await request.text();if(raw.length>12000)return new Response(null,{status:413});
 let parsed:unknown;try{parsed=JSON.parse(raw)}catch{return new Response(null,{status:400})}
 const result=schema.safeParse(parsed);if(!result.success)return new Response(null,{status:400});
 const secret=process.env['CW_COLLECT_SIGNING_SECRET'];if(!secret)return new Response(null,{status:503});const {verifyTelemetry}=await import('@/lib/telemetry.server');if(!verifyTelemetry(result.data.token,secret))return new Response(null,{status:401});
 const data=result.data;if(data.consent_level==='necessary')return new Response(null,{status:204});const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {readPermission}=await import('@/lib/marketing-permission.server');
 const permission=data.consent_level==='marketing'?await readPermission(data.permission||''):null;
 if(data.consent_level==='marketing'&&!permission)return new Response(null,{status:204});
 const source=permission?data.source:{};
 const session=await db.from('sessions').upsert({id:data.session_id,visitor_id:permission?permission.visitor_id:null,created_at:new Date().toISOString(),landing_path:data.page_path,angle:data.angle,consent_level:data.consent_level,device:request.headers.get('user-agent')?.includes('Mobile')?'mobile':'desktop',...source},{onConflict:'id',ignoreDuplicates:true});
 if(session.error)return new Response(null,{status:503});
 const {error}=await db.from('events').upsert({session_id:data.session_id,event_name:data.event_name,event_id:data.event_id,page_path:data.page_path,event_data:data.event_data},{onConflict:'event_id',ignoreDuplicates:true});
 if(error)return new Response(null,{status:503});
 if(data.event_name==='block_view'){const b=z.object({block_id:z.enum(['hero','problem','features','socks','size_chart','bundle_selector','faq']),time_spent_sec:z.number().int().min(0).max(86400),max_scroll_pct:z.number().int().min(0).max(100)}).safeParse(data.event_data);if(b.success)await db.from('block_views').insert({session_id:data.session_id,...b.data});}
 if(data.consent_level==='marketing'&&['PageView','ViewContent','AddToCart','InitiateCheckout','Lead'].includes(data.event_name)){
 const {enqueueCapi,hash}=await import('@/lib/capi-delivery.server');
 if(permission)await enqueueCapi({name:data.event_name,id:data.event_id,consentId:permission.id,time:Math.floor(Date.now()/1000),user:{external_id:[await hash(permission.visitor_id)],client_user_agent:request.headers.get('user-agent')||'',...(clientIp(request)?{client_ip_address:clientIp(request)}:{}),...(data.fbp?{fbp:data.fbp}:{}),...(data.fbc?{fbc:data.fbc}:{})},custom:data.event_data,url:new URL(data.page_path,request.url).toString()});
 }
 return new Response(null,{status:204});
}}}});

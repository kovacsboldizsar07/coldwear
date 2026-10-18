import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/shopify-webhook')({server:{handlers:{POST:async({request})=>{
 const secret=process.env['SHOPIFY_WEBHOOK_SECRET'];if(!secret)return new Response('Webhook nincs beállítva',{status:503});
 const raw=await request.text();if(raw.length>2_000_000)return new Response('Túl nagy kérés',{status:413});
 const {verifyShopify}=await import('@/lib/telemetry.server');if(!verifyShopify(raw,request.headers.get('X-Shopify-Hmac-Sha256'),secret))return new Response('Invalid signature',{status:401});
 const webhookId=request.headers.get('X-Shopify-Webhook-Id'),topic=request.headers.get('X-Shopify-Topic');if(!webhookId||webhookId.length>200||!topic||topic.length>100)return new Response('Missing headers',{status:400});
 let payload:unknown;try{payload=JSON.parse(raw)}catch{return new Response('Invalid body',{status:400})}
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const result=await db.rpc('claim_shopify_webhook',{p_id:webhookId,p_topic:topic});
 if(result.error)return new Response('Retry later',{status:503});
 if(!result.data){const existing=await db.from('webhook_events').select('status').eq('webhook_id',webhookId).maybeSingle();return new Response(existing.data?.status==='completed'?'ok':'Retry later',{status:!existing.error&&existing.data?.status==='completed'?200:503});}
 const lease=result.data;
 try{const {processWebhook}=await import('@/lib/webhook.server');await processWebhook(topic,payload);const completed=await db.from('webhook_events').update({status:'completed',error:null,lease_until:null}).eq('webhook_id',webhookId).eq('lease_token',lease);if(completed.error)throw completed.error;return new Response('ok')}
 catch{await db.from('webhook_events').update({status:'error',lease_until:null,error:'A feldolgozás vagy a CAPI küldés újrapróbálkozásra vár.'}).eq('webhook_id',webhookId).eq('lease_token',lease);return new Response('Processing failed; retry required',{status:500})}
}}}});

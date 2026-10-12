import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/shopify-webhook')({server:{handlers:{POST:async({request})=>{
 const secret=process.env['SHOPIFY_WEBHOOK_SECRET'];if(!secret)return new Response('Webhook nincs beállítva',{status:503});
 const raw=await request.text();if(raw.length>2_000_000)return new Response('Túl nagy kérés',{status:413});
 const {verifyShopify}=await import('@/lib/telemetry.server');if(!verifyShopify(raw,request.headers.get('X-Shopify-Hmac-Sha256'),secret))return new Response('Invalid signature',{status:401});
 const webhookId=request.headers.get('X-Shopify-Webhook-Id'),topic=request.headers.get('X-Shopify-Topic');if(!webhookId||webhookId.length>200||!topic||topic.length>100)return new Response('Missing headers',{status:400});
 let payload:unknown;try{payload=JSON.parse(raw)}catch{return new Response('Invalid body',{status:400})}
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const result=await db.from('webhook_events').insert({webhook_id:webhookId,topic,status:'processing'});
 if(result.error?.code==='23505')return new Response('ok');if(result.error)return new Response('Retry later',{status:503});
 try{const {processWebhook}=await import('@/lib/webhook.server');await processWebhook(topic,payload);await db.from('webhook_events').update({status:'completed'}).eq('webhook_id',webhookId);return new Response('ok')}
 catch{await db.from('webhook_events').update({status:'error',error:'A feldolgozás sikertelen. Ellenőrizd az adatokat és indítsd újra adminisztrátorként.'}).eq('webhook_id',webhookId);return new Response('Processing failed',{status:500})}
}}}});

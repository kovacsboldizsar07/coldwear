import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const adminReport=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({from:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),to:z.string().regex(/^\d{4}-\d{2}-\d{2}$/)})).handler(async({data,context})=>{
 const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error||!admin)throw new Error('Ehhez adminisztrátori jogosultság szükséges.');
 const db=context.supabase;const until=`${data.to}T23:59:59.999+02:00`;
 const [orders,items,spend,costs,webhooks,capi]=await Promise.all([db.from('orders').select('*').gte('created_at',`${data.from}T00:00:00+02:00`).lte('created_at',until).order('created_at',{ascending:false}).limit(1000),db.from('order_items').select('*').limit(1000),db.from('ad_spend').select('*').gte('date',data.from).lte('date',data.to).order('date',{ascending:false}).limit(1000),db.from('product_costs').select('*'),db.from('webhook_events').select('*').order('received_at',{ascending:false}).limit(30),db.from('capi_log').select('*').gte('created_at',new Date(Date.now()-86400000).toISOString()).order('created_at',{ascending:false}).limit(100)]);
 for(const result of [orders,items,spend,costs,webhooks,capi])if(result.error)throw new Error('A kimutatás betöltése nem sikerült.');
 return {orders:orders.data||[],items:items.data||[],spend:spend.data||[],costs:costs.data||[],webhooks:webhooks.data||[],capi:capi.data||[]};
});
const cost=z.object({product_key:z.string().min(1).max(100),title:z.string().min(1).max(200),cogs:z.number().min(0).max(10000000),packaging_cost:z.number().min(0).max(1000000),shipping_cost:z.number().min(0).max(1000000),cod_fee:z.number().min(0).max(1000000),payment_fee_pct:z.number().min(0).max(100),vat_pct:z.number().min(0).max(100),return_rate_pct:z.number().min(0).max(100),waste_cost:z.number().min(0).max(1000000)});
const spend=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),platform:z.enum(['meta','tiktok','google']),campaign_name:z.string().max(200),spend:z.number().min(0).max(100000000),impressions:z.number().int().min(0),clicks:z.number().int().min(0),conversions:z.number().int().min(0)});
export const adminWrite=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.discriminatedUnion('type',[z.object({type:z.literal('cost'),value:cost}),z.object({type:z.literal('spend'),value:spend})])).handler(async({data,context})=>{
 const {data:admin,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(error||!admin)throw new Error('Nincs adminisztrátori jogosultság.');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const result=data.type==='cost'?await db.from('product_costs').upsert(data.value,{onConflict:'product_key'}):await db.from('ad_spend').upsert(data.value,{onConflict:'date,platform,campaign_name'});
 if(result.error)throw new Error('A mentés nem sikerült.');return {success:true};
});

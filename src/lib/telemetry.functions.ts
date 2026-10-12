import { createServerFn } from '@tanstack/react-start';
export const telemetryConfig=createServerFn({method:'GET'}).handler(async()=>{const secret=process.env['CW_COLLECT_SIGNING_SECRET'];if(!secret)return {token:'',pixelId:''};const {telemetryToken}=await import('./telemetry.server');return {token:telemetryToken(secret),pixelId:process.env['META_PIXEL_ID']||''}});

import { createFileRoute } from '@tanstack/react-router';
import { InfoPage,infoHead } from '@/components/coldwear/info-page';
export const Route=createFileRoute('/kapcsolat')({head:()=>infoHead("Kapcsolat","Kérdésed van a mérettel vagy a rendeléssel kapcsolatban? Írj nekünk, munkanapokon 2 órán belül válaszolunk."),component:Page});
function Page(){return <InfoPage {...{"title": "Kapcsolat", "intro": "Kérdésed van a mérettel vagy a rendeléssel kapcsolatban? Írj nekünk, munkanapokon 2 órán belül válaszolunk.", "sections": [{"title": "Írj nekünk", "body": "Email: [email]\nElérhetőség: [nyitvatartás]"}, {"title": "Méretválasztás", "body": "A mérettáblázat segít kiválasztani a megfelelő méretet. Bizonytalan vagy? Írd meg nekünk a kézméretedet, és segítünk dönteni."}]}}/>}

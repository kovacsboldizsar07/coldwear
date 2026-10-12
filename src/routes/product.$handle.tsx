import { createFileRoute,notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogOptions,BundleSelector } from '@/components/coldwear/bundle-selector';
import { infoHead } from '@/components/coldwear/info-page';
import palm from '@/assets/glove-palm.png.asset.json';
export const Route=createFileRoute('/product/$handle')({loader:async({context,params})=>{const products=await context.queryClient.ensureQueryData(catalogOptions);const product=products.find(p=>p.handle===params.handle);if(!product)throw notFound();return product},head:({loaderData})=>infoHead(loaderData?.title||'A termék nem elérhető',loaderData?.description||'ColdWear thermo termékek.'),component:Page});
function Page(){const {data:products}=useSuspenseQuery(catalogOptions);const {handle}=Route.useParams();const product=products.find(p=>p.handle===handle);if(!product)return null;return <><div className="cw-container grid gap-10 py-16 md:grid-cols-2"><div className="cw-photo aspect-square">{product.title.includes('kesztyű')?<img src={palm.url} alt={product.title}/>:<p className="cw-label">Termékfotó: Thermo zokni</p>}</div><div><h1 className="text-4xl">{product.title}</h1><p className="cw-body mt-6">{product.description}</p></div></div><BundleSelector/></>}

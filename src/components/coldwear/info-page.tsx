import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { pageHead } from '@/lib/seo';
export type InfoSection={title:string;body:string};
export function InfoPage({title,intro,sections}:{title:string;intro:string;sections:InfoSection[]}){return <div className="cw-container max-w-4xl py-8 sm:py-12"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-text-muted"><ArrowLeft size={16}/>Vissza a termékekhez</Link><p className="cw-label mb-4 text-text-muted">COLDWEAR / TUDNIVALÓK</p><h1 className="break-words text-3xl leading-tight sm:text-4xl">{title}</h1><p className="cw-body mt-4 text-base">{intro}</p><div className="mt-8 space-y-7">{sections.map(section=><section key={section.title} className="border-t border-line pt-8"><h2 className="mb-4 text-xl font-bold">{section.title}</h2><p className="cw-body whitespace-pre-line">{section.body}</p></section>)}</div></div>}
export function infoHead(title:string,description:string,path:string){return pageHead(`${title} | ColdWear`,description,path)}

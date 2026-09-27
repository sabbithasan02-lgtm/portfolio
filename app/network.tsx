'use client';
import { useEffect, useRef, useState } from 'react';
const heroNodes=[{label:'Webhook',x:.17,y:.25,symbol:'↯'},{label:'AI Agent',x:.49,y:.1,symbol:'✳'},{label:'Database',x:.81,y:.23,symbol:'▤'},{label:'API',x:.1,y:.53,symbol:'{ }'},{label:'CRM',x:.89,y:.51,symbol:'◈'},{label:'Email',x:.21,y:.77,symbol:'✉'},{label:'OpenAI',x:.62,y:.8,symbol:'✳'},{label:'Google Sheets',x:.77,y:.66,symbol:'▦'},{label:'Telegram',x:.4,y:.85,symbol:'➤'},{label:'Analytics',x:.35,y:.31,symbol:'▥'}];
export default function Network({toolkit=false}:{toolkit?:boolean}){
const nodes=toolkit?heroNodes.map((n,i)=>({...n,label:['Webhooks','OpenAI','Supabase','APIs','Slack','JavaScript','PostgreSQL','Google Sheets','Telegram','n8n'][i]})):heroNodes;
const ref=useRef<HTMLCanvasElement>(null); const box=useRef<HTMLDivElement>(null); const [active,setActive]=useState(-1);const activeRef=useRef(-1);
useEffect(()=>{activeRef.current=active},[active]);
useEffect(()=>{
const canvas=ref.current;if(!canvas||!box.current)return;const ctx=canvas.getContext('2d');if(!ctx)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;let width=0,height=0,frame=0;let visible=true;
const resize=new ResizeObserver(entries=>{width=entries[0].contentRect.width;height=entries[0].contentRect.height;const dpr=Math.min(devicePixelRatio,2);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)});resize.observe(box.current);
const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting});io.observe(box.current);
function draw(t:number){if(!ctx)return;if(visible){ctx.clearRect(0,0,width,height); const cx=width*.5,cy=height*.49;const scroll=Math.min(1,window.scrollY/600);const connection=.25+scroll*.75;
for(let j=0;j<nodes.length;j++){const n=nodes[j];const nx=width*n.x,ny=height*n.y;const lit=activeRef.current===j;ctx.beginPath();ctx.moveTo(cx,cy);ctx.bezierCurveTo(cx+(nx-cx)*.5,cy,nx,cy+(ny-cy)*.55,nx,ny);ctx.strokeStyle=lit?'#ff8e76': 'rgba(145,155,170,'+(.15+connection*.22)+')';ctx.lineWidth=lit?1.7:1;ctx.stroke();
const p=reduced?.55:((t/4500+j*.13)%1);const inv=1-p;const px=inv*inv*inv*cx+3*inv*inv*p*(cx+(nx-cx)*.5)+3*inv*p*p*nx+p*p*p*nx;const py=inv*inv*inv*cy+3*inv*inv*p*cy+3*inv*p*p*(cy+(ny-cy)*.55)+p*p*p*ny;ctx.beginPath();ctx.arc(px,py,lit?3:2,0,Math.PI*2);ctx.fillStyle=lit?'#ffd4be':'#ff765e';ctx.shadowBlur=lit?15:7;ctx.shadowColor='#ff765e';ctx.fill();ctx.shadowBlur=0}
}frame=requestAnimationFrame(draw)}frame=requestAnimationFrame(draw);
return()=>{cancelAnimationFrame(frame);resize.disconnect();io.disconnect()}
},[]);
return <div className="network" ref={box}><canvas ref={ref} aria-hidden="true"/><div className="orbit orbit-one"/><div className="orbit orbit-two"/><button className="core-node" onClick={()=>setActive(-1)} aria-label="Show all workflow connections"><span className="core-symbol">•—•<br/>•—•</span><strong>{toolkit?'Sabbit':'n8n'}</strong><small>{toolkit?'AUTOMATION ENGINEER':'WORKFLOW ENGINE'}</small></button>{nodes.map((n,i)=><button key={n.label} className={'flow-node '+(active===i?'active':'')} style={{left:n.x*100+'%',top:n.y*100+'%'}} onMouseEnter={()=>setActive(i)} onMouseLeave={()=>setActive(-1)} onFocus={()=>setActive(i)} onBlur={()=>setActive(-1)} onClick={()=>setActive(active===i?-1:i)} aria-label={'Explore '+n.label+' connection'}><span>{n.symbol}</span><small>{n.label}</small></button>)}<div className="node-readout" aria-live="polite">{active>=0?<><span className="status-dot"/>{nodes[active].label} <b>→</b> {toolkit?'Sabbit':'n8n'} <b>→</b> Automated workflow</>:<><span className="status-dot"/> DATA FLOWS. WORK HAPPENS.</>}</div></div>
}

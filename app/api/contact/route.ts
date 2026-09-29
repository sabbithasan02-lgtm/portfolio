import { contactDb } from "@/db/contact";
import { projectTypes } from "@/data/profile";
import { env } from "cloudflare:workers";
import { Resend } from "resend";

type ContactPayload={name:string;email:string;company:string;message:string;tools:string;projectType:string;budget:string};
function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));}
async function notifyOwner(message:ContactPayload){
const settings=env as unknown as {RESEND_API_KEY?:string;CONTACT_TO_EMAIL?:string;CONTACT_FROM_EMAIL?:string};
if(!settings.RESEND_API_KEY)return false;
const to=settings.CONTACT_TO_EMAIL||"sabbithasan02@gmail.com";
const from=settings.CONTACT_FROM_EMAIL||"onboarding@resend.dev";
const html=`<h2>New portfolio enquiry</h2><p><b>Name:</b> ${escapeHtml(message.name)}</p><p><b>Email:</b> ${escapeHtml(message.email)}</p><p><b>Company:</b> ${escapeHtml(message.company||"Not provided")}</p><p><b>Project:</b> ${escapeHtml(message.projectType)}</p><p><b>Budget:</b> ${escapeHtml(message.budget||"Not provided")}</p><p><b>Tools:</b> ${escapeHtml(message.tools||"Not provided")}</p><hr><p>${escapeHtml(message.message).replace(/\n/g,"<br>")}</p>`;
const resend=new Resend(settings.RESEND_API_KEY);
const {error}=await resend.emails.send({from,to:[to],replyTo:message.email,subject:`Portfolio enquiry from ${message.name}`,html});
if(error)throw new Error(error.message);
return true;
}
export async function POST(request:Request){
try{
const origin=request.headers.get("origin");if(request.headers.get("sec-fetch-site")==="cross-site"||(origin&&origin!==new URL(request.url).origin))return Response.json({error:"Please send this form from the portfolio."},{status:403});
if(!request.headers.get("content-type")?.includes("application/json"))return Response.json({error:"Invalid request format."},{status:415});
const raw=await request.text();if(raw.length>16000)return Response.json({error:"Your message is too long."},{status:413});
let b;try{b=JSON.parse(raw)}catch{return Response.json({error:"Invalid request."},{status:400})}
if(!b||typeof b!=="object"||Array.isArray(b))return Response.json({error:"Invalid request."},{status:400});
if(b.website)return Response.json({error:"Unable to send this message."},{status:400});
const limits:Record<string,number>={name:100,email:254,company:200,message:5000,tools:500,projectType:80,budget:100,id:50};
for(const [key,max] of Object.entries(limits)){if(typeof b[key]!=="string"||b[key].length>max)return Response.json({error:"Please check the form fields."},{status:400});b[key]=b[key].trim()}
if(!b.name||!b.message||!b.email||!/^\S+@\S+\.\S+$/.test(b.email)||!projectTypes.includes(b.projectType)||!/^[-a-zA-Z0-9]{16,50}$/.test(b.id))return Response.json({error:"Please enter your name, a valid email, a project type and a message."},{status:400});
const sender=request.headers.get("cf-connecting-ip")||b.email.toLowerCase();
const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(sender)))).map(n=>n.toString(16).padStart(2,"0")).join("");
let stored=false;
try{
const db=contactDb();
const existing=await db.prepare("SELECT id FROM contact_messages WHERE id = ? AND sender_hash = ?").bind(b.id,hash).first();if(existing)return Response.json({ok:true});
const now=Date.now();const recent=await db.prepare("SELECT COUNT(*) AS total FROM contact_messages WHERE sender_hash = ? AND created_at > ?").bind(hash,now-3600000).first<{total:number}>();
if(recent&&recent.total>=5)return Response.json({error:"A few messages have already been sent. Please try again later, or reach me on LinkedIn."},{status:429});
await db.prepare("INSERT INTO contact_messages (id,name,email,company,message,tools,project_type,budget,created_at,sender_hash) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(b.id,b.name,b.email,b.company,b.message,b.tools,b.projectType,b.budget,now,hash).run();
stored=true;
}catch(error){console.warn("Contact storage unavailable; using email delivery only",error instanceof Error?error.message:"Storage error")}
let emailed=false;
try{emailed=await notifyOwner(b as ContactPayload)}catch(error){console.error("Contact email notification failed",error instanceof Error?error.message:"Email error")}
if(!stored&&!emailed)return Response.json({error:"Contact delivery is not configured. Please reach me on LinkedIn."},{status:503});
return Response.json({ok:true},{status:201});
}catch(error){console.error("Contact message could not be saved",error instanceof Error?error.message:"Storage error");return Response.json({error:"Your message could not be saved. Please try again or reach me on LinkedIn."},{status:503})}}

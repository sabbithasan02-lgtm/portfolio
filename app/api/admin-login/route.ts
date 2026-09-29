import { ADMIN_COOKIE, createAdminCookie, verifyMasterKey } from '@/app/admin-auth';

export async function POST(request: Request) {
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid origin.'},{status:403});
  const body=await request.json() as {key?:string};
  if(!body.key||!(await verifyMasterKey(body.key)))return Response.json({error:'Invalid master key.'},{status:401});
  return Response.json({ok:true},{headers:{'set-cookie':await createAdminCookie(request),'cache-control':'no-store'}});
}

export async function DELETE(request: Request) {
  const secure = ['localhost','127.0.0.1'].includes(new URL(request.url).hostname) ? '' : '; Secure';
  return Response.json({ok:true},{headers:{'set-cookie':`${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`}});
}

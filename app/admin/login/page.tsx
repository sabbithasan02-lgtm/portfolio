'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router=useRouter();
  const [message,setMessage]=useState('');
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage('Checking…');const form=new FormData(event.currentTarget);const response=await fetch('/api/admin-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key:form.get('key')})});const data=await response.json() as {error?:string};if(response.ok){router.replace('/admin');router.refresh();}else setMessage(data.error||'Login failed.');}
  return <main className="admin-gate"><form className="admin-login" onSubmit={submit}><span>SECURE OWNER ACCESS</span><h1>Admin login</h1><p>Enter the portfolio master key, or use ChatGPT owner sign-in.</p><label>Master key<input name="key" type="password" required minLength={16} autoComplete="current-password" /></label><button type="submit">Open dashboard</button><a href="/signin-with-chatgpt?return_to=%2Fadmin">Sign in with ChatGPT</a><small aria-live="polite">{message}</small></form></main>;
}

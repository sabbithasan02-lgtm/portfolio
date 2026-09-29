import { env } from "cloudflare:workers";
import { hasAdminAccess } from "@/app/admin-auth";
import type { Project } from "@/data/projects";

const statuses = new Set(["ACTIVE", "LIVE", "BUILDING", "TESTING", "EXPERIMENT", "PROTOTYPE"]);
const imageTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

type ProjectRow = {
  id: string;
  title: string;
  company: string;
  role: string;
  status: Project["status"];
  date: string;
  type: string;
  summary: string;
  problem: string;
  solution: string;
  workflow: string;
  technologies: string;
  screenshots: string;
  learnings: string;
  next_steps: string;
};

function list(value: FormDataEntryValue | null, separator: RegExp) {
  return String(value || "").split(separator).map(item => item.trim()).filter(Boolean).slice(0, 30);
}

function readJson(value: string) {
  try { return JSON.parse(value); } catch { return []; }
}

function toProject(row: ProjectRow): Project {
  const screenshots = (readJson(row.screenshots) as { key: string; alt: string }[]).map(item => ({
    src: `/api/projects/media/${encodeURIComponent(item.key)}`,
    alt: item.alt,
  }));
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    role: row.role,
    status: row.status,
    date: row.date,
    type: row.type,
    summary: row.summary,
    problem: row.problem,
    solution: row.solution,
    workflow: readJson(row.workflow),
    technologies: readJson(row.technologies),
    metrics: [],
    screenshots,
    learnings: readJson(row.learnings),
    nextSteps: readJson(row.next_steps),
    category: ["PERSONAL"],
  };
}

export async function GET(request: Request) {
  if (!env.DB) return Response.json({ projects: [], canManage: await hasAdminAccess(request), storageAvailable: false });
  try {
    const result = await env.DB.prepare("SELECT id,title,company,role,status,date,type,summary,problem,solution,workflow,technologies,screenshots,learnings,next_steps FROM portfolio_projects ORDER BY created_at DESC").all<ProjectRow>();
    return Response.json({ projects: (result.results || []).map(toProject), canManage: await hasAdminAccess(request) });
  } catch (error) {
    console.error("Projects could not be loaded", error instanceof Error ? error.message : "Storage error");
    return Response.json({ projects: [], canManage: await hasAdminAccess(request), error: "Saved case studies are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await hasAdminAccess(request))) return Response.json({ error: "Owner access required." }, { status: 403 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid upload origin." }, { status: 403 });
  if (!env.DB || !env.BUCKET) return Response.json({ error: "Project storage is unavailable." }, { status: 503 });

  const form = await request.formData();
  const text = (name: string, max: number, fallback = "") => String(form.get(name) || fallback).trim().slice(0, max);
  const title = text("title", 140);
  const company = text("company", 100, "Personal Project");
  const role = text("role", 100, "Automation Engineer");
  const status = text("status", 20, "LIVE") as Project["status"];
  const date = text("date", 50, new Date().getFullYear().toString());
  const type = text("type", 120, "Automation Case Study");
  const summary = text("summary", 700);
  const problem = text("problem", 3000);
  const solution = text("solution", 4000);
  if (!title || !summary || !problem || !solution || !statuses.has(status)) {
    return Response.json({ error: "Add a title, summary, problem, solution and valid status." }, { status: 400 });
  }

  const uploads = form.getAll("screenshots").filter((value): value is File => value instanceof File && value.size > 0).slice(0, 6);
  if (!uploads.length) return Response.json({ error: "Add at least one screenshot." }, { status: 400 });
  if (uploads.some(file => file.size > 5_000_000 || !imageTypes[file.type])) {
    return Response.json({ error: "Use JPG, PNG, WebP or GIF screenshots up to 5 MB each." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const stored: { key: string; alt: string }[] = [];
  try {
    for (let index = 0; index < uploads.length; index++) {
      const file = uploads[index];
      const key = `${id}-${index + 1}.${imageTypes[file.type]}`;
      await env.BUCKET.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
      stored.push({ key, alt: `${title} screenshot ${index + 1}` });
    }
    const now = Date.now();
    const workflow = list(form.get("workflow"), /\r?\n|,/);
    const technologies = list(form.get("technologies"), /,/);
    const learnings = list(form.get("learnings"), /\r?\n/);
    const nextSteps = list(form.get("nextSteps"), /\r?\n/);
    await env.DB.prepare("INSERT INTO portfolio_projects (id,title,company,role,status,date,type,summary,problem,solution,workflow,technologies,screenshots,learnings,next_steps,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(id, title, company, role, status, date, type, summary, problem, solution, JSON.stringify(workflow), JSON.stringify(technologies), JSON.stringify(stored), JSON.stringify(learnings), JSON.stringify(nextSteps), now, now).run();
    return Response.json({ project: toProject({ id, title, company, role, status, date, type, summary, problem, solution, workflow: JSON.stringify(workflow), technologies: JSON.stringify(technologies), screenshots: JSON.stringify(stored), learnings: JSON.stringify(learnings), next_steps: JSON.stringify(nextSteps) }) }, { status: 201 });
  } catch (error) {
    await Promise.all(stored.map(item => env.BUCKET!.delete(item.key)));
    console.error("Project could not be saved", error instanceof Error ? error.message : "Storage error");
    return Response.json({ error: "The case study could not be saved." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasAdminAccess(request))) return Response.json({ error: "Owner access required." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Project storage is unavailable." }, { status: 503 });
  const input = await request.json() as Partial<Project> & { id?: string };
  const clean = (value: unknown, max: number) => String(value || "").trim().slice(0, max);
  const id = clean(input.id, 80);
  const status = clean(input.status, 20) as Project["status"];
  if (!id || !clean(input.title, 140) || !clean(input.summary, 700) || !clean(input.problem, 3000) || !clean(input.solution, 4000) || !statuses.has(status)) {
    return Response.json({ error: "Complete all required project fields." }, { status: 400 });
  }
  await env.DB.prepare("UPDATE portfolio_projects SET title=?,company=?,role=?,status=?,date=?,type=?,summary=?,problem=?,solution=?,workflow=?,technologies=?,learnings=?,next_steps=?,updated_at=? WHERE id=?")
    .bind(clean(input.title,140),clean(input.company,100),clean(input.role,100),status,clean(input.date,50),clean(input.type,120),clean(input.summary,700),clean(input.problem,3000),clean(input.solution,4000),JSON.stringify((input.workflow || []).slice(0,30)),JSON.stringify((input.technologies || []).slice(0,30)),JSON.stringify((input.learnings || []).slice(0,30)),JSON.stringify((input.nextSteps || []).slice(0,30)),Date.now(),id).run();
  const row = await env.DB.prepare("SELECT id,title,company,role,status,date,type,summary,problem,solution,workflow,technologies,screenshots,learnings,next_steps FROM portfolio_projects WHERE id=?").bind(id).first<ProjectRow>();
  return row ? Response.json({ project: toProject(row) }) : Response.json({ error: "Project not found." }, { status: 404 });
}

export async function DELETE(request: Request) {
  if (!(await hasAdminAccess(request))) return Response.json({ error: "Owner access required." }, { status: 403 });
  if (!env.DB) return Response.json({ error: "Project storage is unavailable." }, { status: 503 });
  const id = new URL(request.url).searchParams.get("id")?.slice(0,80) || "";
  const row = await env.DB.prepare("SELECT screenshots FROM portfolio_projects WHERE id=?").bind(id).first<{ screenshots: string }>();
  if (!row) return Response.json({ error: "Project not found." }, { status: 404 });
  const files = readJson(row.screenshots) as { key: string }[];
  if (env.BUCKET) await Promise.all(files.map(file => env.BUCKET!.delete(file.key)));
  await env.DB.prepare("DELETE FROM portfolio_projects WHERE id=?").bind(id).run();
  return Response.json({ deleted: true });
}

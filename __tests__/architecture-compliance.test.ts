import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();

function getRoutes(): string[] {
  const routes: string[] = [];
  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        walk(full);
      } else if (entry.name.endsWith("route.ts") || entry.name.endsWith("route.tsx")) {
        routes.push(full);
      }
    }
  }
  walk(join(ROOT, "app/api"));
  return routes;
}

function getServices(): string[] {
  const services: string[] = [];
  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        walk(full);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
        services.push(full);
      }
    }
  }
  walk(join(ROOT, "services"));
  return services;
}

function getRepositories(): string[] {
  const repos: string[] = [];
  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        walk(full);
      } else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
        repos.push(full);
      }
    }
  }
  walk(join(ROOT, "repositories"));
  return repos;
}

describe("Route → Service → Repository Architecture Compliance", () => {
  const routes = getRoutes();
  const services = getServices();
  const repositories = getRepositories();

  it("routes must not import from repositories", () => {
    const violations: string[] = [];
    for (const route of routes) {
      const content = readFileSync(route, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes('from "@/repositories"') || line.includes("from '@/repositories'")) {
          violations.push(`${route}:${idx + 1}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it("repositories must not import from routes", () => {
    const violations: string[] = [];
    for (const repo of repositories) {
      const content = readFileSync(repo, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes('from "@/app/') || line.includes('from "@/routes"')) {
          violations.push(`${repo}:${idx + 1}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it("services must not import from route-helpers or next/server", () => {
    const violations: string[] = [];
    for (const service of services) {
      const content = readFileSync(service, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (line.includes('from "@/route-helpers"') || line.includes('from "next/server"') || line.includes('from "next"')) {
          violations.push(`${service}:${idx + 1}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });
});

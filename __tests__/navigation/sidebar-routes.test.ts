import fs from "fs";
import path from "path";
import { ALL_MENU_GROUPS } from "@/lib/config/menu.config";

describe("Navigation Route Verification (DEF-004 - 100% Zero-404 Guarantee)", () => {
  const appRootDir = path.resolve(process.cwd(), "app");

  // Helper function to verify if a page.tsx exists for a given route path
  function pageExistsForRoute(routePath: string): boolean {
    const cleanPath = routePath.split("?")[0].replace(/\/$/, "");
    if (!cleanPath || cleanPath === "") {
      return fs.existsSync(path.join(appRootDir, "page.tsx"));
    }

    // Check direct path in app (e.g., app/demo/page.tsx)
    const directPath = path.join(appRootDir, cleanPath, "page.tsx");
    if (fs.existsSync(directPath)) return true;

    // Check protected route path (e.g., app/(protected)/dashboard/page.tsx)
    const protectedPath = path.join(appRootDir, "(protected)", cleanPath, "page.tsx");
    if (fs.existsSync(protectedPath)) return true;

    // Check dynamic routes (e.g., app/(protected)/students/[id]/page.tsx)
    // Walk app directory and compare matching route segments
    const segments = cleanPath.split("/").filter(Boolean);
    function searchRoute(currentDir: string, segIdx: number): boolean {
      if (segIdx === segments.length) {
        return fs.existsSync(path.join(currentDir, "page.tsx"));
      }
      if (!fs.existsSync(currentDir)) return false;

      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        // Skip internal or special folders unless route grouping
        if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
          if (searchRoute(path.join(currentDir, entry.name), segIdx)) {
            return true;
          }
        } else if (entry.name === segments[segIdx] || entry.name.startsWith("[")) {
          if (searchRoute(path.join(currentDir, entry.name), segIdx + 1)) {
            return true;
          }
        }
      }
      return false;
    }

    return searchRoute(appRootDir, 0);
  }

  it("verifies all routes in menu.config.ts correspond to a real page.tsx on disk", () => {
    const allPaths: string[] = [];
    for (const group of ALL_MENU_GROUPS) {
      for (const item of group.items) {
        allPaths.push(item.path);
      }
    }

    expect(allPaths.length).toBeGreaterThan(0);
    const brokenRoutes: string[] = [];

    for (const routePath of allPaths) {
      const exists = pageExistsForRoute(routePath);
      if (!exists) {
        brokenRoutes.push(routePath);
      }
    }

    expect(brokenRoutes).toEqual([]);
  });

  it("verifies all route paths extracted from SidebarLayout.tsx correspond to a real page.tsx on disk", () => {
    const sidebarFilePath = path.resolve(process.cwd(), "components/SidebarLayout.tsx");
    const content = fs.readFileSync(sidebarFilePath, "utf8");

    // Extract path: "..." or path: '...'
    const matches = Array.from(content.matchAll(/path:\s*["']([^"']+)["']/g));
    const paths = Array.from(new Set(matches.map(m => m[1])));

    expect(paths.length).toBeGreaterThan(0);
    const brokenRoutes: string[] = [];

    for (const routePath of paths) {
      const exists = pageExistsForRoute(routePath);
      if (!exists) {
        brokenRoutes.push(routePath);
      }
    }

    expect(brokenRoutes).toEqual([]);
  });
});


const fs = require('fs');
const path = require('path');

// Recursively find all route.ts files in the api directory
function getRoutes(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = getRoutes(dirFile, filelist);
    } else if (file.endsWith('route.ts')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const apiDir = path.join(__dirname, '../app/api/v1');
const routes = getRoutes(apiDir);

routes.forEach(routePath => {
  let content = fs.readFileSync(routePath, 'utf8');

  // Check if the file imports withPermission from route-helpers
  if (content.includes('@/route-helpers') && content.includes('withPermission')) {
    // Clean up withPermission from route-helpers imports
    content = content.replace(/withPermission,\s*/g, '');
    content = content.replace(/,\s*withPermission/g, '');
    content = content.replace(/withPermission/g, '');
    
    // Clean up empty braces if left like `import { } from "@/route-helpers";`
    content = content.replace(/import\s*\{\s*\}\s*from\s*["']@\/route-helpers["'];?\n?/g, '');

    // Add correct import from @/lib/auth/rbac if not already present
    if (!content.includes('@/lib/auth/rbac')) {
      const rbacImport = 'import { withPermission } from "@/lib/auth/rbac";\n';
      content = rbacImport + content;
    }

    fs.writeFileSync(routePath, content, 'utf8');
    console.log(`✅ Fixed route: ${path.basename(routePath)}`);
  }
});

console.log('🎉 Bulk import fix script completed successfully.');

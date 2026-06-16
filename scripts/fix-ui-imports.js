const fs = require('fs');
const path = require('path');

// Recursively find all page.tsx files in the protected directory
function getPages(dir, filelist = []) {
  if (!fs.existsSync(dir)) return filelist;
  
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = getPages(dirFile, filelist);
    } else if (file.endsWith('page.tsx') || file.endsWith('layout.tsx')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
}

const protectedDir = path.join(__dirname, '../app/(protected)'); // راستہ اپنے پروجیکٹ کے مطابق سیٹ کریں
const pages = getPages(protectedDir);

let updatedCount = 0;

pages.forEach(pagePath => {
  let content = fs.readFileSync(pagePath, 'utf8');

  // Check if imports are already present to avoid duplication
  const hasRequirePermission = content.includes('RequirePermission');
  const hasPermissionsAuth = content.includes('PERMISSIONS');

  if (!hasRequirePermission || !hasPermissionsAuth) {
    const importsToAdd = `import RequirePermission from "@/components/RequirePermission";\nimport { PERMISSIONS } from "@/lib/auth/permissions";\n`;
    
    // Inject right after "use client" if it exists, otherwise at the very top
    if (content.includes('"use client";')) {
      content = content.replace('"use client";', '"use client";\n' + importsToAdd);
    } else if (content.includes("'use client';")) {
      content = content.replace("'use client';", "'use client';\n" + importsToAdd);
    } else {
      content = importsToAdd + content;
    }

    fs.writeFileSync(pagePath, content, 'utf8');
    console.log(`✅ Added imports to: ${path.relative(__dirname, pagePath)}`);
    updatedCount++;
  }
});

console.log(`🎉 Script completed! Updated ${updatedCount} files.`);

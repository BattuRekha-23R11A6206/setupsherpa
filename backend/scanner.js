const simpleGit = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

exports.scanRepository = async (repoUrl) => {
  const tempDir = `./temp-${Date.now()}`;
  const git = simpleGit();
  
  // Clone repo
  await git.clone(repoUrl, tempDir);
  
  const findings = {
    stack: [],
    services: [],
    envVars: [],
    commands: [],
    missingFiles: []
  };
  
  // Check for package.json
  const packagePath = path.join(tempDir, 'package.json');
  if (await fileExists(packagePath)) {
    const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    findings.stack.push(`Node.js ${pkg.engines?.node || ''}`.trim());
    
    // Detect services from dependencies
    if (pkg.dependencies) {
      if (pkg.dependencies.express || pkg.dependencies.koa) findings.services.push('Web Server');
      if (pkg.dependencies.redis || pkg.dependencies.ioredis) findings.services.push('Redis');
      if (pkg.dependencies.pg || pkg.dependencies.mongoose) findings.services.push('Database');
    }
    
    // Get commands from scripts
    if (pkg.scripts) {
      findings.commands.push('npm install');
      if (pkg.scripts.dev) findings.commands.push('npm run dev');
      if (pkg.scripts.start) findings.commands.push('npm run start');
    }
  }
  
  // Find environment variables
  const jsFiles = await glob(`${tempDir}/**/*.{js,jsx,ts,tsx}`, { nodir: true });
  const envVarsSet = new Set();
  
  for (const file of jsFiles.slice(0, 15)) { // Limit for performance
    try {
      const content = await fs.readFile(file, 'utf8');
      const envMatches = content.match(/process\.env\.([A-Z_]+)/g) || [];
      envMatches.forEach(match => envVarsSet.add(match.replace('process.env.', '')));
    } catch (e) { /* Skip unreadable files */ }
  }
  
  findings.envVars = Array.from(envVarsSet);
  
  // Check for common missing files
  if (!await fileExists(path.join(tempDir, '.env.example'))) {
    findings.missingFiles.push('.env.example');
  }
  
  if (!await fileExists(path.join(tempDir, 'docker-compose.yml')) && 
      await fileExists(path.join(tempDir, 'Dockerfile'))) {
    findings.missingFiles.push('docker-compose.yml');
  }
  
  // Cleanup
  await fs.rm(tempDir, { recursive: true, force: true });
  
  return findings;
};

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
const fs = require("fs");
const chalk = require("chalk");

function generateReport(result) {
  let output = `# SetupSherpa Report\n\n`;

  output += `## Detected Stack\n`;
  result.stack.forEach(s => output += `- ${s}\n`);

  output += `\n## Environment Variables\n`;
  if (result.envVars.length === 0) {
    output += `- None detected\n`;
  } else {
    result.envVars.forEach(v => output += `- ${v}\n`);
  }

  output += `\n## Environment Template\n`;
  output += result.hasEnvExample
    ? `- .env template found\n`
    : `⚠ No .env.example found\n`;

  fs.writeFileSync("setup.md", output);

  console.log(chalk.green("\n✔ Setup report generated: setup.md\n"));
}

module.exports = { generateReport };

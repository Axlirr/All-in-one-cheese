const fs = require('fs');
const path = require('path');

const root = process.cwd();
const interactionsDir = path.join(root, 'src', 'interactions', 'Command');
const commandsDir = path.join(root, 'src', 'commands');


function parseNames(text, regex) {
  const out = [];
  let m;
  while ((m = regex.exec(text)) !== null) out.push(m[1]);
  return out;
}

let missing = [];
for (const file of fs.readdirSync(interactionsDir).filter((f) => f.endsWith('.js'))) {
  const full = path.join(interactionsDir, file);
  const text = fs.readFileSync(full, 'utf8');

  const cmdMatch = text.match(/\.setName\('([^']+)'\)\s*\n\s*\.setDescription/);
  if (!cmdMatch) continue;
  const command = cmdMatch[1];

  const subs = parseNames(text, /addSubcommand\([\s\S]*?\.setName\('([^']+)'\)/g);
  if (!subs.length) continue;

  const folder = command;
  for (const sub of subs) {
    const p = path.join(commandsDir, folder, `${sub}.js`);
    if (!fs.existsSync(p)) missing.push(`${command} ${sub} -> ${p}`);
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} command handlers:`);
  missing.forEach((m) => console.error(` - ${m}`));
  process.exit(1);
}

console.log('Command health check passed ✅');

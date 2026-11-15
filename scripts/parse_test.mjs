import fs from 'fs';

(async () => {
  try {
    const babelParser = await import('@babel/parser');
    const html = fs.readFileSync('preview/index.html', 'utf8');
    const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
    if (!match) {
      console.log('No script found');
      return;
    }
    const script = match[1];
    babelParser.parse(script, {
      sourceType: 'module',
      plugins: ['jsx']
    });
    console.log('Babel parse success! No syntax error.');
  } catch (err) {
    console.error('Syntax Error detected:');
    console.error(err.message);
    if (err.loc) {
      console.error('Location:', err.loc);
      const html = fs.readFileSync('preview/index.html', 'utf8');
      const script = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/)[1];
      const lines = script.split('\n');
      console.error('Surrounding code:');
      for (let l = Math.max(0, err.loc.line - 5); l < Math.min(lines.length, err.loc.line + 5); l++) {
        console.error(`${l+1}: ${lines[l]}`);
      }
    }
  }
})();


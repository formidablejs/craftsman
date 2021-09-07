const fs = require('fs');

module.exports = (file, callback) => {
  if (fs.existsSync(file)) {
    const contents = fs.readFileSync(file, 'utf8');

    const lines = [];

    contents.split('\n').map((line, index) => {
      lines.push(callback(line, index));
    });

    fs.writeFileSync(file, lines.join('\n'), {
      encoding: 'utf8',
    });

    return true;
  }

  return false;
}

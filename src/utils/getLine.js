const fs = require('fs');

module.exports = (file, index) => {
  if (!fs.existsSync(file)) {
    throw new Error(`File ${file} does not exist`);
  }

  const contents = fs.readFileSync(file, 'utf8');

  for (let i = 0; i < contents.split('\n').length; i++) {
    if (i == index) {
      return contents.split('\n')[i];
    }
  }

  return null;
}

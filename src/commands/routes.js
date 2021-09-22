const { Command } = require('@oclif/command');
const path = require('path');

class RoutesCommand extends Command {
  async run() {
    const { Application } = require(path.join(process.cwd(), '.formidable', 'server.app.js'));

    await Application.then((app) => {
      console.table(app.routes());
    });

    this.exit();
  }
}

RoutesCommand.description = `List all formidable routes`;

module.exports = RoutesCommand;

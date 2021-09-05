const { Command, flags } = require('@oclif/command');
const { exec } = require('child_process')

class TestCommand extends Command {
  async run() {
    const { flags } = this.parse(TestCommand);

    const command = flags.watch ? 'npm run test:watch' : 'npm run test';

    const test = exec(command);

    test.stdout.on('data', (data) => {
      console.log(data);
    });

    test.stderr.on('data', (data) => {
      console.error(data);
    });
  }
};

TestCommand.description = `Run Formidable tests`;

TestCommand.flags = {
  watch: flags.boolean({ char: 'w', description: 'Watch for file changes' })
};

module.exports = TestCommand;

const { Command, flags } = require('@oclif/command');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const { default: chalk } = require('chalk');

class PublishCommand extends Command {
  async run() {
    const { flags } = this.parse(PublishCommand);

    const dir = path.join(process.cwd(), 'node_modules', flags.package);

    if (!flags.package) {
      return this.error('Missing package name');
    }

    if (!flags.vendor && !flags.config) {
      this.log('Nothing published');
    }

    let definition = path.join(dir, 'package.json');

    if (!fs.existsSync(definition)) {
      return this.error('Package is not installed');
    }

    definition = JSON.parse(fs.readFileSync(definition, 'utf8').toString());

    let install = definition['publisher'];

    if (!install) {
      return this.error('This package is not publishable');
    }

    install = path.join(dir,install);

    if (!fs.existsSync(install)) {
      return this.error('Publisher does not exist');
    }

    let installer = require(install).Package;

    installer = new installer();

    if (typeof installer.publish !== 'function') {
      return this.error('publish missing');
    }

    const publisher = installer.publish();

    if (flags.config) {
      if (!publisher.config.paths) {
        return console.log('Nothing to publish');
      }

      Object.keys(publisher.config.paths).forEach((entry) => {
        const file = path.join(dir, publisher.config.paths[entry]);

        if (fs.existsSync(entry)) {
          this.error(`${entry} already exists. Skipping...`);
        } else {
          fs.copyFileSync(file, entry);

          if (fs.existsSync(entry)) {
            this.log(chalk.green('Published ') + entry);
          } else {
            this.error(`${entry} not published.`);
          }
        }
      });
    }

    if (flags.vendor) {
      if (!publisher.vendor.paths) {
        return console.log('Nothing to publish');
      }

      Object.keys(publisher.vendor.paths).forEach((entry) => {
        const folder = path.join(dir, publisher.vendor.paths[entry]);

        if (fs.existsSync(entry)) {
          this.error(`${entry} already exists. Skipping...`);
        } else {
          fse.copySync(folder, entry);

          if (fs.existsSync(entry)) {
            this.log(chalk.green('Published ') + entry);
          } else {
            this.error(`${entry} not published.`);
          }
        }
      });
    }
  }
}

PublishCommand.description = `Install Formidable package`;

PublishCommand.flags = {
  package: flags.string({ char: 'p', description: 'Package name' }),
  config: flags.boolean({ char: 'c', description: 'Publish config', default: false }),
  vendor: flags.boolean({ char: 'v', description: 'Publish vendor', default: false }),
};


module.exports = PublishCommand;
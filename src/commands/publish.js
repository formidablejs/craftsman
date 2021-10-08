const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

class PublishCommand extends Command {
  async run() {
    const { flags } = this.parse(PublishCommand);

    const dir = path.join(process.cwd(), 'node_modules', flags.package);

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

    const tags = flags.tag.split(',');

    tags.forEach((tag) => {
      publish(tag, flags.force, installer, dir);
    });
  }
}

/**
 * Publish tag.
 *
 * @param {String} tag
 * @param {Boolean} force
 * @param {Object} installer
 * @param {String} dir
 * @returns {void}
 */
const publish = (tag, force, installer, dir) => {
  const publisher = installer.publish();

  if (!publisher[tag] || (publisher[tag] && (publisher[tag].paths == undefined || publisher[tag].paths == null))) {
    console.error(chalk.red(`${tag} is missing`));

    return;
  }

  if (typeof publisher[tag].paths !== 'object') {
    console.error(chalk.red(`${tag} is missing paths`));

    return;
  }

  Object.keys(publisher[tag].paths).forEach((entry) => {
    const file = path.join(dir, publisher[tag].paths[entry]);

    if (fs.existsSync(entry) && !force) {
      console.error(chalk.red(`${entry} already exists. Skipping...`));
    } else {
      fs.copySync(file, entry, { overwrite: true });

      if (fs.existsSync(entry)) {
        console.log(chalk.green('Published ') + entry);
      } else {
        console.error(`${entry} not published.`);
      }
    }
  });
}

PublishCommand.description = `Install Formidable package`;

PublishCommand.flags = {
  package: flags.string({ description: 'Package name', required: true }),
  force: flags.boolean({ description: `Overwrite any existing files`, default: false }),
  tag: flags.string({ description: 'One or many tags that have assets you want to publish (comma separated values allowed)', required: true }),
};


module.exports = PublishCommand;

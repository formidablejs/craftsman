const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const { cli } = require('cli-ux');
const { exec } = require('child_process');
const { copySync } = require('fs-extra');
const crypto = require('crypto');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const updateLine = require('../utils/updateLine');

const settings = {
  frontend: '',
  manager: '',
  location: process.cwd()
}

class InertiaCommand extends Command {
  async run() {
    if (!isWeb()) {
      throw new Error('Application was not installed using "craftsman new <name> --web".');
    }

    if (isAlreadyInstalled()) {
      throw new Error('Inertia is already installed.');
    }

    const npmLock = path.join(settings.location, 'package-lock.json');

    settings.manager = fs.existsSync(npmLock) ? 'npm' : 'yarn';

    const { args, flags } = this.parse(InertiaCommand);

    if (!flags.frontend) {
      const res = await inquirer.prompt([{
        name: 'frontend',
        message: 'Which frontend framework do you want to use?',
        type: 'list',
        default: 'Vue',
        choices: [
          { name: 'Vue' },
          { name: 'React' },
        ],
      }]);

      flags.frontend = res.frontend;
    }

    settings.frontend = flags.frontend;

    cli.action.start('Installing @formidablejs/inertia');

    installInertia();
  }
}

const isWeb = () => {
  const config = path.join(settings.location, 'config', 'app.imba');

  if (!fs.existsSync(config)) return false;

  const configContent = fs.readFileSync(config).toString();

  return configContent.includes('PrettyErrorsServiceResolver');
}

const isAlreadyInstalled = () => {
  const package = path.join(settings.location, 'package.json');

  const packageContent = fs.readFileSync(package).toString();

  return packageContent.includes('@formidablejs/inertia');
}

const installInertia = () => {
  const install = exec(
    settings.manager == 'npm'
      ? `npm i @formidablejs/inertia`
      : `yarn add @formidablejs/inertia`,
    { cwd: settings.location }
  );

  install.stderr.on('data', (data) => {
    if (
      data.trim().toLowerCase().startsWith('err')
      || data.trim().toLowerCase().startsWith('npm err')
      || data.trim().toLowerCase().startsWith('/bin/sh:')
    ) {
      console.error(data);

      cli.action.stop('Failed');

      process.exit(0);
    }
  });

  install.on('exit', () => {
    cli.action.start('Configuring Inertia');

    const appConfig = path.join(settings.location, 'config', 'app.imba');

    updateLine(appConfig, (line, index) => {
      if (line.trim().startsWith('import { ValidationServiceResolver }')) {
        return `${line}\nimport { InertiaServiceResolver } from '@formidablejs/inertia'`
      }

      if (line.trim() == 'MaintenanceServiceResolver') {
        return `${line}\n		InertiaServiceResolver`
      }

      return line;
    });

    const indexConfig = path.join(settings.location, 'config', 'index.imba');

    updateLine(indexConfig, (line, index) => {
      if (line.trim().startsWith('import hashing')) {
        return `${line}\nimport inertia from './inertia'`
      }

      if (line.trim() == 'hashing') {
        return `${line}\n			inertia`
      }

      return line;
    });

    /** remove welcome.imba file */
    const welcomeImba = path.join(settings.location, 'resources', 'views', 'welcome.imba');

    if (fs.existsSync(welcomeImba)) {
      fs.rmSync(welcomeImba);
    }

    cli.action.start('Publishing assets');

    exec('craftsman publish --package=@formidablejs/inertia --tag="vendor" --force', {
      cwd: settings.location
    });

    const presetPath = path.join(settings.location, 'node_modules', '@formidablejs/inertia', 'formidable', 'presets', settings.frontend.toLowerCase(), 'preset.json');
    const preset = JSON.parse(fs.readFileSync(presetPath).toString());
    const presetFiles = path.join(settings.location, 'node_modules', '@formidablejs/inertia', 'formidable', 'presets', settings.frontend.toLowerCase(), preset.files)

    copySync(presetFiles, settings.location)

    const packageName = path.join(settings.location, 'package.json');
    const package = JSON.parse(fs.readFileSync(packageName).toString());

    package.scripts = Object.assign(package.scripts, preset.npm.scripts);
    package.devDependencies = Object.assign(package.devDependencies, preset.npm.devDependencies);

    fs.writeFileSync(packageName, JSON.stringify(package, null, 2));

    cli.action.start(`Installing ${settings.frontend} dependencies`);

    const installFrontendDeps = exec(
      settings.manager == 'npm'
        ? `npm i --legacy-peer-deps`
        : `yarn install --force`,
      { cwd: settings.location }
    );

    installFrontendDeps.stderr.on('data', (data) => {
      if (
        data.trim().toLowerCase().startsWith('err')
        || data.trim().toLowerCase().startsWith('npm err')
        || data.trim().toLowerCase().startsWith('/bin/sh:')
      ) {
        console.error(data);

        cli.action.stop('Failed');

        process.exit(0);
      }
    });

    installFrontendDeps.on('exit', () => {
      cli.action.stop('Done');

      console.log(chalk.green('\n✅ Inertia installation was successful!'));
      console.log(chalk.green('👉 Get started with the following commands:\n'));
      console.log(chalk.dim(`$  ${settings.manager} run mix:dev`));
      console.log(chalk.dim(`$  ${settings.manager} start`));
    })
  });
}

InertiaCommand.description = `Install Inertia`;

InertiaCommand.flags = {
  frontend: flags.string({ options: ['Vue', 'React'], char: 'e' }),
}

module.exports = InertiaCommand;

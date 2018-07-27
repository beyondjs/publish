require('colors');

let config;
try {
    config = require('./config.json');
} catch (exc) {
    console.log('Error reading config.json file', exc.message);
}

const application = config.application;
const os = config.os;
const environment = config.environment;
const language = config.language;
const platform = config.platform;
const version = config.version;

let source = config.source;
let target = config.target;

source = `${source}/${application}.${platform}/${environment}/${os}/${language}`;
target = `${target}/${application}.${os}`;

const git = require('simple-git/promise')(target);

const {promisify} = require('util');
const ncp = promisify(require('ncp').ncp);

console.log(`Deploying ${application} ${platform} - ${environment}`.bold);
console.log(`\tFrom: ${source}`.green);
console.log(`\tTo: ${target}\n`.green);

(async function () {

    try {
        console.log('Pulling to avoid merge conflicts');
        await git.pull('origin', 'master');
        console.log('\tOk'.green);
    } catch (exc) {
        console.log('Error pulling branch'.red, exc.stack.message);
    }

    try {
        console.log('Remove all previous files of the repository');
        await git.rm('./*');
        console.log('\tPrevious files are removed'.green);
    } catch (exc) {
        console.log('Error removing git files'.red, exc.message);
    }

    try {
        console.log('Copy all application files');
        await ncp(source, target);
        console.log('\tAll application files are copied'.green);
    } catch (exc) {
        console.log('Error copying application files'.red, exc.stack);
        return;
    }

    try {
        console.log('Add all files to the repository');
        await git.add('*');
        console.log('\tFiles added to repository'.green);
    } catch (exc) {
        console.log('Error adding git files'.red, exc.message);
        return;
    }

    async function commit() {

        try {
            console.log('Commit changes');
            await git.commit(`Version ${version}`);
            console.log('\tChanges commited! :)'.green);
        } catch (exc) {
            console.log('Error pushing changes'.red, exc.message);
        }

    }

    try {
        console.log('Check for changes');
        let status = await git.status();
        if (!status.modified) {
            console.log('\tRepository has no changes'.green);
        } else {
            console.log(`\t${status.not_added.length} files added to the repository`.green);
            await commit();
        }
    } catch (exc) {
        console.log('Error checking repository status'.red, exc.message);
        return;
    }

    try {
        console.log('Push changes');
        await git.push('origin', 'master');
        console.log('\tOk'.green);
        console.log('\nAll steps done! :)'.bold);
    } catch (exc) {
        console.log('Error pushing changes'.red, exc.message);
    }

})();

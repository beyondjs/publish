require('colors');

const application = 'superliga';
const os = 'android';
const environment = 'production';
const language = 'spa';
const platform = 'phonegap';

let source = '/Users/enriquebox/Documents/code/efan/build';
let destination = '/Users/enriquebox/Documents/code/apps';

source = `${source}/${application}.${platform}/${environment}/${os}/${language}`;
destination = `${destination}/${application}.${os}`;

const git = require('simple-git/promise')(destination);

const {promisify} = require('util');
const ncp = promisify(require('ncp').ncp);

const version = '1.0.4';

console.log(`Deploying ${application} ${platform} - ${environment}`.bold);
console.log(`\tFrom: ${source}`.green);
console.log(`\tTo: ${destination}\n`.green);

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
        await ncp(source, destination);
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

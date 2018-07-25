require('colors');

const source = '/Users/enriquebox/Documents/code/efan/build/superliga.phonegap/production/ios/spa';
const destination = '/Users/enriquebox/Documents/code/apps/superliga.ios';
const git = require('simple-git/promise')(destination);

const {promisify} = require('util');
const ncp = promisify(require('ncp').ncp);

const version = '1.0';

(async function () {

    try {
        console.log('Pulling to avoid merge conflicts');
        await git.pull('origin', 'master');
        console.log('\tOk');
    } catch (exc) {
        console.log('Error pulling branch', exc.stack.message);
    }

    try {
        console.log('Remove all previous files of the repository');
        await git.rm('./*');
        console.log('\tPrevious files are removed');
    } catch (exc) {
        console.log('Error removing git files', exc.message);
    }

    try {
        console.log('Copy all application files');
        await ncp(source, destination);
        console.log('\tAll application files are copied');
    } catch (exc) {
        console.log('Error copying application files', exc.stack);
        return;
    }

    try {
        console.log('Add all files to the repository');
        await git.add('*');
        console.log('\tFiles added to repository');
    } catch (exc) {
        console.log('Error adding git files', exc.message);
        return;
    }

    async function commit() {

        try {
            console.log('Commit changes');
            await git.commit(`Version ${version}`);
            console.log('\tChanges commited! :)');
        } catch (exc) {
            console.log('Error pushing changes', exc.message);
        }

    }

    try {
        console.log('Check for changes');
        let status = await git.status();
        if (!status.modified) {
            console.log('Repository has no changes');
        } else {
            console.log(`${status.not_added.length} files added to the repository`);
            await commit();
        }
    } catch (exc) {
        console.log('Error checking repository status', exc.message);
        return;
    }

    try {
        console.log('Push changes');
        await git.push('origin', 'master');
        console.log('\nAll steps done! :)'.green);
    } catch (exc) {
        console.log('Error pushing changes', exc.message);
    }

})();

const source = '/Users/enriquebox/Documents/code/efan/build/superliga.phonegap/production/ios/spa';
const destination = '/Users/enriquebox/Documents/code/apps/superliga.ios';
const git = require('simple-git/promise')(destination);
const ncp = require('ncp').ncp;

(async function () {

    try {

        // Pull to avoid merge conflicts
        // await git.pull('origin', 'master');

    } catch (exc) {
        console.log(exc.stack);
    }

    try {

        // Remove all previous files of the repository
        await git.rm('./*');
        await ncp(source, destination);

        let status = await git.status();
        if (!status.modified) {
            console.log('Repository has no changes');
            return;
        }

        await git.push('origin', 'master');
        console.log('done');

    } catch (exc) {
        console.log(exc.stack);
    }

})();

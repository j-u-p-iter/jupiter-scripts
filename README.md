# Jupiter Scripts

Handy dandy scripts, I use in all my own packages. It allows you not to setup all build, transpile and compile tools again and adain and again. To build, publish, run CI, tests and etc. you should just install this package and run one of many scripts it allows you to run.

# Description
- We build this package with tsc
- All options we pass to jupiter-scripts bin, like --watch and etc. we retranslate - repass to bin we call, using jupiter-scripts: build, lint, test.
  So:
  `jupiter-scripts build --bundle --watch command`
  will pass --watch option to rollup bin. And the result command will be:
  `rollup --watch`

## How to work with this package

### Install it

`yarn add @j.u.p.iter/jupiter-scripts`

### Point out scripts

In scripts section of your package.json file you should point out all necessary scripts you want to run with this package. Example of such section you can find in one my packages. For example, here: https://github.com/j-u-p-iter/react-hooks/blob/master/package.json#L17-L24

### Create start boilerplate for your package.

Write start boilerplate code for your package. Code of all my packages has one common structure (describe structure of package in separate .md file of this package).

### Run `start` script (https://github.com/j-u-p-iter/jupiter-scripts/issues/25)

Run start script. This script will listen all your changes and rebuild result bundle on each your change. My advice - to look at the terminal, where you run this script from time to time. You can find here some run time issues - you need to fix, before move further. It's always great to have habbit - to check this terminal from time to time.

### Setup testing environment

Create file for your future specs and do all necessary testing environment setups. We respect TDD and we prefer to write code in form of TDD.

### Run `test` script

Terminal with this script in running mode will be one more indicator, that we're on right way towards our goal.


### Check all indicators from time to time

Terminal windows with running `start` and `test` scripts are great indicators, that everything is going well. But as soon as you detacted any issues there. You should stop further development and fix these issues at first. Never continue developing, when you have issues to fix. At first you should fix them and after that go further.

You work is done, when you wrote everything you've planned and your tests are green and have 100% test coverage.
Package won't be published on CI if:
- you have lint issues
- your build is broken
- your tests fail
- all your tests pass, but you have less than 100% test coverage

### Run `lint:fix` after you finish work with package

This will allow your to fix most lint issues you currently have automatically. Some of these issues can't be fixed automatically. You will be notified about this cases in terminal, where you run `lint:fix`. You should fix these issues manually.

### Run `commit` script

Now you can add your changes and commit them. We commit all changes also with script. You'll see some prompt you should pass before your commit will be created.

### Push your changes to master branch

You finish with your package. You can push them into master branch. By default we run CI only if changes appear in master branch. You can configure this stuff in .travis.yml (one of the file, that sits in boilerplate code), but in most cases master branch is the only branch you need and you don't need to do these changes.

### Add your new repo to https://travis-ci.com


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

### Run `start` script

Run start script. This script will listen all your changes and rebuild result bundle on each your change. My advice - to look at the terminal, where you run this script from time to time. You can find here some run time issues - you need to fix, before move further. It's always great to have habbit - to check this terminal from time to time.


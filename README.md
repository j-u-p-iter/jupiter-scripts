# scripts
Handy dandy scripts ;)

# Description
- We build this package with tsc
- All options we pass to jupiter-scripts bin, like --watch and etc. we retranslate - repass to bin we call, using jupiter-scripts: build, lint, test.
  So:
  `jupiter-scripts build --bundle --watch command`
  will pass --watch option to rollup bin. And the result command will be:
  `rollup --watch`


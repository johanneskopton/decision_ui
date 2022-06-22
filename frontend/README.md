# Decision UI

A web interface for decision support using influence diagrams and Monte Carlo simulations.

> A Vue.js project

## Installation

```bash
# install dependencies
npm install
```

## Serve for development

```bash
# serve with hot reload at localhost:8080
npm run dev
```

## Testing

```bash
# run all tests
npm test
```

## Deploy for production

```bash
# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# deploy on github pages
git checkout deploy     # change to deploy branch
git add -f dist/        # add build dir even its on gitignore
git push origin HEAD    # push
# make 'gh-pages' branch a subtree of the dist dir of the deploy branch
git subtree push --prefix dist origin gh-pages
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

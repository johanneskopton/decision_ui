# Decision UI Frontend

A web interface for decision analysis using influence diagrams. Made with baklavsjs and vue.

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

# deploy on the github pages of this repo
git checkout deploy                 # change to deploy branch
git add -f dist/                    # add build dir even its on gitignore
git commit -m "Deploy."             # commit
git push                            # push
git push origin --delete gh-pages   # if necessary
# make 'gh-pages' branch a subtree of the dist dir of the deploy branch
git subtree push --prefix frontend/dist origin gh-pages
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

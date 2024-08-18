
# Default Template

This is a template that leverages the experimental templates feature in the `pkg.pr.new` tool.

## Overview

Templates are particularly useful for creating live, interactive examples of your packages, which can be very beneficial for both development and documentation purposes.

As a user, you can check the package.json file and see the new generated packages! You can just copy those and put them in your package.json or install them with your favorite package manager.


```sh
npm i https://pkg.pr.new/Sight-wcg/layui-layer/@morning-star/layer@941e2ed
```


## Usage

To use this feature as a maintainer, you can run the following command:

```sh
npx pkg-pr-new publish './packages/A' --template './examples/*'
```

## Benefits

- Interactive Demos: Automatically create live demos that users can interact with directly in their browser.
- Enhanced Testing: Quickly spin up environments to test your package in different scenarios.
- Improved Sharing: Easily share working examples of your package with collaborators or users without needing them to set up their environment.

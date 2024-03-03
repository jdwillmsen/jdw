# JDW Monorepo

[![CI](https://github.com/jdwillmsen/jdw/actions/workflows/ci.yml/badge.svg)](https://github.com/jdwillmsen/jdw/actions/workflows/ci.yml)

## Running tasks

To execute tasks with Nx use the following syntax:

```
npx nx <target> <project> <...options>
```

You can also run multiple targets:

```
npx nx run-many -t <target1> <target2>
```

or add `-p` to filter specific projects

```
npx nx run-many -t <target1> <target2> -p <proj1> <proj2>
```

Targets can be defined in the `package.json` or `projects.json`. [Learn more](https://nx.dev/features/run-tasks).

## Explore the project graph

Run `npx nx graph` to show the graph of the workspace.
It will show tasks that you can run with Nx. [Learn more](https://nx.dev/core-features/explore-graph)

## Project Details

✨ **This workspace has been generated by [Nx, Smart Monorepos · Fast CI.](https://nx.dev)** ✨

### Developers

- Jake Willmsen

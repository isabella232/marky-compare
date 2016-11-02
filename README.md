# marky-compare
> check how npm's markup compares to github's

## up and running

1. fork and clone this repo
2. `cd marky-compare`
3. `npm install`

## usage

```
index.js --package <package-name>
```

this command generates a `diff.diff` file. grab that content and throw it in a [gist]!

for example:

```
index.js --package marky-markdown
```

... generates [this file](https://gist.github.com/ashleygwilliams/9250718913c86e6c44f49e219baada45).

[gist]: https://gist.github.com

404 Image Checker

- Checks a web address for 404 and if it is, waits till it's not and lets you know.
- Also checks if an image gets modified if its an image and not 404.

## How to use

```
node image-checker.js "http://www.sourcecertain.com/img/Example.png" -f
```

Wrap URLs in "" like the above
`-f` for when using trailing slashes


##TODO
- Currently only uses the last url specified (check how `processUrlArguments() work)
- Image updating checking doesn't work (possibly use image hashing)
- pass function to httpRequest rather than having logic tied to it


## Help

Trailing slashes
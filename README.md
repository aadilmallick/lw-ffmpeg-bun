# lw-ffmpeg-bun

## Intro

The 854 byte GZIpped library wrapper around ffmpeg.

```ts
import FFMPEGManipulator from "lw-ffmpeg-bun";
```

## Setup

Have a folder structure where all typescript is inside a `src` folder, and application entrypoint is in `src/index.ts`.

1.  Create a build script that appropiately compiles the `src/index.ts` file into a `dist` folder. Make sure you target bun, else it will not work.

    ```bash
    bun build --target=bun --outdir dist src/index.ts
    ```

2.  Install a `.d.ts` generator library with `bun add --save-dev dts-bundle-generator` with `bun add -D dts-bundle-generator`. Go here for more info: [dts bundle generator github](https://github.com/timocov/dts-bundle-generator)

    ```bash
    dts-bundle-generator --out-file dist/index.d.ts src/index.ts
    ```

3.  Create the build script in the package json

    ```json
    {
      "scripts": {
        "build": "bun build --minify --target=bun --outdir dist src/index.ts && bun run compile-declaration",
        "compile-declaration": "dts-bundle-generator --out-file dist/index.d.ts src/index.ts"
      }
    }
    ```

4.  Set tsconfig:

    ```json
    {
      "compilerOptions": {
        "lib": ["ESNext"],
        "target": "ESNext", // necessary
        "module": "ESNext", // necessary for import.meta.env to work
        "declaration": true, // outputs .d.ts files
        "outDir": "./dist",
        "strict": true,
        "esModuleInterop": true,
        "moduleResolution": "Node", // necessary for no errors
        "skipLibCheck": true
      },
      "include": ["src/index.ts"], // compile entrypoint
      "exclude": ["node_modules", "dist"]
    }
    ```

5.  Set package json, point to entry points and type declarations

    ```json
    {
      "name": "lw-ffmpeg-bun",
      "main": "dist/index.js",
      "module": "dist/index.js",
      "files": ["dist"],
      "type": "module",
      "types": "dist/index.d.ts",
      "devDependencies": {
        "@types/bun": "latest",
        "dts-bundle-generator": "^9.5.1"
      },
      "peerDependencies": {
        "typescript": "^5.0.0"
      },
      "scripts": {
        "build": "bun build --minify --target=bun --outdir dist src/index.ts && bun run compile-declaration && cp src/info.bun.sh dist",
        "compile-declaration": "dts-bundle-generator --out-file dist/index.d.ts --project ./tsconfig.json --no-check src/index.ts"
      },
      "version": "1.0.0",
      "author": "aadilmallick",
      "keywords": ["ffmpeg", "bun"],
      "license": "MIT",
      "description": "A bun wrapper for ffmpeg",
      "repository": {
        "type": "git",
        "url": "git+https://github.com/aadilmallick/lw-ffmpeg-bun.git"
      }
    }
    ```

#!/usr/bin/env node
const cloudinary = require('cloudinary').v2;
const { join } = require('path');
const fs = require('fs');
const { readdir } = require('fs').promises;

const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

for (const k in envConfig) {
    process.env[k] = envConfig[k]
}

const directory = process.env.npm_config_dir;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = function(file) {
    var rel = file.replace(directory + '/', '');
    cloudinary.uploader.upload(file, {
        public_id: rel.slice(0, -4),
        use_filename: true,
        unique_filename: false,
    }, function(error, result) {
        console.log(result, error)
    });
}

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = join(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

;(async () => {
    for await (const f of getFiles(directory)) {
        upload(f);
    }
})()

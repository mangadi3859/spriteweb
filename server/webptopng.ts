import { exec } from "child_process";
import { dirname, basename } from "path";
import { PassThrough } from "stream";
import fs from "fs";

export default function webptopng(path: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (!fs.existsSync(path)) reject(new Error("ERROR FILE NOT FOUND: " + path));
        let proc = exec(`cd bin/ffmpeg/bin & ffmpeg.exe -i ${path} -y ${dirname(path)}\\${basename(path)}.png`);
        proc.on("error", reject);
        proc.on("exit", () => resolve(`${dirname(path)}/${basename(path)}.png`));
    });
}

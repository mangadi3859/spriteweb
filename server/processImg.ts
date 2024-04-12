import Jimp from "jimp";

const SLICE_HEIGHT = 32;

export interface IOpts {
    width: number;
    height: number;
}

export type Slice = [number, number];

export default async function processImage(path: string, slices: Slice[], opts: IOpts = { height: 600, width: 600 }): Promise<Buffer> {
    const sprite = await Jimp.read(path);
    const fixedImage = new Jimp(opts.width, opts.height);

    for (let i = 0; i < slices.length; i++) {
        const slice = sprite.clone().crop(0, slices[i][1] * SLICE_HEIGHT, sprite.getWidth(), SLICE_HEIGHT);
        fixedImage.blit(slice, slices[i][0] * -1, i * SLICE_HEIGHT - 2 * i).crop(0, 0, opts.width, opts.height);
    }

    return fixedImage.getBufferAsync("image/png");
}

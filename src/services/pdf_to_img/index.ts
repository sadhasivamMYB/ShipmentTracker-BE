import { pdf } from "pdf-to-img";
import fs from "node:fs/promises";


export default async function convertPdfToImg(filePath: string) {

    const buffer = await fs.readFile(filePath)

    // console.log(buffer, "✅✅✅✅")
    const document = await pdf(buffer, { scale: 4 });

    let page = 1;

    for await (const image of document) {
        await fs.writeFile(`temp/page-${page}${Date.now()}.png`, image);

        console.log(`Page ${page} converted`);

        page++;
    }
}

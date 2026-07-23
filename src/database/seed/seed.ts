import { seedDocumentTypes } from "./documentType.seed";
import { seedFieldDefinitions } from "./field_defination.seed";


async function seed() {

    console.log("Seeding document types...");
    await seedDocumentTypes();

    console.log("Seeding field definitions...");
    await seedFieldDefinitions();

    console.log("Done.");
}

seed()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
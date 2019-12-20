const fs = require("fs").promises;

const GH_USERNAME = "umstek";

(async function Prepare() {
  const buffer = await fs.readFile("package.json");
  const object = JSON.parse(buffer.toString());
  object.name = `@${GH_USERNAME}/${object.name}`;
  await fs.writeFile("package.json", JSON.stringify(object, null, 2));
})();

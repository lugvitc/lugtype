import * as fs from "fs";
import * as path from "path";

/**
 * Map containing reserved classes by module
 */
const modules2 = {
  solid: [], //leave empty
  brands: ["fa-github", "fa-twitter", "fa-discord", "fa-patreon", "fa-google"],
  "fixed-width": ["fa-fw"],
  "rotated-flipped": ["fa-rotate-90", "fa-rotate-180", "fa-rotate-270"],
  animated: ["fa-spin"],
};

/**
 * fontawesome icon config
 * @typedef {Object} FontawesomeConfig
 * @property {string[]} solid - used solid icons without `fa-` prefix
 * @property {string[]} brands - used brands icons without `fa-` prefix
 */

/**
 * Detect used fontawesome icons in the directories `src/**` and `static/**{.html|.css}`
 * @param {boolean} debug - Enable debug output
 * @returns {FontawesomeConfig} - used icons
 */

export function getFontawesomeConfig(debug = false) {
  const time = Date.now();
  const srcFiles = findAllFiles(
    "./src",
    (filename) => !filename.endsWith("fontawesome.scss") //ignore our own css
  );
  const staticFiles = findAllFiles(
    "./static",
    (filename) => filename.endsWith(".html") || filename.endsWith(".css")
  );

  const allFiles = [...srcFiles, ...staticFiles];
  const usedClassesSet = new Set();

  const regex = /\bfa-[a-z0-9-]+\b/g;

  for (const file of allFiles) {
    const fileContent = fs.readFileSync("./" + file).toString();
    const matches = fileContent.match(regex);

    if (matches) {
      matches.forEach((match) => {
        const [icon] = match.split(" ");
        usedClassesSet.add(icon);
      });
    }
  }

  const usedClasses = new Array(...usedClassesSet).sort();
  const allModuleClasses = Object.values(modules2).flatMap((it) => it);

  const solid = usedClasses
    .filter((it) => !allModuleClasses.includes(it))
    .map((it) => it.substring(3));

  const brands = usedClasses
    .filter((it) => modules2.brands.includes(it))
    .map((it) => it.substring(3));

  if (debug === true) {
    console.debug(
      "Make sure fontawesome modules are active: ",
      Object.entries(modules2)
        .filter((it) => usedClasses.filter((c) => it[1].includes(c)).length > 0)
        .map((it) => it.name)
        .filter((it) => it !== "brands")
        .join(", ")
    );

    console.debug(
      "Here is your config: \n",
      JSON.stringify({
        solid,
        brands,
      })
    );
    console.debug("Detected fontawesome classes in", Date.now() - time, "ms");
  }

  return {
    solid,
    brands,
  };
}

//detect if we run this as a main
if (import.meta.url.endsWith(process.argv[1])) {
  getFontawesomeConfig(true);
}

function toFileAndDir(dir, file) {
  const name = path.join(dir, file);
  return { name, isDirectory: fs.statSync(name).isDirectory() };
}

function findAllFiles(dir, filter = (filename) => true) {
  return fs
    .readdirSync(dir)
    .map((it) => toFileAndDir(dir, it))
    .filter((file) => file.isDirectory || filter(file.name))
    .reduce((files, file) => {
      return file.isDirectory
        ? [...files, ...findAllFiles(file.name, filter)]
        : [...files, file.name];
    }, []);
}

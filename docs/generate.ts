import { walk } from "https://deno.land/std@0.88.0/fs/mod.ts";

interface DocClass {
  name: string;
  src: string;
  jsDoc: string | null;
  attributes: DocClassAttribs[];
}

interface DocClassAttribs {
  name: string;
  src: string;
  jsDoc: string | null;
  returnType: string | undefined;
}

const classes: Map<string, DocClass> = new Map();

// Read all .json files
async function filenameList() {
  const result = [];
  for await (const entry of walk("./core")) {
    result.push(entry.path);
  }
  return result;
}
// readFilesNames();

async function produceJSON(fname: string, result: any[]) {
  // const data = Deno.readTextFileSync(fname);
  const p = Deno.run({
    cmd: ["deno", "doc", "--json", fname],
    stdout: "piped",
    stderr: "piped",
  });
  const { code } = await p.status();
  if (code === 0) {
    const rawOutput = await p.output();
    return result.concat((JSON.parse(new TextDecoder().decode(rawOutput))));
  } else {
    const rawError = await p.stderrOutput();
    const errorString = new TextDecoder().decode(rawError);
    console.error(errorString);
  }
  return result;
}

type DocType =
  { location: { filename: string, line: number }
  , name: string
  , kind: string
  , typeAliasDef: { tsType: { kind: string, union: { repr: string, kind: string, literal: { kind: string, string: string } }[] } }
  , classDef:
    { properties: { jsDoc: string, kind: string, name: string, isStatic: boolean }[]
    , methods:
      { kind: string
      , name: string
      , jsDoc: string
      , location: { filename: string, line: number }
      , functionDef: { returnType: { repr: string, kind: string } }
      }[]
    }
  }


function buildSrc(location: { filename: string, line: number }) {
  const srcBase = "https://github.com/HugoDaniel/shader_canvas/blob/main/"
  const fname = location.filename.split("/");
  const src = srcBase + fname.slice(fname.indexOf("shader_canvas" + 1)).join("/")
  return `${src}#L${location.line}`;
}

function docToClass(doc: DocType) {
    if (doc.kind === "class") {
      // find tag property
      if (!doc.classDef.properties || !Array.isArray(doc.classDef.properties)) {
        return;
      }
      const tag = doc.classDef.properties.find(p => p.name === "tag");
      if (!tag || !tag.jsDoc) { return }
      // find getters
      const attribs = doc.classDef.methods.filter(m => m.kind === "getter").map(m => ({
        name: m.name,
        src: buildSrc(m.location),
        jsDoc: m.jsDoc,
        returnType: m?.functionDef?.returnType?.repr
      }));

      return ({
        name: doc.name,
        src: buildSrc(doc.location),
        jsDoc: tag.jsDoc,
        attributes: attribs
      })
    }
}

function classToMd(c: DocClass | undefined) {
  if (!c) { return "" }
  const attributes = c.attributes.filter(a => a.jsDoc !== null);
  let attributesMarkdown = "";
  if (attributes.length > 0) {
    attributesMarkdown =
`### Attributes

${attributes.map(a =>
`#### _[${a.name}](${a.src})_

${a.jsDoc}`).join("\n")}
`
  }
  return (
`${c.jsDoc}

_[[View Source]](${c.src})_

${attributesMarkdown}
`
);
}


async function generate() {
  let all: any[] = [];
  let markdown = "";
  // Start with the <shader-canvas> tag:

  // Walk down the code directories
  const filenames = await filenameList();

  for(const file of ["shader_canvas.ts", ...filenames]) {
    const fileInfo = await Deno.stat(file);
    if (fileInfo.isFile) {
      all = await produceJSON(file, all)
    }
  }

  // Produce classes and markdown
  console.log(
    all.map(docToClass)
       .filter(d => d && d.jsDoc !== null)
       .map(classToMd)
       .filter(a => a !== null || a !== undefined)
       .join("\n")
  )
}

/*
.then((a) => {
  if (a && a.length > 0)  {
    console.log(classToMd(docToClass(a[0])))
  }
})
*/

generate();

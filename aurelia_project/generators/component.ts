import { inject } from 'aurelia-dependency-injection';
import { Project, ProjectItem, CLIOptions, UI } from 'aurelia-cli';
import * as path from 'path';

@inject(Project, CLIOptions, UI)
export default class ElementGenerator {
  constructor(
    private project: Project,
    private options: CLIOptions,
    private ui: UI
  ) {}

  async execute() {
    const name = await this.ui.ensureAnswer(
      this.options.args[0],
      'What would you like to call the component?'
    );

    const subFolders = await this.ui.ensureAnswer(
      this.options.args[1],
      "What sub-folder would you like to add it to?\nIf it doesn't exist it will be created for you.\n\nDefault folder is the source folder (src).",
      '.'
    );

    let fileName = this.project.makeFileName(name);
    let className = this.project.makeClassName(name);

    this.project.root.add(
      ProjectItem.text(
        path.join(subFolders, fileName, fileName + '.ts'),
        this.generateJSSource(className, fileName)
      ),
      ProjectItem.text(
        path.join(subFolders, fileName, fileName + '.html'),
        this.generateHTMLSource(fileName, subFolders)
      ),
      ProjectItem.text(
        path.join(subFolders, fileName, fileName + '.scss'),
        this.generateSCSSSource(fileName)
      )
    );

    await this.project.commitChanges();
    await this.ui.log(
      `Created ${name} in the '${path.join(
        this.project.root.name,
        subFolders
      )}' folder`
    );
  }

  generateJSSource(className, fileName) {
    return `import {bindable} from 'aurelia-framework';
import './${fileName}.scss';

export class ${className} {
  @bindable value = '${className}';
}
`;
  }

  generateHTMLSource(fileName, subFolders) {
    return `<template>
  <button> <a href="#${subFolders}/${fileName}">${fileName}</a> </button>
  <require from='../${fileName}/${fileName}'></require>


  <h1>\${value}</h1>
</template>`;
  }

  generateSCSSSource(fileName) {
    return `
${fileName} {

}`;
  }
}

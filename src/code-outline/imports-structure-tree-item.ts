import { ExternalModuleImport, Import, NamedImport, NamespaceImport, Resource, StringImport } from 'typescript-parser';
import { ExtensionContext, TreeItemCollapsibleState } from 'vscode';

import BaseStructureTreeItem from './base-structure-tree-item';

/**
 * Import specifier tree item that represents a specific (named) import of an import statement.
 *
 * @export
 * @class ImportSpecifierStructureTreeItem
 * @extends {BaseStructureTreeItem}
 */
export class ImportSpecifierStructureTreeItem extends BaseStructureTreeItem {
  constructor(name: string, tsImport: Import, context: ExtensionContext) {
    super(name);
    this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/default.svg');
    this.command = this.createJumpToCommand([tsImport]);
  }
}

/**
 * Structure item that represents an import in a file.
 *
 * @export
 * @class ImportStructureTreeItem
 * @extends {BaseStructureTreeItem}
 */
export class ImportStructureTreeItem extends BaseStructureTreeItem {
  constructor(private tsImport: Import, private context: ExtensionContext) {
    super(tsImport.libraryName);
    this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/import.svg');
    this.command = this.createJumpToCommand([tsImport]);

    if (!(tsImport instanceof StringImport)) {
      this.collapsibleState = TreeItemCollapsibleState.Collapsed;
    }
  }

  public getChildren(): BaseStructureTreeItem[] {
    const imp = this.tsImport;
    if (imp instanceof ExternalModuleImport) {
      return [new ImportSpecifierStructureTreeItem(imp.alias, imp, this.context)];
    }
    if (imp instanceof NamedImport) {
      const specifiers = imp.specifiers.map(
        s => new ImportSpecifierStructureTreeItem(
          `${s.specifier}${s.alias ? ` as ${s.alias}` : ''}`,
          imp,
          this.context,
        ),
      );
      if (imp.defaultAlias) {
        specifiers.unshift(new ImportSpecifierStructureTreeItem(`(default) ${imp.defaultAlias}`, imp, this.context));
      }

      return specifiers;
    }
    if (imp instanceof NamespaceImport) {
      return [new ImportSpecifierStructureTreeItem(imp.alias, imp, this.context)];
    }
    return [];
  }
}

/**
 * Structure item that contains all imports from the file.
 * Collapsed by default.
 *
 * @export
 * @class ImportsStructureTreeItem
 * @extends {BaseStructureTreeItem}
 */
export class ImportsStructureTreeItem extends BaseStructureTreeItem {
  constructor(private resource: Resource, private context: ExtensionContext) {
    super('Imports');
    this.collapsibleState = TreeItemCollapsibleState.Collapsed;
    this.iconPath = context.asAbsolutePath('./src/assets/icons/declarations/module.svg');
  }

  public getChildren(): BaseStructureTreeItem[] {
    return this.resource.imports.map(i => new ImportStructureTreeItem(i, this.context));
  }
}

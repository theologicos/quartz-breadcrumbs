import { classNames } from '@quartz-community/utils/lang';
import { simplifySlug, resolveRelative } from '@quartz-community/utils/path';
import { joinSegments } from '@quartz-community/utils';
import { jsx, jsxs } from 'preact/jsx-runtime';

// src/util/lang.ts
var FileTrieNode = class _FileTrieNode {
  isFolder;
  children;
  slugSegments;
  fileSegmentHint;
  displayNameOverride;
  data;
  constructor(segments, data) {
    this.children = [];
    this.slugSegments = segments;
    this.data = data ?? null;
    this.isFolder = false;
    this.displayNameOverride = void 0;
  }
  get displayName() {
    const nonIndexTitle = this.data?.title === "index" ? void 0 : this.data?.title;
    return this.displayNameOverride ?? nonIndexTitle ?? this.fileSegmentHint ?? this.slugSegment ?? "";
  }
  set displayName(name) {
    this.displayNameOverride = name;
  }
  get slug() {
    const path = joinSegments(...this.slugSegments);
    if (this.isFolder) {
      return joinSegments(path, "index");
    }
    return path;
  }
  get slugSegment() {
    return this.slugSegments[this.slugSegments.length - 1] ?? "";
  }
  makeChild(path, file) {
    const nextSegment = path[0];
    if (!nextSegment) {
      throw new Error("path is empty");
    }
    const fullPath = [...this.slugSegments, nextSegment];
    const child = new _FileTrieNode(fullPath, file);
    this.children.push(child);
    return child;
  }
  insert(path, file) {
    if (path.length === 0) {
      throw new Error("path is empty");
    }
    this.isFolder = true;
    const segment = path[0];
    if (!segment) {
      throw new Error("path is empty");
    }
    if (path.length === 1) {
      if (segment === "index") {
        this.data ??= file;
      } else {
        this.makeChild(path, file);
      }
    } else if (path.length > 1) {
      const child = this.children.find((c) => c.slugSegment === segment) ?? this.makeChild(path, void 0);
      const fileParts = file.filePath.split("/");
      const hint = fileParts.at(-path.length);
      if (hint) {
        child.fileSegmentHint = hint;
      }
      child.insert(path.slice(1), file);
    }
  }
  add(file) {
    this.insert(file.slug.split("/"), file);
  }
  findNode(path) {
    if (path.length === 0 || path.length === 1 && path[0] === "index") {
      return this;
    }
    return this.children.find((c) => c.slugSegment === path[0])?.findNode(path.slice(1));
  }
  ancestryChain(path) {
    if (path.length === 0 || path.length === 1 && path[0] === "index") {
      return [this];
    }
    const child = this.children.find((c) => c.slugSegment === path[0]);
    if (!child) {
      return void 0;
    }
    const childPath = child.ancestryChain(path.slice(1));
    if (!childPath) {
      return void 0;
    }
    return [this, ...childPath];
  }
  filter(filterFn) {
    this.children = this.children.filter(filterFn);
    this.children.forEach((child) => child.filter(filterFn));
  }
  map(mapFn) {
    mapFn(this);
    this.children.forEach((child) => child.map(mapFn));
  }
  sort(sortFn) {
    this.children = this.children.sort(sortFn);
    this.children.forEach((e) => e.sort(sortFn));
  }
};
function trieFromAllFiles(allFiles) {
  const trie = new FileTrieNode([]);
  allFiles.forEach((file) => {
    if (file.frontmatter) {
      trie.add({
        slug: file.slug,
        title: file.frontmatter.title ?? "",
        filePath: file.filePath
      });
    }
  });
  return trie;
}

// src/components/styles/breadcrumbs.scss
var breadcrumbs_default = ".breadcrumb-container {\n  margin: 0;\n  margin-top: 0.75rem;\n  padding: 0;\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  gap: 0.5rem;\n}\n\n.breadcrumb-element p {\n  margin: 0;\n  margin-left: 0.5rem;\n  padding: 0;\n  line-height: normal;\n}\n.breadcrumb-element {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  justify-content: center;\n}";
var defaultOptions = {
  spacerSymbol: "\u276F",
  rootName: "Home",
  resolveFrontmatterTitle: true,
  showCurrentPage: true
};
function formatCrumb(displayName, baseSlug, currentSlug) {
  return {
    displayName,
    path: resolveRelative(baseSlug, currentSlug)
  };
}
var Breadcrumbs_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const Breadcrumbs = ({
    fileData,
    allFiles,
    displayClass,
    ctx
  }) => {
    const typedCtx = ctx ?? {};
    typedCtx.trie ??= trieFromAllFiles(
      allFiles
    );
    const trie = typedCtx.trie;
    const slug = fileData.slug;
    const slugParts = slug.split("/");
    const pathNodes = trie.ancestryChain(slugParts);
    if (!pathNodes) {
      return null;
    }
    const crumbs = pathNodes.map((node, idx) => {
      const crumb = formatCrumb(node.displayName, slug, simplifySlug(node.slug));
      if (idx === 0) {
        crumb.displayName = options.rootName;
      }
      if (idx === pathNodes.length - 1) {
        crumb.path = "";
      }
      return crumb;
    });
    if (!options.showCurrentPage) {
      crumbs.pop();
    }
    return /* @__PURE__ */ jsx("nav", { class: classNames(displayClass, "breadcrumb-container"), "aria-label": "breadcrumbs", children: crumbs.map((crumb, index) => /* @__PURE__ */ jsxs("div", { class: "breadcrumb-element", children: [
      /* @__PURE__ */ jsx("a", { href: crumb.path, children: crumb.displayName }),
      index !== crumbs.length - 1 && /* @__PURE__ */ jsx("p", { children: ` ${options.spacerSymbol} ` })
    ] })) });
  };
  Breadcrumbs.css = breadcrumbs_default;
  return Breadcrumbs;
});

export { Breadcrumbs_default as Breadcrumbs };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
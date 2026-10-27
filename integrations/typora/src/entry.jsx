import {createElement} from "react";
import {createRoot} from "react-dom/client";
import {DocumentRenderer} from "@xingyu/components/react";
import {createParserConfig} from "./adapter.mjs";

const css = __XINGYU_CSS__;
const renderer = {
  mount(node,source) {
    const root = createRoot(node);
    root.render(createElement(DocumentRenderer,{source}));
    return root;
  },
  update(root,source) {root.render(createElement(DocumentRenderer,{source}));},
  unmount(root) {root.unmount();}
};

class XingyuPlugin extends BasePlugin {
  prepare = () => {
    if (!this.utils?.thirdPartyDiagramParser?.register) return this.utils.PLUGIN_LOAD_ABORT;
  };
  style = () => css;
  process = () => this.utils.thirdPartyDiagramParser.register(createParserConfig(renderer));
}
export { XingyuPlugin as plugin };

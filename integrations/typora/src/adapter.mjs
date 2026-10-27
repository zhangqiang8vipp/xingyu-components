export const LANGUAGE = "xingyu";
export function createParserConfig(renderer) {
  if (!renderer || !["mount","update","unmount"].every(k=>typeof renderer[k] === "function")) {
    throw new TypeError("renderer must provide mount/update/unmount");
  }
  const nodeOf = wrap => {
    if (!wrap || !wrap[0]) throw new Error("Missing Typora preview container");
    return wrap[0];
  };
  return {
    lang: LANGUAGE,
    mappingLang: "json",
    interactiveMode: true,
    destroyWhenUpdate: false,
    checkSelector: ".plugin-xingyu-content",
    wrapElement: '<div class="plugin-xingyu-content"></div>',
    renderStyleGetter: () => ({width:"calc(100% - 4px)",height:"auto",backgroundColor:"transparent"}),
    createFunc: (wrap,source) => {
      const node = nodeOf(wrap);
      return {node,instance:renderer.mount(node,String(source))};
    },
    updateFunc: (wrap,source,state) => {
      const node = nodeOf(wrap);
      if (node !== state.node) {
        renderer.unmount(state.instance);
        return {node,instance:renderer.mount(node,String(source))};
      }
      renderer.update(state.instance,String(source));
      return state;
    },
    destroyFunc: state => { if(state) renderer.unmount(state.instance); }
  };
}

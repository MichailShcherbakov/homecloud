/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  import React = require("react");
  const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

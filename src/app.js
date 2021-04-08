//组件测试入口、用于本地运行、测试组件

import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import "echarts-gl";
import echarts from "echarts";
import "antd/dist/antd.less";
import { Index } from "./index";

import Chart from "./lib/chart";

let props = {
  echarts: echarts,
  Chart: Chart,
  events: {
    onAction: function () {},
    onLocation: function (url) {
      window.location.href = url;
    },
  },
  option: {
    uuid: "12138",
    version: "1.0.0",
    fetch: { sourceData: { value: 80 } },
    rect: { x: 0, y: 0, width: "100%", height: "100%" },
    config: { style: { background: "#fff" } },
    mode: "view",
  },
};

function ReactComponet() {
  return <Index {...props}></Index>;
}

function ChartComponent() {
  return <Index {...props}></Index>;
}

function App() {
  if (COMPONENT_ENV == "chart") {
    return <ChartComponent></ChartComponent>;
  }
  return <ReactComponet></ReactComponet>;
}

render(<App />, document.getElementById("root"));

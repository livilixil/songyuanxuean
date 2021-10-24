import * as Data from "./dataLoader.js";
import * as NetworkSimplex from "./algorithm/networkSimplex.js";

const params = {
  manyBodyStrength: -180,
  manyBodydistance: 50,
  forceXStrength: 5,
  forceYStrength: 0.2,
  compatibilityThreshold: 0.2,
  fx: false,
};

function topSort(nodeNum, edge_data) {
  let count = [];
  let queue = [];
  let order = [];
  let depth = [];
  let to = {};
  for (let i = 0; i < nodeNum; ++i) {
    count[i] = 0;
    depth[i] = 0;
    to[i] = [];
  }
  for (let i of edge_data) {
    count[i.target] += 1;
    if (!(i.target in to[i.source])) {
      to[i.source].push(i.target);
    }
  }
  for (let i = 0; i < count.length; ++i) {
    if (count[i] == 0) {
      queue.push(i);
    }
  }
  while (queue.length > 0) {
    let cur = queue.shift();
    order.push(cur);
    for (let i of edge_data) {
      if (i.source == cur) {
        depth[i.target] = Math.max(depth[i.target], depth[cur] + 1);
        count[i.target] -= 1;
        if (count[i.target] === 0) {
          queue.push(i.target);
        }
      }
    }
  }
  return [order, depth];
}

function randomLayout(node_data, edge_data, worldBox) {
  let len = Object.keys(node_data).length;
  for (let i = 0; i < len; ++i) {
    node_data[i] = {
      x: Math.random() * worldBox.width,
      y: Math.random() * worldBox.height,
    };
  }
}

function circleLayout(node_data, edge_data, worldBox) {
  let len = Object.keys(node_data).length;
  for (let i = 0; i < len; ++i) {
    node_data[i] = {
      x:
        worldBox.width / 2 +
        Math.cos(((2 * Math.PI) / schools.length) * i) * 400,
      y:
        worldBox.height / 2 +
        Math.sin(((2 * Math.PI) / schools.length) * i) * 400,
    };
  }
}

function simpleTopLayout(node_data, edge_data, worldBox) {
  const colMax = 15;
  let colNum = 0;
  let [order, depth] = topSort(Object.keys(node_data).length, edge_data);
  let depthCount = {};
  let depthSet = {};
  for (let [k, i] of Object.entries(depth)) {
    if (!(i in depthCount)) {
      depthCount[i] = 0;
      depthSet[i] = [];
    }
    depthCount[i] += 1;
    depthSet[i].push(k);
  }
  for (let i in depthCount) {
    colNum += Math.ceil(depthCount[i] / colMax);
  }
  let baseCol = 0;
  let colInterval = worldBox.width / (colNum + 1);
  let rowInterval = worldBox.height / (colMax + 1);
  for (let i of Object.values(depthSet)) {
    for (let j = 0; j < i.length; ++j) {
      node_data[i[j]].x = (baseCol + 1 + Math.floor(j / colMax)) * colInterval;
      node_data[i[j]].y = ((j % colMax) + 1) * rowInterval;
    }
    baseCol += Math.ceil(i.length / colMax);
  }
  for (let i of edge_data) {
    if (depth[i.source] + 1 === depth[i.target]) {
    } else {
      // console.log(depth[i.target] - depth[i.source]);
    }
  }
}

function layerTopLayout(node_data, edge_data, worldBox) {
  const colMax = 8;
  let colNum = 0;
  let depthCount = {};
  let depthSet = {};
  let depth = Object.assign(
    [],
    NetworkSimplex.networkSimplex(Object.keys(node_data).length, edge_data)
  );
  for (let [k, i] of Object.entries(depth)) {
    if (!(i in depthCount)) {
      depthCount[i] = 0;
      depthSet[i] = [];
    }
    depthCount[i] += 1;
    depthSet[i].push(k);
  }
  for (let i in depthCount) {
    colNum += Math.ceil(depthCount[i] / colMax);
  }
  let baseCol = 0;
  let colInterval = worldBox.width / (colNum + 1);
  let rowInterval = worldBox.height / (colMax + 1);
  for (let i of Object.values(depthSet)) {
    for (let j = 0; j < i.length; ++j) {
      node_data[i[j]].x = (baseCol + 1 + Math.floor(j / colMax)) * colInterval;
      node_data[i[j]].y = ((j % colMax) + 1) * rowInterval;
    }
    baseCol += Math.ceil(i.length / colMax);
  }
  for (let i of edge_data) {
    if (depth[i.source] + 1 === depth[i.target]) {
    } else {
      i.det = depth[i.target] - depth[i.source];
      // console.log(depth[i.target] - depth[i.source]);
    }
  }

  for (let i of node_data) {
    i.xBase = i.x;
    // i.fx = i.x;
  }

  let edge_data_copy = [];
  edge_data.forEach((d) => edge_data_copy.push({ ...d }));
  let simulation = d3.forceSimulation().stop();
  simulation.nodes(node_data);
  simulation
    .force("link", d3.forceLink().links(edge_data_copy))
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength(params.manyBodyStrength)
        .distanceMax(params.manyBodydistance)
    )
    // .force("center", d3.forceCenter(worldBox.width / 2, 0).strength(1))
    .force(
      "x",
      d3
        .forceX()
        .x((node, ind) => {
          return node.xBase;
        })
        .strength(params.forceXStrength)
    )
    .force("y", d3.forceY().y(0).strength(params.forceYStrength));
  simulation.tick(10000);
  // for (let i of node_data) {
  //   i.fx = i.xBase;
  // }
  // simulation.nodes(node_data).tick(5000);
  let yScale = d3
    .scaleLinear()
    .range([worldBox.height * 0.3, (worldBox.height / 6) * 5])
    .domain(d3.extent(node_data, (d) => d.y));
  for (let i of node_data) {
    i.y = yScale(i.y);
  }
}

export function calcLayout(worldBox, viewport, draw = false) {
  let schools = Data.getSchools();
  let relData = Data.getRelData();
  let node_data = [];
  let edge_data = [];

  for (let i = 0; i < schools.length; ++i) {
    node_data.push({ id: i, x: 0, y: 0 });
  }
  for (let i of relData) {
    edge_data.push({
      source: schools.indexOf(i["前見名稱"]),
      target: schools.indexOf(i["案主名稱"]),
    });
  }
  //   randomLayout(node_data, edge_data, worldBox);
  // circleLayout(node_data, edge_data, worldBox);
  // simpleTopLayout(node_data, edge_data, worldBox);
  layerTopLayout(node_data, edge_data, worldBox);
  let nodeGraphics = new PIXI.Graphics();
  if (draw) viewport.addChild(nodeGraphics);
  for (let i = 0; i < schools.length; ++i) {
    nodeGraphics.beginFill(0x555555);
    nodeGraphics.drawCircle(node_data[i].x, node_data[i].y, 10);
    nodeGraphics.endFill();
  }

  let fbundling = d3
    .ForceEdgeBundling()
    .step_size(0.1)
    .compatibility_threshold(params.compatibilityThreshold)
    .nodes(node_data.map((d) => ({ x: d.x, y: d.y })))
    .edges(edge_data);
  let results = fbundling();
  // debugger;
  //   results = results.slice(0, 5);
  results.forEach((d, i) => {
    // for each of the arrays in the results
    // draw a line between the subdivions points for that edge
    let path = new PIXI.Graphics();
    path.lineStyle(5, 0x555555, 0.4);
    // let testTexture = PIXI.Texture.from("assets/test.png");
    // path.lineTextureStyle({ width: 25, texture: testTexture });
    path.moveTo(d[0].x, d[0].y);
    for (let i = 1; i < d.length; ++i) {
      path.lineTo(d[i].x, d[i].y);
    }
    if (draw) viewport.addChild(path);
  });
  return [node_data, edge_data, results];
}

export function run() {
  randomTest();
}

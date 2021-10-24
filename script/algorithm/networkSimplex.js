let edge = [];
let edgeMat = [];
let rank = [];
let n = 0;

function calcTopoRank() {
  let queue = [];
  let indegree = [];
  for (let i = 0; i < n; ++i) {
    indegree[i] = 0;
  }
  edge.forEach((es, fr) => {
    es.forEach((e) => {
      indegree[e.to] += 1;
    });
  });
  indegree.forEach((d, i) => {
    if (d === 0) {
      queue.push(i);
    }
  });
  while (queue.length) {
    let cur = queue.shift();
    edge[cur].forEach((e) => {
      if (--indegree[e.to] === 0) {
        queue.push(e.to);
        rank[e.to] = rank[cur] + 1;
      }
    });
  }
}

function getInitialFeasible() {
  calcTopoRank();
  let ontree = new Set();
  ontree.add(0);
  while (ontree.size < n) {
    let minVal = Infinity;
    let minEdge = null;
    for (let i = 0; i < n; ++i) {
      for (let j = 0; j < n; ++j) {
        if (edgeMat[i][j] === 0) continue;
        if (ontree.has(i) + ontree.has(j) === 1) {
          let d = rank[j] - rank[i] - 1;
          if (d < minVal) {
            minVal = d;
            minEdge = [i, j];
          }
        }
      }
    }
    let det = ontree.has(minEdge[0]) ? minVal : -minVal;
    ontree.forEach((i) => {
      rank[i] += det;
    });
    ontree.add(minEdge[0]);
    ontree.add(minEdge[1]);
  }
}

function augmentSearch() {
  let dfsFlag = new Set();
  function Dfs(p) {
    for (let i = 0; i < n; ++i) {
      if (
        (edgeMat[p][i] !== 0 && edgeMat[p][i] === rank[i] - rank[p]) ||
        (edgeMat[i][p] !== 0 && edgeMat[i][p] == rank[p] - rank[i])
      ) {
        if (!dfsFlag.has(i)) {
          dfsFlag.add(i);
          Dfs(i);
        }
      }
    }
  }
  let changeFlag = false;
  while (changeFlag) {
    changeFlag = false;
    for (let bi = 0; bi < n; ++bi) {
      for (let bj = 0; bj < n; ++bj) {
        if (edgeMat[bi][bj] === 0) continue;
        let oldVal = edgeMat[bi][bj];
        edgeMat[bi][bj] = 0;
        dfsFlag.clear();
        Dfs(bi);
        edgeMat[bi][bj] = oldVal;
        if (dfsFlag.size === 0) continue;
        let det = Infinity;
        let partial = 0;
        for (let ei = 0; ei < n; ++ei) {
          for (let ej = 0; ej < n; ++ej) {
            if (edgeMat[ei][ej] === 0) continue;
            if (dfsFlag.has(ei) === dfsFlag.has(ej)) continue;
            if (dfsFlag.has(ei)) {
              partial -= edgeMat[ei][ej];
            } else {
              det = Math.min(det, rank[ej] - rank[ei] - 1);
              partial += edgeMat[ei][ej];
            }
          }
        }
        if (det > 0 && partial > 0) {
          dfsFlag.forEach((i) => {
            rank[i] -= det;
          });
          changeFlag = true;
        }
      }
    }
  }
  let minRank = Math.min(...rank);
  for (let i = 0; i < n; ++i) {
    rank[i] += -minRank;
  }
}

export function networkSimplex(nodeNum, edgeInfo) {
  let dfsFlag = new Set();
  let calcFlag = new Set();
  let finalRank = [];
  function Dfs(p) {
    for (let i of edgeInfo) {
      if (i.source === p || i.target === p) {
        let to = i.source === p ? i.target : i.source;
        if (!dfsFlag.has(to)) {
          dfsFlag.add(to);
          Dfs(to);
        }
      }
    }
  }
  for (let i = 0; i < nodeNum; ++i) {
    finalRank[i] = 0;
  }
  for (let i = 0; i < nodeNum; ++i) {
    if (!calcFlag.has(i)) {
      dfsFlag.clear();
      Dfs(i);
      let nodes = Array.from(dfsFlag);
      n = dfsFlag.size;
      {
        for (let i = 0; i < n; ++i) {
          edge[i] = [];
          rank[i] = 0;
          edgeMat[i] = [];
          for (let j = 0; j < n; ++j) {
            edgeMat[i][j] = 0;
          }
        }
        edgeInfo.forEach((e) => {
          if (dfsFlag.has(e.source) && dfsFlag.has(e.target)) {
            edgeMat[nodes.indexOf(e.source)][nodes.indexOf(e.target)] += 1;
          }
        });
        for (let i = 0; i < n; ++i) {
          for (let j = 0; j < n; ++j) {
            if (edgeMat[i][j] !== 0) {
              edge[i].push({ to: j, weight: edgeMat[i][j] });
            }
          }
        }
        getInitialFeasible();
        augmentSearch();
        for (let i = 0; i < n; ++i) {
          finalRank[nodes[i]] = rank[i];
        }
      }
      dfsFlag.forEach((d) => {
        calcFlag.add(d);
      });
    }
  }

  return finalRank;
}

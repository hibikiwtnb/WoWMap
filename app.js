const VIEWBOX = { width: 1000, height: 700, padding: 36 };
const ACTIVE_NODE_SCALE = 1.12;
const ACTIVE_NODE_STROKE_SCALE = 1.08;
const CLICK_NEAREST_NODE_PX = 14;
const CONTINENT_BASE_SCALE = 1.0;
const POINTER_CLICK_DRIFT = 8;
const ACCESS_EDGE_COUNT = 5;
const WALK_SPEED = 7;
const MOUNT_SPEED = 14;
const TAXI_SPEED = 32;
const SHIP_SPEED = 20;
const ZEPPELIN_SPEED = 24;
const SUBWAY_SPEED = 32;
const BOARDING_PENALTY = {
  taxi: 8,
  ship: 45,
  zeppelin: 45,
  subway: 20,
};
const ALLIANCE = "alliance";
const HORDE = "horde";
const NEUTRAL = "neutral";
const CITY_FACTIONS = {
  Stormwind: ALLIANCE,
  Ironforge: ALLIANCE,
  Darnassus: ALLIANCE,
  "The Exodar": ALLIANCE,
  "暴風城": ALLIANCE,
  "鐵爐堡": ALLIANCE,
  達納蘇斯: ALLIANCE,
  艾克索達: ALLIANCE,
  Orgrimmar: HORDE,
  Undercity: HORDE,
  "Thunder Bluff": HORDE,
  "Silvermoon City": HORDE,
  "奧格瑪": HORDE,
  幽暗城: HORDE,
  雷霆崖: HORDE,
  銀月城: HORDE,
  Dalaran: NEUTRAL,
  "Shattrath City": NEUTRAL,
  達拉然: NEUTRAL,
  撒塔斯城: NEUTRAL,
};
const NODE_FACTIONS = {
  暴風城: ALLIANCE,
  鐵爐堡: ALLIANCE,
  達納蘇斯: ALLIANCE,
  艾克索達: ALLIANCE,
  夜色鎮: ALLIANCE,
  米奈希爾港: ALLIANCE,
  南海鎮: ALLIANCE,
  湖畔鎮: ALLIANCE,
  守望堡: ALLIANCE,
  塞爾薩瑪: ALLIANCE,
  反抗軍營地: ALLIANCE,
  哨兵嶺: ALLIANCE,
  避難谷地: ALLIANCE,
  鷹巢山: ALLIANCE,
  摩根的崗哨: ALLIANCE,
  烈焰峰: ALLIANCE,
  北郡修道院: ALLIANCE,
  東牆之塔: ALLIANCE,
  北地哨塔: ALLIANCE,
  皇冠哨塔: ALLIANCE,
  奧伯丁: ALLIANCE,
  阿斯特蘭納: ALLIANCE,
  羽月要塞: ALLIANCE,
  魯瑟蘭村: ALLIANCE,
  尼耶爾前哨站: ALLIANCE,
  石爪峰: ALLIANCE,
  奧格瑪: HORDE,
  幽暗城: HORDE,
  雷霆崖: HORDE,
  惡齒村: HORDE,
  塔倫米爾: HORDE,
  瑟伯切爾: HORDE,
  落錘鎮: HORDE,
  斯通納德: HORDE,
  卡加斯: HORDE,
  蕨牆村: HORDE,
  塞拉摩: ALLIANCE,
  泥鏈營地: HORDE,
  十字路口: HORDE,
  棘齒城: NEUTRAL,
  陶拉祖營地: HORDE,
  烈日石居: HORDE,
  瓦羅莫克: HORDE,
  莫沙徹營地: HORDE,
  葬影村: HORDE,
  亂風崗: HORDE,
  馬紹爾營地: NEUTRAL,
  加基森: NEUTRAL,
  藏寶海灣: NEUTRAL,
  永望鎮: NEUTRAL,
  聖光之願禮拜堂: NEUTRAL,
  月光林地: NEUTRAL,
  納克薩瑪斯: NEUTRAL,
  翠翠聖地: NEUTRAL,
  血毒河: NEUTRAL,
  刺枝林地: NEUTRAL,
  左拉姆加前哨站: HORDE,
  碎木崗哨: HORDE,
  永夜港: NEUTRAL,
  薄霧之地: NEUTRAL,
  釣魚村: NEUTRAL,
  塞納里奧城堡: NEUTRAL,
  塔倫迪斯營地: NEUTRAL,
  瑟銀哨塔: NEUTRAL,
  冰風營地: NEUTRAL,
};
const ZONE_LEVEL_RANGES = {
  艾爾文森林: "1-10",
  丹莫洛: "1-10",
  提里斯法林地: "1-10",
  杜洛塔: "1-10",
  莫高雷: "1-10",
  泰達希爾: "1-10",
  黑海岸: "10-20",
  西部荒野: "10-20",
  洛克莫丹: "10-20",
  銀松森林: "10-20",
  貧瘠之地: "10-25",
  赤脊山: "15-25",
  暮色森林: "18-30",
  濕地: "20-30",
  石爪山脈: "15-27",
  灰谷: "18-30",
  千針石林: "25-35",
  希爾斯布萊德丘陵: "20-30",
  阿拉希高地: "30-40",
  荊棘谷: "30-45",
  淒涼之地: "30-40",
  塵泥沼澤: "35-45",
  荒蕪之地: "35-45",
  悲傷沼澤: "35-45",
  辛特蘭: "40-50",
  塔納利斯: "40-50",
  菲拉斯: "40-50",
  灼熱峽谷: "43-50",
  艾薩拉: "45-55",
  安戈洛環形山: "48-55",
  費伍德森林: "48-55",
  西瘟疫之地: "50-58",
  東瘟疫之地: "53-60",
  燃燒平原: "50-58",
  冬泉谷: "55-60",
  希利蘇斯: "55-60",
  詛咒之地: "54-60",
};

const state = {
  worldmap: null,
  taxiNodes: null,
  taxiNetwork: null,
  shipRoutes: null,
  subwayRoutes: null,
  zeppelinRoutes: null,
  terrain: null,
  currentScene: null,
  activeMapId: "world",
  activeSelection: null,
  locale: "zh",
  route: {
    pickMode: null,
    start: null,
    end: null,
    factionChoice: ALLIANCE,
    result: null,
    pointerMoved: false,
  },
  camera: {
    x: 0,
    y: 0,
    width: VIEWBOX.width,
    height: VIEWBOX.height,
    minScale: 0.72,
    maxScale: 10,
    dragging: false,
    dragOrigin: null,
  },
  toggles: {
    terrain: true,
    zones: false,
    zoneLabels: true,
    paths: true,
    ships: true,
    subway: true,
    zeppelin: true,
    nodes: true,
    nodeLabels: true,
  },
};

const elements = {
  localeSwitch: document.getElementById("locale-switch"),
  terrainLayer: document.getElementById("terrain-layer"),
  zoneLayer: document.getElementById("zone-layer"),
  pathLayer: document.getElementById("path-layer"),
  routeLayer: document.getElementById("route-layer"),
  nodeLayer: document.getElementById("node-layer"),
  routeMarkerLayer: document.getElementById("route-marker-layer"),
  nodeLabelLayer: document.getElementById("node-label-layer"),
  pathLabelLayer: document.getElementById("path-label-layer"),
  labelLayer: document.getElementById("label-layer"),
  routePanel: document.getElementById("route-panel"),
  routeFactionSwitch: document.getElementById("route-faction-switch"),
  routeStartLabel: document.getElementById("route-start-label"),
  routeEndLabel: document.getElementById("route-end-label"),
  routeHint: document.getElementById("route-hint"),
  routeSummary: document.getElementById("route-summary"),
  infoPanel: document.getElementById("info-panel"),
  infoClose: document.getElementById("info-close"),
  brandPanel: document.getElementById("brand-panel"),
  layersPanel: document.getElementById("layers-panel"),
  pickStart: document.getElementById("pick-start"),
  pickEnd: document.getElementById("pick-end"),
  routeSolve: document.getElementById("route-solve"),
  routeSwap: document.getElementById("route-swap"),
  routeClear: document.getElementById("route-clear"),
  toggleZones: document.getElementById("toggle-zones"),
  toggleZoneLabels: document.getElementById("toggle-zone-labels"),
  togglePaths: document.getElementById("toggle-paths"),
  toggleNodes: document.getElementById("toggle-nodes"),
  toggleNodeLabels: document.getElementById("toggle-node-labels"),
  mapSvg: document.getElementById("map-svg"),
  cursorCoords: document.getElementById("cursor-coords"),
  zoomIn: document.getElementById("zoom-in"),
  zoomOut: document.getElementById("zoom-out"),
  zoomReset: document.getElementById("zoom-reset"),
};

init().catch((error) => {
  console.error(error);
});

async function init() {
  const [worldmap, taxiNodes, taxiNetwork, shipRoutes, subwayRoutes, zeppelinRoutes, azerothTerrain, kalimdorTerrain] = await Promise.all([
    fetchJson("./data/derived/worldmap_2d.json"),
    fetchJson("./data/derived/taxi_nodes_2d.json"),
    fetchJson("./data/derived/taxi_network_2d.json"),
    fetchJson("./data/derived/ship_routes_2d.json"),
    fetchJson("./data/derived/subway_routes_2d.json"),
    fetchJson("./data/derived/zeppelin_routes_2d.json"),
    fetchJson("./data/derived/terrain/azeroth_wdl_summary.json"),
    fetchJson("./data/derived/terrain/kalimdor_wdl_summary.json"),
  ]);

  state.worldmap = worldmap;
  state.taxiNodes = taxiNodes;
  state.taxiNetwork = taxiNetwork;
  state.shipRoutes = shipRoutes;
  state.subwayRoutes = subwayRoutes;
  state.zeppelinRoutes = zeppelinRoutes;
  state.terrain = {
    "0": azerothTerrain,
    "1": kalimdorTerrain,
  };

  bindControls();
  updateLocaleSwitch();
  resetCamera();
  render();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
}

function bindControls() {
  elements.localeSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-locale]");
    if (!button) {
      return;
    }
    state.locale = button.dataset.locale;
    updateLocaleSwitch();
    render();
  });
  elements.toggleZones.addEventListener("change", (event) => {
    state.toggles.zones = event.target.checked;
    render();
  });
  elements.toggleZoneLabels.addEventListener("change", (event) => {
    state.toggles.zoneLabels = event.target.checked;
    render();
  });
  elements.togglePaths.addEventListener("change", (event) => {
    state.toggles.paths = event.target.checked;
    render();
  });
  elements.toggleNodes.addEventListener("change", (event) => {
    state.toggles.nodes = event.target.checked;
    render();
  });
  elements.toggleNodeLabels.addEventListener("change", (event) => {
    state.toggles.nodeLabels = event.target.checked;
    render();
  });

  elements.pickStart.addEventListener("click", () => {
    state.route.pickMode = state.route.pickMode === "start" ? null : "start";
    updateRouteUi();
  });
  elements.pickEnd.addEventListener("click", () => {
    state.route.pickMode = state.route.pickMode === "end" ? null : "end";
    updateRouteUi();
  });
  elements.routeFactionSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-route-faction]");
    if (!button) {
      return;
    }
    state.route.factionChoice = button.dataset.routeFaction === HORDE ? HORDE : ALLIANCE;
    if (state.route.start && state.route.end) {
      solveRoute();
    } else {
      updateRouteUi();
    }
  });
  elements.routeSolve.addEventListener("click", () => {
    solveRoute();
  });
  elements.routeSwap.addEventListener("click", () => {
    const start = state.route.start;
    state.route.start = state.route.end;
    state.route.end = start;
    state.route.result = null;
    if (state.route.start && state.route.end) {
      solveRoute();
    } else {
      updateRouteUi();
      render();
    }
  });
  elements.routeClear.addEventListener("click", () => {
    clearRoute();
  });
  elements.infoClose.addEventListener("click", () => {
    state.activeSelection = null;
    render();
  });

  elements.zoomIn.addEventListener("click", () => zoomAtCenter(1 / 1.25));
  elements.zoomOut.addEventListener("click", () => zoomAtCenter(1.25));
  elements.zoomReset.addEventListener("click", () => {
    resetCamera();
    applyViewBox();
  });

  elements.mapSvg.addEventListener("wheel", handleWheelZoom, { passive: false });
  elements.mapSvg.addEventListener("pointerdown", handlePointerDown);
  elements.mapSvg.addEventListener("pointermove", handlePointerMove);
  elements.mapSvg.addEventListener("pointerup", handlePointerUp);
  elements.mapSvg.addEventListener("pointerleave", handlePointerUp);
  elements.mapSvg.addEventListener("pointermove", handleCursorCoordinates);
  elements.mapSvg.addEventListener("mouseleave", clearCursorCoordinates);

  updateRouteUi();
}

function updateLocaleSwitch() {
  elements.localeSwitch.querySelectorAll("[data-locale]").forEach((button) => {
    button.classList.toggle("active", button.dataset.locale === state.locale);
  });
}

function render() {
  const scene = buildScene(state.activeMapId);
  state.currentScene = scene;
  const zones = flattenZones(scene);
  const nodes = flattenNodes(scene);
  const paths = flattenPaths(scene);

  updateStats(scene, zones, nodes, paths);

  elements.zoneLayer.innerHTML = "";
  elements.terrainLayer.innerHTML = "";
  elements.pathLayer.innerHTML = "";
  elements.routeLayer.innerHTML = "";
  elements.nodeLayer.innerHTML = "";
  elements.routeMarkerLayer.innerHTML = "";
  elements.nodeLabelLayer.innerHTML = "";
  elements.pathLabelLayer.innerHTML = "";
  elements.labelLayer.innerHTML = "";

  if (state.toggles.terrain) {
    renderTerrain(scene);
  }
  if (state.toggles.zones) {
    renderZones(scene, zones);
  }
  if (state.toggles.paths) {
    renderPaths(scene, paths.filter((path) => path.mode === "taxi"));
  }
  if (state.toggles.ships) {
    const shipPaths = paths.filter((path) => path.mode === "ship");
    renderPaths(scene, shipPaths);
    renderShipLabels(scene, shipPaths);
  }
  if (state.toggles.subway) {
    const subwayPaths = paths.filter((path) => path.mode === "subway");
    renderPaths(scene, subwayPaths);
    renderShipLabels(scene, subwayPaths);
  }
  if (state.toggles.zeppelin) {
    const zeppelinPaths = paths.filter((path) => path.mode === "zeppelin");
    renderPaths(scene, zeppelinPaths);
    renderShipLabels(scene, zeppelinPaths);
  }
  renderRoute(scene);
  if (state.toggles.nodes) {
    renderNodes(scene, nodes);
  }
  if (state.toggles.nodeLabels) {
    renderNodeLabels(scene, nodes);
  }
  if (state.toggles.zoneLabels) {
    renderZoneLabels(scene, zones);
  }

  renderInfoPanel(scene, zones, nodes, paths);
  applyViewBox();
  updateRouteUi();
}

function buildScene(activeMapId) {
  return buildWorldScene();
}

function buildSingleMapScene(mapId) {
  const map = state.worldmap.maps[mapId];
  const dimensions = getRotatedDimensions(map.world_bounds);
  return {
    title:
      state.locale === "zh"
        ? `${displayMapName(map)}導航平面`
        : `${displayMapName(map)} Navigation Plane`,
    sceneBounds: {
      width: dimensions.width,
      height: dimensions.height,
    },
    entries: [
      {
        mapId,
        map,
        terrain: state.terrain?.[mapId] ?? null,
        placement: {
          x: 0,
          y: 0,
          width: dimensions.width,
          height: dimensions.height,
        },
      },
    ],
  };
}

function buildWorldScene() {
  const kalimdor = state.worldmap.maps["1"];
  const azeroth = state.worldmap.maps["0"];
  const kalimdorDimensions = getRotatedDimensions(kalimdor.world_bounds);
  const azerothDimensions = getRotatedDimensions(azeroth.world_bounds);
  const gap = -azerothDimensions.width * 0.45;
  const topPadding = 520;
  const bottomPadding = 520;
  const leftPadding = 320;
  const rightPadding = 320;
  const kalimdorY = 1800;
  const azerothYOffset = -3000;
  const azerothY = kalimdorY + azerothYOffset;
  const kalimdorX = leftPadding;
  const azerothX = kalimdorX + kalimdorDimensions.width + gap;
  const contentTop = Math.min(kalimdorY, azerothY);
  const contentBottom = Math.max(
    kalimdorY + kalimdorDimensions.height,
    azerothY + azerothDimensions.height
  );
  const sceneHeight = topPadding + (contentBottom - contentTop) + bottomPadding;
  const sceneWidth = leftPadding + kalimdorDimensions.width + gap + azerothDimensions.width + rightPadding;

  return {
    title: state.locale === "zh" ? "世界導航平面" : "World Navigation Plane",
    sceneBounds: {
      width: sceneWidth,
      height: sceneHeight,
    },
    entries: [
      {
        mapId: "1",
        map: kalimdor,
        terrain: state.terrain?.["1"] ?? null,
        placement: {
          x: kalimdorX,
          y: topPadding + (kalimdorY - contentTop),
          width: kalimdorDimensions.width,
          height: kalimdorDimensions.height,
        },
      },
      {
        mapId: "0",
        map: azeroth,
        terrain: state.terrain?.["0"] ?? null,
        placement: {
          x: azerothX,
          y: topPadding + (azerothY - contentTop),
          width: azerothDimensions.width,
          height: azerothDimensions.height,
        },
      },
    ],
  };
}

function renderTerrain(scene) {
  scene.entries.forEach((entry) => {
    if (!entry.terrain) {
      return;
    }

    const terrainBounds = getTerrainBounds(entry.terrain);
    const corners = [
      worldToView(
        terrainBounds.x_min,
        terrainBounds.y_min,
        entry.map.world_bounds,
        entry.placement,
        scene.sceneBounds
      ),
      worldToView(
        terrainBounds.x_min,
        terrainBounds.y_max,
        entry.map.world_bounds,
        entry.placement,
        scene.sceneBounds
      ),
      worldToView(
        terrainBounds.x_max,
        terrainBounds.y_min,
        entry.map.world_bounds,
        entry.placement,
        scene.sceneBounds
      ),
      worldToView(
        terrainBounds.x_max,
        terrainBounds.y_max,
        entry.map.world_bounds,
        entry.placement,
        scene.sceneBounds
      ),
    ];

    const minX = Math.min(...corners.map((point) => point.x));
    const maxX = Math.max(...corners.map((point) => point.x));
    const minY = Math.min(...corners.map((point) => point.y));
    const maxY = Math.max(...corners.map((point) => point.y));

    if (entry.terrain.assets.continent_base_image) {
      const insetX = ((maxX - minX) * (1 - CONTINENT_BASE_SCALE)) / 2;
      const insetY = ((maxY - minY) * (1 - CONTINENT_BASE_SCALE)) / 2;
      const baseImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
      baseImage.setAttribute("class", "terrain-image terrain-base-image");
      baseImage.setAttribute("href", entry.terrain.assets.continent_base_image);
      baseImage.setAttribute("x", minX + insetX);
      baseImage.setAttribute("y", minY + insetY);
      baseImage.setAttribute("width", (maxX - minX) * CONTINENT_BASE_SCALE);
      baseImage.setAttribute("height", (maxY - minY) * CONTINENT_BASE_SCALE);
      baseImage.setAttribute("preserveAspectRatio", "none");
      elements.terrainLayer.appendChild(baseImage);
    }

    const terrainImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    terrainImage.setAttribute("class", "terrain-image");
    terrainImage.setAttribute("href", entry.terrain.assets.terrain_image);
    terrainImage.setAttribute("x", minX);
    terrainImage.setAttribute("y", minY);
    terrainImage.setAttribute("width", maxX - minX);
    terrainImage.setAttribute("height", maxY - minY);
    terrainImage.setAttribute("preserveAspectRatio", "none");
    elements.terrainLayer.appendChild(terrainImage);
  });
}

function getTerrainBounds(summary) {
  return {
    x_min: summary.world_bounds_estimate.bottom_right.x,
    x_max: summary.world_bounds_estimate.top_left.x,
    y_min: summary.world_bounds_estimate.bottom_right.y,
    y_max: summary.world_bounds_estimate.top_left.y,
  };
}

function getRotatedDimensions(bounds) {
  return {
    width: bounds.y_max - bounds.y_min,
    height: bounds.x_max - bounds.x_min,
  };
}

function flattenZones(scene) {
  return scene.entries.flatMap((entry) =>
    entry.map.zones.map((zone) => ({
      ...zone,
      map_id: entry.mapId,
      continent: entry.map.area_name,
      continent_zh: entry.map.area_name_zh,
      placement: entry.placement,
      world_bounds: entry.map.world_bounds,
    }))
  ).filter((zone) => !shouldHideZone(zone));
}

function flattenNodes(scene) {
  return scene.entries.flatMap((entry) =>
    state.taxiNodes.maps[entry.mapId].usable_nodes.map((node) => ({
      ...node,
      map_id: entry.mapId,
      placement: entry.placement,
      world_bounds: entry.map.world_bounds,
    }))
  ).filter((node) => !shouldHideNode(node));
}

function flattenPaths(scene) {
  const taxiPaths = scene.entries.flatMap((entry) =>
    state.taxiNetwork.maps[entry.mapId].map((path) => ({
      ...path,
      mode: "taxi",
      map_id: entry.mapId,
      placement: entry.placement,
      world_bounds: entry.map.world_bounds,
    }))
  );

  const shipPaths =
    scene.entries.length > 1
      ? state.shipRoutes.routes.map((path) => ({
          ...path,
          mode: "ship",
        }))
      : [];

  const subwayPaths =
    scene.entries.length > 0
      ? state.subwayRoutes.routes.map((path) => ({
          ...path,
          mode: "subway",
        }))
      : [];

  const zeppelinPaths =
    scene.entries.length > 1
      ? state.zeppelinRoutes.routes.map((path) => ({
          ...path,
          mode: "zeppelin",
        }))
      : [];

  return [...taxiPaths, ...shipPaths, ...subwayPaths, ...zeppelinPaths].filter((path) => !shouldHidePath(path));
}

function shouldHideZone(zone) {
  return zone.area_name === "EngineerIsland";
}

function shouldHideNode(node) {
  return (
    node.name === "工程師島" ||
    node.name === "薄霧之地" ||
    String(node.name || "").startsWith("樣式 - ")
  );
}

function shouldHidePath(path) {
  return (
    path.from_name === "工程師島" ||
    path.to_name === "工程師島" ||
    path.from_name === "薄霧之地" ||
    path.to_name === "薄霧之地" ||
    String(path.from_name || "").startsWith("樣式 - ") ||
    String(path.to_name || "").startsWith("樣式 - ")
  );
}

function resetCamera() {
  const defaultZoom = state.activeMapId === "world" ? 0.68 : 1;
  state.camera.width = VIEWBOX.width * defaultZoom;
  state.camera.height = VIEWBOX.height * defaultZoom;
  state.camera.x = (VIEWBOX.width - state.camera.width) / 2;
  state.camera.y = (VIEWBOX.height - state.camera.height) / 2;
  state.camera.dragging = false;
  state.camera.dragOrigin = null;
  elements.mapSvg.classList.remove("is-dragging");
}

function applyViewBox() {
  clampCamera();
  elements.mapSvg.setAttribute(
    "viewBox",
    `${state.camera.x} ${state.camera.y} ${state.camera.width} ${state.camera.height}`
  );
  updateDynamicVisualStyles();
}

function clampCamera() {
  const maxX = VIEWBOX.width - state.camera.width;
  const maxY = VIEWBOX.height - state.camera.height;
  state.camera.x = clamp(state.camera.x, 0, Math.max(0, maxX));
  state.camera.y = clamp(state.camera.y, 0, Math.max(0, maxY));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function zoomAtCenter(factor) {
  zoomAtSvgPoint(VIEWBOX.width / 2, VIEWBOX.height / 2, factor);
}

function handleWheelZoom(event) {
  event.preventDefault();
  const svgPoint = clientToSvgPoint(event.clientX, event.clientY);
  const factor = event.deltaY < 0 ? 1 / 1.18 : 1.18;
  zoomAtSvgPoint(svgPoint.x, svgPoint.y, factor);
}

function zoomAtSvgPoint(anchorX, anchorY, factor) {
  const nextWidth = clamp(
    state.camera.width * factor,
    VIEWBOX.width / state.camera.maxScale,
    VIEWBOX.width / state.camera.minScale
  );
  const nextHeight = nextWidth * (VIEWBOX.height / VIEWBOX.width);
  const ratioX = (anchorX - state.camera.x) / state.camera.width;
  const ratioY = (anchorY - state.camera.y) / state.camera.height;

  state.camera.x = anchorX - ratioX * nextWidth;
  state.camera.y = anchorY - ratioY * nextHeight;
  state.camera.width = nextWidth;
  state.camera.height = nextHeight;
  applyViewBox();
}

function handlePointerDown(event) {
  if (event.button !== 0) {
    return;
  }
  state.route.pointerMoved = false;
  state.camera.dragging = true;
  state.camera.dragOrigin = {
    clientX: event.clientX,
    clientY: event.clientY,
    cameraX: state.camera.x,
    cameraY: state.camera.y,
  };
  elements.mapSvg.classList.add("is-dragging");
  elements.mapSvg.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!state.camera.dragging || !state.camera.dragOrigin) {
    return;
  }
  const rect = elements.mapSvg.getBoundingClientRect();
  const dx = ((event.clientX - state.camera.dragOrigin.clientX) / rect.width) * state.camera.width;
  const dy = ((event.clientY - state.camera.dragOrigin.clientY) / rect.height) * state.camera.height;
  if (Math.abs(event.clientX - state.camera.dragOrigin.clientX) > POINTER_CLICK_DRIFT || Math.abs(event.clientY - state.camera.dragOrigin.clientY) > POINTER_CLICK_DRIFT) {
    state.route.pointerMoved = true;
  }
  state.camera.x = state.camera.dragOrigin.cameraX - dx;
  state.camera.y = state.camera.dragOrigin.cameraY - dy;
  applyViewBox();
}

function handleCursorCoordinates(event) {
  if (!state.currentScene) {
    return;
  }

  const svgPoint = clientToSvgPoint(event.clientX, event.clientY);
  const worldPoint = svgToWorldPoint(svgPoint.x, svgPoint.y, state.currentScene);

  if (!worldPoint) {
    clearCursorCoordinates();
    return;
  }

  elements.cursorCoords.textContent = `X: ${Math.round(worldPoint.x)}, Y: ${Math.round(worldPoint.y)}`;
}

function clearCursorCoordinates() {
  elements.cursorCoords.textContent = "X: -, Y: -";
}

function handlePointerUp(event) {
  if (!state.camera.dragging) {
    return;
  }
  const wasClick = !state.route.pointerMoved;
  state.camera.dragging = false;
  state.camera.dragOrigin = null;
  elements.mapSvg.classList.remove("is-dragging");
  if (elements.mapSvg.hasPointerCapture(event.pointerId)) {
    elements.mapSvg.releasePointerCapture(event.pointerId);
  }
  if (wasClick) {
    handleMapClick(event);
  }
}

function clientToSvgPoint(clientX, clientY) {
  const rect = elements.mapSvg.getBoundingClientRect();
  const xRatio = (clientX - rect.left) / rect.width;
  const yRatio = (clientY - rect.top) / rect.height;
  return {
    x: state.camera.x + xRatio * state.camera.width,
    y: state.camera.y + yRatio * state.camera.height,
  };
}

function handleMapClick(event) {
  if (!state.currentScene) {
    return;
  }
  if (event.target !== elements.mapSvg) {
    return;
  }

  const svgPoint = clientToSvgPoint(event.clientX, event.clientY);
  const worldPoint = svgToWorldPoint(svgPoint.x, svgPoint.y, state.currentScene);
  if (!worldPoint) {
    return;
  }

  if (!state.route.pickMode) {
    state.activeSelection = buildSelectionFromPoint(worldPoint, svgPoint, state.currentScene);
    render();
    return;
  }

  const routePoint = buildRoutePoint(worldPoint);
  if (!routePoint) {
    return;
  }

  if (state.route.pickMode === "start") {
    state.route.start = routePoint;
    state.route.pickMode = null;
  } else {
    state.route.end = routePoint;
    state.route.pickMode = null;
  }

  state.activeSelection = null;
  state.route.result = null;
  if (state.route.start && state.route.end) {
    solveRoute();
  } else {
    updateRouteUi();
    render();
  }
}

function buildRoutePoint(worldPoint) {
  const entry = state.currentScene.entries.find((item) => String(item.mapId) === String(worldPoint.mapId));
  if (!entry) {
    return null;
  }

  const zone = findContainingZone(worldPoint);
  return {
    mapId: String(worldPoint.mapId),
    x: worldPoint.x,
    y: worldPoint.y,
    z: 0,
    zone,
    continent: entry.map.area_name,
    continent_zh: entry.map.area_name_zh,
  };
}

function findContainingZone(point) {
  const map = state.worldmap.maps[String(point.mapId)];
  if (!map) {
    return null;
  }
  return (
    map.zones.find((zone) => {
      const rect = zone.world_rect;
      return point.x >= rect.x_min && point.x <= rect.x_max && point.y >= rect.y_min && point.y <= rect.y_max;
    }) || null
  );
}

function clearRoute() {
  state.route.start = null;
  state.route.end = null;
  state.route.result = null;
  state.route.pickMode = null;
  updateRouteUi();
  render();
}

function solveRoute() {
  if (!state.route.start || !state.route.end) {
    updateRouteUi();
    return;
  }

  state.route.result = computeRoute(state.route.start, state.route.end, {
    factionChoice: state.route.factionChoice,
  });
  render();
}

function buildSelectionFromPoint(worldPoint, svgPoint, scene) {
  const nodes = flattenNodes(scene);
  const nearestNode = findNearestNode(nodes, svgPoint, scene);
  if (nearestNode) {
    return { type: "node", id: nearestNode.id };
  }

  const zone = findContainingZone(worldPoint);
  if (zone) {
    return {
      type: "point",
      point: {
        mapId: String(worldPoint.mapId),
        x: worldPoint.x,
        y: worldPoint.y,
        z: 0,
        zone,
      },
    };
  }

  return {
    type: "point",
    point: {
      mapId: String(worldPoint.mapId),
      x: worldPoint.x,
      y: worldPoint.y,
      z: 0,
      zone: null,
    },
  };
}

function findNearestNode(nodes, svgPoint, scene) {
  let best = null;
  let bestDistance = Infinity;
  nodes.forEach((node) => {
    const point = worldToView(
      node.position.x,
      node.position.y,
      node.world_bounds,
      node.placement,
      scene.sceneBounds
    );
    const distance = Math.hypot(point.x - svgPoint.x, point.y - svgPoint.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = node;
    }
  });
  return bestDistance <= CLICK_NEAREST_NODE_PX ? best : null;
}

function computeRoute(startPoint, endPoint, options) {
  const graph = buildRoutingGraph();
  const routeFaction = getPointFaction(startPoint, graph, options.factionChoice);
  const allowedNodesByMap = {
    "0": filterNodesForFaction(graph.nodesByMap["0"] || [], routeFaction),
    "1": filterNodesForFaction(graph.nodesByMap["1"] || [], routeFaction),
  };
  const allowedEdges = filterEdgesForFaction(graph.edges, graph.nodesById, routeFaction);
  const startCandidates = buildAccessEdges("start", startPoint, allowedNodesByMap[startPoint.mapId] || [], options);
  const endCandidates = buildAccessEdges("end", endPoint, allowedNodesByMap[endPoint.mapId] || [], options);

  if (!startCandidates.length || !endCandidates.length) {
    return {
      ok: false,
      reason: "no-access",
      startPoint,
      endPoint,
      faction: routeFaction,
    };
  }

  const edges = allowedEdges.slice();
  if (startPoint.mapId === endPoint.mapId) {
    const directDistance = planarDistance(startPoint, endPoint);
    const speed = MOUNT_SPEED;
    edges.push({
      id: "access:direct",
      from: "START",
      to: "END",
      mode: "access",
      time: directDistance / speed,
      distance: directDistance,
      route: {
        id: "access:direct",
        mode: "access",
        from_name: pointLabel(startPoint),
        to_name: pointLabel(endPoint),
        polyline: [
          { map_id: startPoint.mapId, position: { x: startPoint.x, y: startPoint.y, z: 0 } },
          { map_id: endPoint.mapId, position: { x: endPoint.x, y: endPoint.y, z: 0 } },
        ],
      },
    });
  }
  startCandidates.forEach((edge) => edges.push(edge));
  endCandidates.forEach((edge) => edges.push(edge));

  const distances = new Map([["START", 0]]);
  const previous = new Map();
  const visited = new Set();

  while (true) {
    let current = null;
    let currentDistance = Infinity;
    for (const [nodeId, value] of distances.entries()) {
      if (!visited.has(nodeId) && value < currentDistance) {
        current = nodeId;
        currentDistance = value;
      }
    }

    if (!current || current === "END") {
      break;
    }

    visited.add(current);
    edges.forEach((edge) => {
      if (edge.from !== current) {
        return;
      }
      const nextDistance = currentDistance + edge.time;
      if (nextDistance < (distances.get(edge.to) ?? Infinity)) {
        distances.set(edge.to, nextDistance);
        previous.set(edge.to, edge);
      }
    });
  }

  if (!previous.has("END")) {
    return {
      ok: false,
      reason: "unreachable",
      startPoint,
      endPoint,
      faction: routeFaction,
    };
  }

  const edgesInRoute = [];
  let cursor = "END";
  while (cursor !== "START") {
    const edge = previous.get(cursor);
    if (!edge) {
      break;
    }
    edgesInRoute.push(edge);
    cursor = edge.from;
  }
  edgesInRoute.reverse();

  const totalTime = edgesInRoute.reduce((sum, edge) => sum + edge.time, 0);
  const totalDistance = edgesInRoute.reduce((sum, edge) => sum + edge.distance, 0);
  return {
    ok: true,
    startPoint,
    endPoint,
    faction: routeFaction,
    totalTime,
    totalDistance,
    edges: edgesInRoute,
    segments: buildRouteSegments(edgesInRoute),
  };
}

function buildRoutingGraph() {
  const nodesById = new Map();
  const nodesByMap = { "0": [], "1": [] };

  Object.entries(state.taxiNodes.maps).forEach(([mapId, mapData]) => {
    mapData.usable_nodes.forEach((node) => {
      if (shouldHideNode(node)) {
        return;
      }
      const enriched = { ...node, map_id: String(mapId) };
      nodesById.set(String(node.id), enriched);
      if (!nodesByMap[String(mapId)]) {
        nodesByMap[String(mapId)] = [];
      }
      nodesByMap[String(mapId)].push(enriched);
    });
  });

  const edges = [];
  Object.entries(state.taxiNetwork.maps).forEach(([mapId, mapPaths]) => {
    mapPaths.forEach((path) => {
      if (shouldHidePath(path)) {
        return;
      }
      edges.push(...[].concat(buildTransportEdge(path, "taxi", String(path.from_node_id), String(path.to_node_id), false)));
    });
  });

  state.shipRoutes.routes.forEach((route) => {
    if (shouldHidePath(route)) {
      return;
    }
    edges.push(...[].concat(buildTransportEdge(route, "ship", String(route.from_node_id), String(route.to_node_id), true)));
  });

  state.subwayRoutes.routes.forEach((route) => {
    if (shouldHidePath(route)) {
      return;
    }
    edges.push(...[].concat(buildTransportEdge(route, "subway", String(route.from_node_id), String(route.to_node_id), true)));
  });

  state.zeppelinRoutes.routes.forEach((route) => {
    if (shouldHidePath(route)) {
      return;
    }
    edges.push(...[].concat(buildTransportEdge(route, "zeppelin", String(route.from_node_id), String(route.to_node_id), true)));
  });

  return { nodesById, nodesByMap, edges };
}

function filterNodesForFaction(nodes, routeFaction) {
  if (routeFaction === NEUTRAL) {
    return nodes;
  }
  return nodes.filter((node) => {
    const faction = getNodeFaction(node);
    return !faction || faction === NEUTRAL || faction === routeFaction;
  });
}

function filterEdgesForFaction(edges, nodesById, routeFaction) {
  if (routeFaction === NEUTRAL) {
    return edges.filter((edge) => edge.mode !== "zeppelin" && edge.mode !== "subway");
  }

  return edges.filter((edge) => {
    if (edge.mode === "zeppelin" && routeFaction !== HORDE) {
      return false;
    }
    if (edge.mode === "subway" && routeFaction !== ALLIANCE) {
      return false;
    }
    if (edge.mode === "ship" || edge.mode === "access") {
      return true;
    }

    const fromNode = nodesById.get(edge.from);
    const toNode = nodesById.get(edge.to);
    const fromFaction = fromNode ? getNodeFaction(fromNode) : "";
    const toFaction = toNode ? getNodeFaction(toNode) : "";
    return isFactionCompatible(fromFaction, routeFaction) && isFactionCompatible(toFaction, routeFaction);
  });
}

function isFactionCompatible(nodeFaction, routeFaction) {
  return !nodeFaction || nodeFaction === NEUTRAL || nodeFaction === routeFaction;
}

function buildTransportEdge(route, mode, fromId, toId, bidirectional) {
  const baseDistance = route.distance_3d || polylineDistance(route.polyline || []);
  const baseTime = estimateTransportTime(route, mode);
  const forward = {
    id: `${route.id}:${fromId}:${toId}`,
    from: fromId,
    to: toId,
    mode,
    route,
    time: baseTime,
    distance: baseDistance,
  };

  if (!bidirectional) {
    return forward;
  }

  const backward = {
    ...forward,
    id: `${route.id}:${toId}:${fromId}`,
    from: toId,
    to: fromId,
    reverse: true,
    route: {
      ...route,
      from_name: route.to_name,
      to_name: route.from_name,
      polyline: [...(route.polyline || [])].reverse(),
    },
  };

  return [forward, backward];
}

function buildAccessEdges(kind, anchorPoint, candidates, options) {
  const speed = MOUNT_SPEED;
  return candidates
    .map((node) => {
      const distance = planarDistance(anchorPoint, node.position);
      return {
        id: `${kind}:${node.id}`,
        from: kind === "start" ? "START" : String(node.id),
        to: kind === "start" ? String(node.id) : "END",
        mode: "access",
        time: distance / speed,
        distance,
        route: {
          id: `${kind}:${node.id}`,
          mode: "access",
          from_name: kind === "start" ? pointLabel(anchorPoint) : displayNodeName(node),
          to_name: kind === "start" ? displayNodeName(node) : pointLabel(anchorPoint),
          polyline: [
            { map_id: anchorPoint.mapId, position: { x: anchorPoint.x, y: anchorPoint.y, z: 0 } },
            { map_id: node.map_id, position: node.position },
          ],
        },
      };
    })
    .sort((left, right) => left.time - right.time)
    .slice(0, ACCESS_EDGE_COUNT);
}

function estimateTransportTime(route, mode) {
  const distance = route.distance_3d || polylineDistance(route.polyline || []);
  const speed =
    mode === "taxi"
      ? TAXI_SPEED
      : mode === "ship"
        ? SHIP_SPEED
        : mode === "zeppelin"
          ? ZEPPELIN_SPEED
          : SUBWAY_SPEED;
  return distance / speed + (BOARDING_PENALTY[mode] || 0);
}

function polylineDistance(points) {
  let total = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    total += planarDistance(points[index].position, points[index + 1].position);
  }
  return total;
}

function planarDistance(left, right) {
  const dx = left.x - right.x;
  const dy = left.y - right.y;
  return Math.hypot(dx, dy);
}

function buildRouteSegments(edges) {
  return edges.map((edge) => ({
    mode: edge.mode,
    fromLabel: edge.route.from_name,
    toLabel: edge.route.to_name,
    time: edge.time,
    distance: edge.distance,
    polyline: edge.route.polyline,
    mapId: edge.route.polyline?.[0]?.map_id ?? null,
  }));
}

function updateStats(scene, zones, nodes, paths) {
}

function displayMapName(map) {
  if (state.locale === "zh" && map.area_name_zh) {
    return map.area_name_zh;
  }
  return map.area_name;
}

function displayZoneName(zone) {
  if (state.locale === "zh" && zone.area_name_zh) {
    return zone.area_name_zh;
  }
  return zone.area_name;
}

function displayNodeName(node) {
  const raw = String(node.name || "").trim();
  const separators = ["，", ",", ":"];
  let best = raw;
  let bestLength = raw.length;

  separators.forEach((separator) => {
    const index = raw.indexOf(separator);
    if (index > 0) {
      const candidate = raw.slice(0, index).trim();
      if (candidate && candidate.length < bestLength) {
        best = candidate;
        bestLength = candidate.length;
      }
    }
  });

  return best;
}

function getFactionClass(faction) {
  return faction ? ` faction-${faction}` : "";
}

function getZoneFaction(zone) {
  const zh = zone.area_name_zh || "";
  const en = zone.area_name || "";
  return CITY_FACTIONS[zh] || CITY_FACTIONS[en] || "";
}

function getNodeFaction(node) {
  const shortName = displayNodeName(node);
  return NODE_FACTIONS[shortName] || "";
}

function getPointFaction(point, graph, fallbackFaction) {
  if (point.zone) {
    const zoneFaction = getZoneFaction(point.zone);
    if (zoneFaction === ALLIANCE || zoneFaction === HORDE) {
      return zoneFaction;
    }
  }

  const nearbyFactionNode = (graph.nodesByMap[point.mapId] || [])
    .map((node) => ({
      node,
      distance: planarDistance(point, node.position),
      faction: getNodeFaction(node),
    }))
    .filter((entry) => entry.faction === ALLIANCE || entry.faction === HORDE)
    .sort((left, right) => left.distance - right.distance)[0];

  return nearbyFactionNode?.faction || fallbackFaction || NEUTRAL;
}

function worldToView(x, y, bounds, placement, sceneBounds) {
  const normalizedX = (x - bounds.x_min) / (bounds.x_max - bounds.x_min);
  const normalizedY = (y - bounds.y_min) / (bounds.y_max - bounds.y_min);
  const rotatedX = 1 - normalizedY;
  const rotatedY = 1 - normalizedX;
  const sourceWidth = bounds.y_max - bounds.y_min;
  const sourceHeight = bounds.x_max - bounds.x_min;
  const innerWidth = VIEWBOX.width - VIEWBOX.padding * 2;
  const innerHeight = VIEWBOX.height - VIEWBOX.padding * 2;
  const scale = Math.min(innerWidth / sceneBounds.width, innerHeight / sceneBounds.height);
  const drawWidth = sceneBounds.width * scale;
  const drawHeight = sceneBounds.height * scale;
  const offsetX = (VIEWBOX.width - drawWidth) / 2;
  const offsetY = (VIEWBOX.height - drawHeight) / 2;
  const sceneX = placement.x + rotatedX * sourceWidth;
  const sceneY = placement.y + rotatedY * sourceHeight;

  return {
    x: offsetX + sceneX * scale,
    y: offsetY + sceneY * scale,
  };
}

function svgToWorldPoint(svgX, svgY, scene) {
  const innerWidth = VIEWBOX.width - VIEWBOX.padding * 2;
  const innerHeight = VIEWBOX.height - VIEWBOX.padding * 2;
  const scale = Math.min(innerWidth / scene.sceneBounds.width, innerHeight / scene.sceneBounds.height);
  const drawWidth = scene.sceneBounds.width * scale;
  const drawHeight = scene.sceneBounds.height * scale;
  const offsetX = (VIEWBOX.width - drawWidth) / 2;
  const offsetY = (VIEWBOX.height - drawHeight) / 2;

  const sceneX = (svgX - offsetX) / scale;
  const sceneY = (svgY - offsetY) / scale;

  const entry = scene.entries.find((item) => {
    return (
      sceneX >= item.placement.x &&
      sceneX <= item.placement.x + item.placement.width &&
      sceneY >= item.placement.y &&
      sceneY <= item.placement.y + item.placement.height
    );
  });

  if (!entry) {
    return null;
  }

  const localX = sceneX - entry.placement.x;
  const localY = sceneY - entry.placement.y;
  const sourceWidth = entry.map.world_bounds.y_max - entry.map.world_bounds.y_min;
  const sourceHeight = entry.map.world_bounds.x_max - entry.map.world_bounds.x_min;
  const rotatedX = localX / sourceWidth;
  const rotatedY = localY / sourceHeight;
  const normalizedX = 1 - rotatedY;
  const normalizedY = 1 - rotatedX;

  return {
    mapId: entry.mapId,
    x: entry.map.world_bounds.x_min + normalizedX * (entry.map.world_bounds.x_max - entry.map.world_bounds.x_min),
    y: entry.map.world_bounds.y_min + normalizedY * (entry.map.world_bounds.y_max - entry.map.world_bounds.y_min),
  };
}

function renderZones(scene, zones) {
  const strokeWidth = getZoneStrokeWidth();
  zones.forEach((zone) => {
    const rect = zone.world_rect;
    const corners = [
      worldToView(rect.x_min, rect.y_min, zone.world_bounds, zone.placement, scene.sceneBounds),
      worldToView(rect.x_min, rect.y_max, zone.world_bounds, zone.placement, scene.sceneBounds),
      worldToView(rect.x_max, rect.y_min, zone.world_bounds, zone.placement, scene.sceneBounds),
      worldToView(rect.x_max, rect.y_max, zone.world_bounds, zone.placement, scene.sceneBounds),
    ];
    const minX = Math.min(...corners.map((point) => point.x));
    const maxX = Math.max(...corners.map((point) => point.x));
    const minY = Math.min(...corners.map((point) => point.y));
    const maxY = Math.max(...corners.map((point) => point.y));

    const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    node.setAttribute("class", zoneClass(zone));
    node.style.strokeWidth = `${selectionMatches("zone", zone.id) ? (strokeWidth * 1.7).toFixed(2) : strokeWidth.toFixed(2)}px`;
    node.setAttribute("x", minX);
    node.setAttribute("y", minY);
    node.setAttribute("width", maxX - minX);
    node.setAttribute("height", maxY - minY);
    node.addEventListener("click", () => {
      state.activeSelection = { type: "zone", id: zone.id };
      render();
    });
    node.appendChild(buildTitle(displayZoneName(zone)));
    elements.zoneLayer.appendChild(node);
  });
}

function renderZoneLabels(scene, zones) {
  const labelSize = getZoneLabelSize();
  const strokeWidth = getZoneLabelStrokeWidth();
  zones.forEach((zone) => {
    const center = worldToView(
      zone.center.x,
      zone.center.y,
      zone.world_bounds,
      zone.placement,
      scene.sceneBounds
    );
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", `zone-label${getFactionClass(getZoneFaction(zone))}`);
    text.setAttribute("x", center.x);
    text.setAttribute("y", center.y);
    text.style.fontSize = `${labelSize.toFixed(2)}px`;
    text.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
    text.textContent = displayZoneName(zone);
    elements.labelLayer.appendChild(text);
  });
}

function renderNodeLabels(scene, nodes) {
  const labelSize = getNodeLabelSize();
  const strokeWidth = getNodeLabelStrokeWidth();
  const radius = getNodeRadius();
  const zoneAnchors = state.toggles.zoneLabels
    ? flattenZones(scene).map((zone) => ({
        name: displayZoneName(zone),
        point: worldToView(
          zone.center.x,
          zone.center.y,
          zone.world_bounds,
          zone.placement,
          scene.sceneBounds
        ),
      }))
    : [];
  const placedLabels = [];

  nodes.forEach((node) => {
    const point = worldToView(
      node.position.x,
      node.position.y,
      node.world_bounds,
      node.placement,
      scene.sceneBounds
    );
    const nodeName = displayNodeName(node);
    const overlapsZoneLabel = zoneAnchors.some((zone) => {
      if (zone.name !== nodeName) {
        return false;
      }
      const dx = zone.point.x - point.x;
      const dy = zone.point.y - point.y;
      return dx * dx + dy * dy <= 22 * 22;
    });

    if (overlapsZoneLabel) {
      return;
    }

    const duplicatesExistingLabel = placedLabels.some((label) => {
      if (label.name !== nodeName) {
        return false;
      }
      const dx = label.x - point.x;
      const dy = label.y - point.y;
      return dx * dx + dy * dy <= 28 * 28;
    });

    if (duplicatesExistingLabel) {
      return;
    }

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", `node-label${getFactionClass(getNodeFaction(node))}`);
    text.setAttribute("x", point.x);
    text.setAttribute("y", point.y - radius - 2);
    text.style.fontSize = `${labelSize.toFixed(2)}px`;
    text.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
    text.textContent = nodeName;
    elements.nodeLabelLayer.appendChild(text);
    placedLabels.push({ name: nodeName, x: point.x, y: point.y });
  });
}

function getZoneLabelSize() {
  const zoomRatio = getVisualZoomRatio();
  const isWorld = state.activeMapId === "world";
  const minimum = isWorld ? 2.3 : 2.8;
  const base = isWorld ? 15.6 : 12;
  const exponent = isWorld ? 0.86 : 1.05;
  return clamp(base * Math.pow(zoomRatio, exponent), minimum, base);
}

function getZoneLabelStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(2.4 * Math.pow(zoomRatio, 0.7), 0.9, 2.4);
}

function getNodeLabelSize() {
  const zoomRatio = getVisualZoomRatio();
  const isWorld = state.activeMapId === "world";
  const base = isWorld ? 12.6 : 9.5;
  const minimum = isWorld ? 2.1 : 1.5;
  const exponent = isWorld ? 0.88 : 1.08;
  return clamp(base * Math.pow(zoomRatio, exponent), minimum, base);
}

function getNodeLabelStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(1.8 * Math.pow(zoomRatio, 0.7), 0.7, 1.8);
}

function getPathLabelSize() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(11 * Math.pow(zoomRatio, 0.72), 3.2, 11);
}

function getPathLabelStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(2 * Math.pow(zoomRatio, 0.7), 0.8, 2);
}

function getZoneStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(1.2 * Math.pow(zoomRatio, 0.72), 0.45, 1.2);
}

function getPathStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(1.5 * Math.pow(zoomRatio, 0.72), 0.55, 1.5);
}

function getNodeRadius() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(1.8 * Math.pow(zoomRatio, 0.68), 0.85, 1.8);
}

function getNodeStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(0.55 * Math.pow(zoomRatio, 0.72), 0.2, 0.55);
}

function getRouteMarkerRadius() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(2.4 * Math.pow(zoomRatio, 0.7), 1.2, 2.4);
}

function getRouteMarkerStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(1.05 * Math.pow(zoomRatio, 0.72), 0.45, 1.05);
}

function getRouteMarkerLabelSize() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(8.5 * Math.pow(zoomRatio, 0.72), 4.6, 8.5);
}

function getRouteMarkerLabelStrokeWidth() {
  const zoomRatio = getVisualZoomRatio();
  return clamp(2.2 * Math.pow(zoomRatio, 0.72), 1.1, 2.2);
}

function getVisualZoomRatio() {
  const cameraRatio = state.camera.width / VIEWBOX.width;
  const maps = Object.values(state.worldmap.maps);
  const referenceWidth = Math.max(
    ...maps.map((map) => getRotatedDimensions(map.world_bounds).width)
  );
  const sceneWidth = state.currentScene ? state.currentScene.sceneBounds.width : referenceWidth;
  const sceneFactor = sceneWidth / referenceWidth;
  return cameraRatio / sceneFactor;
}

function updateDynamicVisualStyles() {
  const labelSize = getZoneLabelSize().toFixed(2);
  const labelStrokeWidth = getZoneLabelStrokeWidth().toFixed(2);
  elements.labelLayer.querySelectorAll(".zone-label").forEach((label) => {
    label.style.fontSize = `${labelSize}px`;
    label.style.strokeWidth = `${labelStrokeWidth}px`;
  });

  const nodeLabelSize = getNodeLabelSize().toFixed(2);
  const nodeLabelStrokeWidth = getNodeLabelStrokeWidth().toFixed(2);
  elements.nodeLabelLayer.querySelectorAll(".node-label").forEach((label) => {
    label.style.fontSize = `${nodeLabelSize}px`;
    label.style.strokeWidth = `${nodeLabelStrokeWidth}px`;
  });

  const pathLabelSize = getPathLabelSize().toFixed(2);
  const pathLabelStrokeWidth = getPathLabelStrokeWidth().toFixed(2);
  elements.pathLabelLayer.querySelectorAll(".path-label").forEach((label) => {
    label.style.fontSize = `${pathLabelSize}px`;
    label.style.strokeWidth = `${pathLabelStrokeWidth}px`;
  });

  const zoneStrokeWidth = getZoneStrokeWidth();
  elements.zoneLayer.querySelectorAll(".zone").forEach((zone) => {
    const active = zone.classList.contains("active");
    zone.style.strokeWidth = `${(active ? zoneStrokeWidth * 1.7 : zoneStrokeWidth).toFixed(2)}px`;
  });

  const pathStrokeWidth = getPathStrokeWidth();
  elements.pathLayer.querySelectorAll(".path-line").forEach((path) => {
    const active = path.classList.contains("active");
    path.style.strokeWidth = `${(active ? pathStrokeWidth * 1.7 : pathStrokeWidth).toFixed(2)}px`;
  });

  const nodeRadius = getNodeRadius();
  const nodeStrokeWidth = getNodeStrokeWidth();
  elements.nodeLayer.querySelectorAll(".node").forEach((node) => {
    const active = node.classList.contains("active");
    node.setAttribute("r", (active ? nodeRadius * ACTIVE_NODE_SCALE : nodeRadius).toFixed(2));
    node.style.strokeWidth = `${(active ? nodeStrokeWidth * ACTIVE_NODE_STROKE_SCALE : nodeStrokeWidth).toFixed(2)}px`;
  });

  const routeMarkerRadius = getRouteMarkerRadius();
  const routeMarkerStrokeWidth = getRouteMarkerStrokeWidth();
  const routeMarkerLabelSize = getRouteMarkerLabelSize();
  const routeMarkerLabelStrokeWidth = getRouteMarkerLabelStrokeWidth();
  elements.routeMarkerLayer.querySelectorAll(".route-marker-dot").forEach((dot) => {
    dot.setAttribute("r", routeMarkerRadius.toFixed(2));
    dot.style.strokeWidth = `${routeMarkerStrokeWidth.toFixed(2)}px`;
  });
  elements.routeMarkerLayer.querySelectorAll(".route-marker-text").forEach((label) => {
    label.style.fontSize = `${routeMarkerLabelSize.toFixed(2)}px`;
    label.style.strokeWidth = `${routeMarkerLabelStrokeWidth.toFixed(2)}px`;
  });
}

function renderPaths(scene, paths) {
  const strokeWidth = getPathStrokeWidth();
  paths.forEach((path) => {
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "path");
    polyline.setAttribute("class", pathClass(path));
    polyline.style.strokeWidth = `${selectionMatches("path", path.id) ? (strokeWidth * 1.7).toFixed(2) : strokeWidth.toFixed(2)}px`;
    polyline.setAttribute("d", buildPathData(path.polyline, path, scene));
    polyline.addEventListener("click", () => {
      state.activeSelection = { type: "path", id: path.id };
      render();
    });
    polyline.appendChild(buildTitle(`${path.from_name} -> ${path.to_name}`));
    elements.pathLayer.appendChild(polyline);
  });
}

function renderShipLabels(scene, paths) {
  const labelSize = getPathLabelSize();
  const strokeWidth = getPathLabelStrokeWidth();
  paths.forEach((path) => {
    const midpoint = getPolylineMidpoint(path.polyline, path, scene);
    if (!midpoint) {
      return;
    }
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", `path-label${path.mode === "subway" ? " subway" : ""}`);
    if (path.mode === "zeppelin") {
      text.setAttribute("class", "path-label zeppelin");
    }
    text.setAttribute("x", midpoint.x);
    text.setAttribute("y", midpoint.y - 4);
    text.setAttribute(
      "transform",
      `rotate(${midpoint.angle.toFixed(2)} ${midpoint.x.toFixed(2)} ${(midpoint.y - 4).toFixed(2)})`
    );
    text.style.fontSize = `${labelSize.toFixed(2)}px`;
    text.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
    text.textContent =
      path.mode === "subway"
        ? state.locale === "zh"
          ? path.line_name_zh || `${path.from_name} - ${path.to_name}`
          : path.line_name_en || `${path.from_name} - ${path.to_name}`
        : path.mode === "zeppelin"
          ? state.locale === "zh"
            ? path.line_name_zh || `${path.from_name} - ${path.to_name}`
            : path.line_name_en || `${path.from_name} - ${path.to_name}`
        : `${path.from_name} - ${path.to_name}`;
    elements.pathLabelLayer.appendChild(text);
  });
}

function renderRoute(scene) {
  if (!state.route.result?.ok) {
    renderRouteMarkers(scene);
    return;
  }

  const strokeWidth = Math.max(2.2, getPathStrokeWidth() * 1.55);
  state.route.result.segments.forEach((segment) => {
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const isAccess = segment.mode === "access";
    polyline.setAttribute("class", `route-line${isAccess ? " route-access" : ""}`);
    polyline.style.strokeWidth = `${strokeWidth.toFixed(2)}px`;
    polyline.setAttribute("d", buildPathData(segment.polyline, { map_id: segment.mapId }, scene));
    elements.routeLayer.appendChild(polyline);
  });

  renderRouteMarkers(scene);
}

function renderRouteMarkers(scene) {
  if (state.route.start) {
    renderRouteMarker(scene, state.route.start, "起");
  }
  if (state.route.end) {
    renderRouteMarker(scene, state.route.end, "終");
  }
}

function renderRouteMarker(scene, point, label) {
  const entry = scene.entries.find((item) => String(item.mapId) === String(point.mapId));
  if (!entry) {
    return;
  }

  const view = worldToView(
    point.x,
    point.y,
    entry.map.world_bounds,
    entry.placement,
    scene.sceneBounds
  );

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  group.setAttribute("class", "route-marker");

  const radius = getRouteMarkerRadius();
  const labelSize = getRouteMarkerLabelSize();

  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("class", "route-marker-dot");
  circle.setAttribute("cx", view.x);
  circle.setAttribute("cy", view.y);
  circle.setAttribute("r", radius.toFixed(2));

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("class", "route-marker-text");
  text.setAttribute("x", view.x);
  text.setAttribute("y", view.y - radius - 5);
  text.style.fontSize = `${labelSize.toFixed(2)}px`;
  text.textContent = label;

  group.appendChild(circle);
  group.appendChild(text);
  elements.routeMarkerLayer.appendChild(group);
}

function renderNodes(scene, nodes) {
  const radius = getNodeRadius();
  const strokeWidth = getNodeStrokeWidth();
  nodes.forEach((node) => {
    const point = worldToView(
      node.position.x,
      node.position.y,
      node.world_bounds,
      node.placement,
      scene.sceneBounds
    );
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", nodeClass(node));
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", selectionMatches("node", node.id) ? (radius * ACTIVE_NODE_SCALE).toFixed(2) : radius.toFixed(2));
    circle.style.strokeWidth = `${selectionMatches("node", node.id) ? (strokeWidth * ACTIVE_NODE_STROKE_SCALE).toFixed(2) : strokeWidth.toFixed(2)}px`;
    circle.addEventListener("click", () => {
      state.activeSelection = { type: "node", id: node.id };
      render();
    });
    circle.appendChild(buildTitle(node.name));
    elements.nodeLayer.appendChild(circle);
  });
}

function buildPathData(points, path, scene) {
  return points
    .map((point, index) => {
      const pointMapId = String(point.map_id ?? path.map_id);
      const entry = scene.entries.find((item) => String(item.mapId) === pointMapId);
      const bounds = entry ? entry.map.world_bounds : path.world_bounds;
      const placement = entry ? entry.placement : path.placement;
      const view = worldToView(point.position.x, point.position.y, bounds, placement, scene.sceneBounds);
      return `${index === 0 ? "M" : "L"} ${view.x.toFixed(2)} ${view.y.toFixed(2)}`;
    })
    .join(" ");
}

function getPolylineMidpoint(points, path, scene) {
  if (!points.length) {
    return null;
  }
  const projected = points.map((point) => {
    const pointMapId = String(point.map_id ?? path.map_id);
    const entry = scene.entries.find((item) => String(item.mapId) === pointMapId);
    const bounds = entry ? entry.map.world_bounds : path.world_bounds;
    const placement = entry ? entry.placement : path.placement;
    return worldToView(point.position.x, point.position.y, bounds, placement, scene.sceneBounds);
  });

  if (projected.length === 1) {
    return projected[0];
  }

  let total = 0;
  const segments = [];
  for (let i = 0; i < projected.length - 1; i += 1) {
    const left = projected[i];
    const right = projected[i + 1];
    const dx = right.x - left.x;
    const dy = right.y - left.y;
    const length = Math.hypot(dx, dy);
    segments.push({ left, right, length });
    total += length;
  }

  let target = total / 2;
  for (const segment of segments) {
    if (target <= segment.length) {
      const ratio = segment.length === 0 ? 0 : target / segment.length;
      const angle = Math.atan2(segment.right.y - segment.left.y, segment.right.x - segment.left.x) * 180 / Math.PI;
      return {
        x: segment.left.x + (segment.right.x - segment.left.x) * ratio,
        y: segment.left.y + (segment.right.y - segment.left.y) * ratio,
        angle: normalizeLabelAngle(angle),
      };
    }
    target -= segment.length;
  }

  const fallback = projected[Math.floor(projected.length / 2)];
  return { ...fallback, angle: 0 };
}

function normalizeLabelAngle(angle) {
  if (angle > 90) {
    return angle - 180;
  }
  if (angle < -90) {
    return angle + 180;
  }
  return angle;
}

function buildTitle(text) {
  const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = text;
  return title;
}

function zoneClass(zone) {
  return selectionMatches("zone", zone.id) ? "zone active" : "zone";
}

function pathClass(path) {
  const extraClass =
    path.mode === "ship"
      ? " ship"
      : path.mode === "subway"
        ? " subway"
        : path.mode === "zeppelin"
          ? " zeppelin"
          : "";
  return selectionMatches("path", path.id) ? `path-line${extraClass} active` : `path-line${extraClass}`;
}

function nodeClass(node) {
  return selectionMatches("node", node.id) ? "node active" : "node";
}

function selectionMatches(type, id) {
  return state.activeSelection?.type === type && state.activeSelection?.id === id;
}

function updateRouteUi() {
  elements.routeFactionSwitch.querySelectorAll("[data-route-faction]").forEach((button) => {
    button.classList.toggle("active", button.dataset.routeFaction === state.route.factionChoice);
  });
  elements.pickStart.classList.toggle("is-picking", state.route.pickMode === "start");
  elements.pickEnd.classList.toggle("is-picking", state.route.pickMode === "end");
  elements.routeStartLabel.textContent = state.route.start ? pointLabel(state.route.start) : "未設定";
  elements.routeEndLabel.textContent = state.route.end ? pointLabel(state.route.end) : "未設定";
  elements.routeSummary.innerHTML = buildRouteSummaryHtml();

  if (state.route.result?.ok) {
    elements.routeHint.textContent =
      state.locale === "zh"
        ? `地圖上已高亮路線，已按 ${formatFaction(state.route.result.faction)} 交通限制過濾。`
        : `Route highlighted. Filtered for ${formatFaction(state.route.result.faction)} travel rules.`;
  } else if (state.route.result && !state.route.result.ok) {
    elements.routeHint.textContent =
      state.locale === "zh"
        ? "目前找不到可行路線，請換一個位置試試。"
        : "No route found yet. Try a different position.";
  } else {
    elements.routeHint.textContent =
      state.route.pickMode === "start"
        ? (state.locale === "zh" ? "先點「起點」，再到地圖上選位置。" : "Pick a start point on the map.")
        : state.route.pickMode === "end"
          ? (state.locale === "zh" ? "接著到地圖上選終點。" : "Pick an end point on the map.")
          : (state.locale === "zh" ? `先選聯盟或部落，再點左側起點或終點。` : "Choose Alliance or Horde, then pick start or end.");
  }
}

function renderInfoPanel(scene, zones, nodes, paths) {
  const selection = state.activeSelection;
  if (!selection) {
    document.querySelector(".sidebar").classList.remove("sidebar-info-mode");
    elements.infoPanel.hidden = true;
    elements.infoPanel.innerHTML = `
      <div class="info-panel-header">
        <h2>${state.locale === "zh" ? "地點資訊" : "Place info"}</h2>
        <button type="button" class="info-close" id="info-close" aria-label="Close">×</button>
      </div>
      <p class="info-placeholder">${state.locale === "zh" ? "左鍵點地圖上的位置、飛行點或區域，這裡會顯示基本資訊。" : "Click the map to inspect a place and see quick info here."}</p>
    `;
    elements.infoClose = document.getElementById("info-close");
    elements.infoClose.addEventListener("click", () => {
      state.activeSelection = null;
      render();
    });
    return;
  }

  document.querySelector(".sidebar").classList.add("sidebar-info-mode");
  elements.infoPanel.hidden = false;

  if (selection.type === "node") {
    const node = nodes.find((item) => item.id === selection.id);
    if (!node) {
      return;
    }
    const point = {
      mapId: String(node.map_id),
      x: node.position.x,
      y: node.position.y,
      z: node.position.z,
      zone: node.zone_guess
        ? {
            area_name: node.zone_guess.area_name,
            area_name_zh: node.zone_guess.area_name_zh || node.zone_guess.area_name,
            world_rect: findContainingZone({ mapId: String(node.map_id), x: node.position.x, y: node.position.y })?.world_rect || null,
          }
        : null,
    };
    const localCoords = getLocalZoneCoordinates(point);
    const faction = getNodeFaction(node) || NEUTRAL;
    const placeType = getZoneFaction({ area_name: node.zone_guess?.area_name || "", area_name_zh: node.zone_guess?.area_name_zh || "" }) ? "city" : "flight";
    const typeLabel =
      placeType === "city"
        ? `${formatFaction(faction)}${state.locale === "zh" ? "城市" : " city"}`
        : `${formatFaction(faction)}${state.locale === "zh" ? "飛行點" : " flight point"}`;
    elements.infoPanel.innerHTML = `
      <div class="info-panel-header">
        <h2>${state.locale === "zh" ? "地點資訊" : "Place info"}</h2>
        <button type="button" class="info-close" id="info-close" aria-label="Close">×</button>
      </div>
      <h3>${displayNodeName(node)}</h3>
      <div class="info-meta">${typeLabel}</div>
      <p>${state.locale === "zh" ? "所在區域" : "Zone"}：${node.zone_guess ? (state.locale === "zh" ? (node.zone_guess.area_name_zh || node.zone_guess.area_name) : node.zone_guess.area_name) : (state.locale === "zh" ? "未知" : "Unknown")}</p>
      <p>${state.locale === "zh" ? "所在大陸" : "Continent"}：${state.locale === "zh" ? (node.continent_zh || node.continent) : node.continent}</p>
      ${localCoords ? `<p>${state.locale === "zh" ? "區域地圖座標" : "Zone map coordinates"}：${localCoords.x.toFixed(1)}, ${localCoords.y.toFixed(1)}</p>` : ""}
      <p>${state.locale === "zh" ? "座標" : "Coordinates"}：${Math.round(node.position.x)}, ${Math.round(node.position.y)}</p>
      <div class="info-actions">
        <button type="button" class="route-button" data-set-route="start">${state.locale === "zh" ? "設為起點" : "Set as start"}</button>
        <button type="button" class="route-button" data-set-route="end">${state.locale === "zh" ? "設為終點" : "Set as end"}</button>
      </div>
    `;
    wireInfoClose();
    bindInfoPanelActions(point);
    return;
  }

  if (selection.type === "point") {
    const point = selection.point;
    const zone = point.zone;
    const zoneName = zone ? displayZoneName(zone) : (state.locale === "zh" ? "未標註區域" : "Unnamed area");
    const levelRange = zone ? getZoneLevelRange(zone) : "";
    const faction = zone ? getZoneFaction(zone) || NEUTRAL : NEUTRAL;
    const typeLabel = `${formatFaction(faction)}${state.locale === "zh" ? "區域" : " zone"}`;
    elements.infoPanel.innerHTML = `
      <div class="info-panel-header">
        <h2>${state.locale === "zh" ? "地點資訊" : "Place info"}</h2>
        <button type="button" class="info-close" id="info-close" aria-label="Close">×</button>
      </div>
      <h3>${zoneName}</h3>
      <div class="info-meta">${typeLabel}</div>
      ${levelRange ? `<p>${state.locale === "zh" ? "建議等級" : "Suggested level"}：${levelRange}</p>` : ""}
      <p>${state.locale === "zh" ? "座標" : "Coordinates"}：${Math.round(point.x)}, ${Math.round(point.y)}</p>
      <div class="info-actions">
        <button type="button" class="route-button" data-set-route="start">${state.locale === "zh" ? "設為起點" : "Set as start"}</button>
        <button type="button" class="route-button" data-set-route="end">${state.locale === "zh" ? "設為終點" : "Set as end"}</button>
      </div>
    `;
    wireInfoClose();
    bindInfoPanelActions(point);
  }
}

function wireInfoClose() {
  elements.infoClose = document.getElementById("info-close");
  if (elements.infoClose) {
    elements.infoClose.addEventListener("click", () => {
      state.activeSelection = null;
      render();
    });
  }
}

function bindInfoPanelActions(point) {
  elements.infoPanel.querySelectorAll("[data-set-route]").forEach((button) => {
    button.addEventListener("click", () => {
      const routePoint = buildRoutePoint({ mapId: point.mapId, x: point.x, y: point.y });
      if (!routePoint) {
        return;
      }
      if (button.dataset.setRoute === "start") {
        state.route.start = routePoint;
      } else {
        state.route.end = routePoint;
      }
      state.route.result = null;
      if (state.route.start && state.route.end) {
        solveRoute();
      } else {
        updateRouteUi();
        render();
      }
    });
  });
}

function getZoneLevelRange(zone) {
  const name = zone.area_name_zh || zone.area_name || "";
  return ZONE_LEVEL_RANGES[name] || "";
}

function getLocalZoneCoordinates(point) {
  const zone = point.zone;
  if (!zone || !zone.world_rect) {
    return null;
  }

  const rect = zone.world_rect;
  const width = rect.x_max - rect.x_min;
  const height = rect.y_max - rect.y_min;
  if (!width || !height) {
    return null;
  }

  const localX = ((point.x - rect.x_min) / width) * 100;
  const localY = ((rect.y_max - point.y) / height) * 100;
  return {
    x: clamp(localX, 0, 100),
    y: clamp(localY, 0, 100),
  };
}

function buildRouteSummaryHtml() {
  if (!state.route.result) {
    return "";
  }
  if (!state.route.result.ok) {
    return `
      <div class="route-summary-card">
        <strong>${state.locale === "zh" ? "尚未算出路線" : "No route yet"}</strong>
        <p>${state.locale === "zh" ? "目前只會接入附近交通節點並估算區域內直線移動。" : "Routing currently uses nearby transport nodes and straight-line local access."}</p>
      </div>
    `;
  }

  const steps = state.route.result.segments
    .map((segment) => `<li>${describeSegment(segment)}</li>`)
    .join("");

  return `
    <div class="route-summary-card">
      <strong>${state.locale === "zh" ? "導航結果" : "Route result"}</strong>
      <p>${state.locale === "zh" ? "陣營" : "Faction"}: ${formatFaction(state.route.result.faction)} · ${state.locale === "zh" ? "總耗時" : "Total time"}: ${formatDuration(state.route.result.totalTime)} · ${state.locale === "zh" ? "總距離" : "Distance"}: ${Math.round(state.route.result.totalDistance)}</p>
      <ol>${steps}</ol>
    </div>
  `;
}

function describeSegment(segment) {
  const mode =
    segment.mode === "taxi"
      ? (state.locale === "zh" ? "飛行" : "Taxi")
      : segment.mode === "ship"
        ? (state.locale === "zh" ? "船" : "Ship")
        : segment.mode === "zeppelin"
        ? (state.locale === "zh" ? "飛艇" : "Zeppelin")
          : segment.mode === "subway"
            ? (state.locale === "zh" ? "地鐵" : "Subway")
            : (state.locale === "zh" ? "區域內移動" : "Local travel");
  return `${mode}：${segment.fromLabel} → ${segment.toLabel}（${formatDuration(segment.time)}）`;
}

function pointLabel(point) {
  const zoneName = point.zone ? displayZoneName(point.zone) : (state.locale === "zh" ? "未知區域" : "Unknown area");
  const coords = `${Math.round(point.x)}, ${Math.round(point.y)}`;
  return `${zoneName} · ${coords}`;
}

function formatFaction(faction) {
  if (faction === ALLIANCE) {
    return state.locale === "zh" ? "聯盟" : "Alliance";
  }
  if (faction === HORDE) {
    return state.locale === "zh" ? "部落" : "Horde";
  }
  return state.locale === "zh" ? "中立/未判定" : "Neutral/Undetermined";
}

function formatDuration(seconds) {
  const rounded = Math.max(1, Math.round(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remain = rounded % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remain}s`;
  }
  return `${remain}s`;
}



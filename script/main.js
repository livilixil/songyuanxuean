// import * as PIXI from "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.1.0-rc.4/browser/pixi.min.mjs";
import * as Character from "./character.js";
import * as Background from "./background.js";
import * as Font from "./fontLoader.js";
import * as Navigator from "./navigator.js";
import * as Card from "./card.js";
import * as Building from "./building.js";

const worldBox = {
  width: 2592,
  height: 6751,
};

const app = new PIXI.Application({
  transparent: true,
});
const viewport = new pixi_viewport.Viewport({
  screenWidth: window.innerWidth,
  screenHeight: window.innerHeight,
  worldWidth: worldBox.width,
  worldHeight: worldBox.height,

  interaction: app.renderer.plugins.interaction, // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
});
// const characterGroup = new PIXI.display.Group(0, true);
let background = undefined;

async function initializeRenderer() {
  let type = "WebGL";
  if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
  }
  PIXI.utils.sayHello(type);
  app.renderer.view.style.position = "absolute";
  app.renderer.view.style.display = "block";
  app.renderer.autoResize = true;
  app.renderer.resize(window.innerWidth, window.innerHeight);
  document.body.appendChild(app.view);
  app.stage.addChild(viewport);
  viewport.clamp({ direction: "all" });
  viewport.clampZoom({ minScale: 0.2, maxScale: 4 });
  viewport.drag().wheel(); // pinch().decelerate();
  await Background.loadBackground();
  background = new PIXI.TilingSprite(
    Background.getBackgroundTexture(),
    worldBox.width,
    worldBox.height
  );
  // background = new PIXI.Sprite(Background.getBackgroundTexture());
  background.zOrder = -1000;
  viewport.addChild(background);
}

function viewportEventHandler(event) {
  let hitArea = event.hitArea || event.viewport.hitArea;
  Navigator.updateNavigator({
    x: hitArea.x / worldBox.width,
    y: hitArea.y / worldBox.height,
    width: hitArea.width / worldBox.width,
    height: hitArea.height / worldBox.height,
  });
}

// async function testCharacter() {

//   let c = [];
//   c[0] = new Character.Character_0("程颢");
//   c[1] = new Character.Character_1("程颐");
//   c[2] = new Character.Character_2("周敦颐");
//   c[3] = new Character.Character_3("朱右");
//   c[4] = new Character.Character_4("胡媛");
//   c[5] = new Character.Character_8("范仲淹");
//   let base = 100;
//   for (let i of c) {
//     i.register(viewport);
//     i.setPos(base, 500);
//     i.setVisible(true);
//     i.setWalkingState(true);
//     base += 250;
//   }
// }

async function addCharacterAndBuilding() {
  let filter = new PIXI.filters.OutlineFilter(3, 0xdbc49b);
  let lastClicked = undefined;
  let characterList = Character.getCharacterList();
  d3.json("assets/data.json").then((data) => {
    let schools = Object.keys(data.xuepai);
    for (let i of schools) {
      let b = new Building.Building(i, i, data.xuepaiid[i]);
      b.register(viewport);
      b.setPos(
        data.xuepai[i][0],
        data.xuepai[i][1],
        data.xuepailabel[i][0],
        data.xuepailabel[i][1]
      );
      b.setVisible(true);
      b.object.on("pointerover", function () {
        this.filters = [filter];
      });
      b.object.on("pointerout", function () {
        this.filters = null;
      });
    }
    data.links.forEach((link, _) => {
      link.relations.forEach((relation, _) => {
        let src = data.xuepai[link.source];
        let tar = data.xuepai[link.target];
        let characterType = 0;
        do {
          characterType = Math.floor(Math.random() * 9);
        } while (characterType === 7 || characterType === 3);
        let c = new characterList[characterType](relation.down);
        c.register(viewport);
        c.setWalkingState(true);
        c.Moving(src, tar);
        viewport.addChild(c.path);
        c.object.on("click", function (e) {
          Card.updateCard(c.name);
          console.log(lastClicked, this.path);
          lastClicked &&
            ((lastClicked.object.filters = null),
            (lastClicked.path.filters = null));
          this.filters = [filter];
          // console.log(this.path);
          c.path.filters = [filter];
          lastClicked = c;
        });
        c.object.on("pointerover", function () {
          if (lastClicked !== c) this.filters = [filter];
        });
        c.object.on("pointerout", function () {
          if (lastClicked !== c) this.filters = null;
        });
      });
    });
  });
}

async function initialize() {
  await initializeRenderer();
  await Font.loadFont();
  await Character.initializeCharacter();
  await Building.initializeBuilding();
  Navigator.initializeNavigator();
  Card.initializeCard();
  viewport.on("moved-end", viewportEventHandler);
  viewport.on("zoomed-end", viewportEventHandler);
  addCharacterAndBuilding();
}

// window.onload = testCharacter();
window.onload = initialize;

import { getCharacterTextures } from "./characterLoader.js";
import * as Background from "./background.js";
let buildingTextures;

export class Building {
  constructor(name, id, type) {
    this.type = type;
    this.name = name;
    this.id = id;
    this.person = new PIXI.Sprite(buildingTextures[`building${this.type}.png`]);
    this.plaque = new PIXI.Sprite(Background.getPlaqueTexture()["building"]);
    this.nameText = new PIXI.Text(this.name, {
      fontFamily: "宋体",
      fontSize: 70,
      padding: 22,
      align: "center",
      //   fill: "#443615",
      fill: "#999999",
    });
    this.nameText.anchor.set(0.5, 0.5);
    this.plaque.anchor.set(0.5, 0.5);
    this.plaque.scale.set(0.63, 0.63);
    this.plaque.addChild(this.nameText);
    this.plaque.x = 0;
    this.plaque.y = -300;
    this.object = new PIXI.Container();

    this.object.addChild(this.person);
    this.object.addChild(this.plaque);

    this.object.interactive = true;
  }

  register(container) {
    container.addChild(this.object);
  }

  setPos(x, y, lx, ly) {
    this.object.position.set(x, y);
    this.object.zOrder = y;
    this.plaque.position.set(lx - x, ly - y);
  }

  setVisible(flag) {
    this.object.visible = flag;
  }
}

export async function initializeBuilding() {
  buildingTextures = getCharacterTextures();
}

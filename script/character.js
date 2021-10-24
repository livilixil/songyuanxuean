// import * as PIXI from "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.1.0-rc.4/browser/pixi.min.mjs";
import { loadCharacter, getCharacterTextures } from "./characterLoader.js";
import * as Background from "./background.js";
// import updateCharacterInfo from "./card.js";
let characterTextures;
let characterCounter = 0;

function coordiateRotate(ang, x, y) {
  return [
    x * Math.cos(ang) - y * Math.sin(ang),
    x * Math.sin(ang) + y * Math.cos(ang),
  ];
}

class Character {
  constructor(name, id, type, direct, walkingAnimation = {}) {
    this.type = type;
    this.direct = direct;
    this.name = name;
    this.id = characterCounter++;
    this.head = new PIXI.Sprite(characterTextures[`${this.type}-h.png`]);
    this.body = new PIXI.Sprite(characterTextures[`${this.type}-b.png`]);
    this.leftleg = new PIXI.Sprite(characterTextures[`${this.type}-l.png`]);
    this.rightleg = new PIXI.Sprite(characterTextures[`${this.type}-r.png`]);
    this.person = new PIXI.Container();
    this.plaque = new PIXI.Sprite(Background.getPlaqueTexture()["person"]);
    this.nameText = new PIXI.Text(this.name, {
      fontFamily: "宋体",
      fontSize: 90,
      padding: 22,
      align: "center",
      fill: "#443615",
    });
    this.nameText.anchor.set(0.5, 0.5);
    this.plaque.anchor.set(0.5, 0.5);
    this.plaque.scale.set(0.5, 0.5);
    this.plaque.addChild(this.nameText);
    this.plaque.x = 0;
    this.plaque.y = -300;
    this.object = new PIXI.Container();

    this.leftleg.zOrder = -1;
    this.rightleg.zOrder = -1;
    this.head.zOrder = 1;
    this.body.zOrder = 0;
    this.object.zOrder = 0.5;

    this.person.addChild(this.leftleg);
    this.person.addChild(this.rightleg);
    this.person.addChild(this.body);
    this.person.addChild(this.head);
    this.object.addChild(this.person);
    // this.object.addChild(this.plaque);

    this.initializeWalking(walkingAnimation);
    this.object.scale.set(0.6 * 0.25, 0.6 * 0.25);
    this.object.interactive = true;
    // this.head.blendMode = PIXI.BLEND_MODES.ADD;
    // this.body.blendMode = PIXI.BLEND_MODES.ADD;
    // this.leftleg.blendMode = PIXI.BLEND_MODES.ADD;
    // this.rightleg.blendMode = PIXI.BLEND_MODES.ADD;
  }

  register(container) {
    this.parentContainer = container;
    container.addChild(this.object);
  }

  setPos(x, y) {
    this.object.position.set(x, y);
  }

  setDirect(direct) {}

  setVisible(flag) {
    this.object.visible = flag;
  }

  setWalkingState(flag) {
    if (flag) {
      this.leftlegSwing.paused(false);
      this.rightlegSwing.paused(false);
      this.headSwing.paused(false);
    } else {
      this.leftlegSwing.paused(true);
      this.rightlegSwing.paused(true);
      this.headSwing.paused(true);
    }
  }

  initializeWalking(walkingAnimation) {
    let swingRange = (Math.PI / 15) * (walkingAnimation.swingRangeCoef || 1);
    let swingTime = 1 * (walkingAnimation.swingTimeCoef || 1);
    function swingFunction(obj, swingRangeCoef = 1) {
      return gsap
        .timeline({ repeat: -1 })
        .to(obj, swingTime, {
          rotation:
            swingRange *
            swingRangeCoef *
            (walkingAnimation.swingRangeLCoef || 1),
          ease: Linear.easeNone,
        })
        .to(obj, swingTime, {
          rotation:
            -swingRange *
            swingRangeCoef *
            (walkingAnimation.swingRangeRCoef || 1),
          ease: Linear.easeNone,
        });
    }
    this.leftleg.rotation = -swingRange;
    this.rightleg.rotation = swingRange;
    this.head.rotation = -swingRange * 0.5;
    this.leftlegSwing = swingFunction(this.leftleg);
    this.rightlegSwing = swingFunction(this.rightleg, -1);
    this.headSwing = swingFunction(this.head, 0.5);
    this.leftlegSwing.paused(true);
    this.rightlegSwing.paused(true);
    this.headSwing.paused(true);
  }

  Moving(points) {
    const speed = 0.01;
    const sqrt2 = Math.sqrt(2) / 2;
    let mid = [[], []];

    let line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y);
    let distance = d3
      .select("svg")
      .append("path")
      .datum(points)
      .attr("d", line)
      .attr("id", "path" + this.id)
      .node()
      .getTotalLength();

    // mid[0][0] = Math.random() * sqrt2 * distance;
    // mid[0][1] = Math.random() * sqrt2 * distance;
    // mid[1][0] = Math.random() * sqrt2 * distance;
    // mid[1][1] = Math.random() * sqrt2 * distance;
    // mid[0] = coordiateRotate(ang - Math.PI / 4, ...mid[0]);
    // mid[1] = coordiateRotate(ang - Math.PI / 4, ...mid[1]);

    // this.path = new PIXI.Graphics();
    // this.path.lineStyle(15, 0xffbc64, 0.2);
    // // this.path.lineStyle(15, 0xd49c53, 0.2);
    // this.path.moveTo(src[0], src[1]);
    // this.path.bezierCurveTo(
    //   src[0] + mid[0][0],
    //   src[1] + mid[0][1],
    //   src[0] + mid[1][0],
    //   src[1] + mid[1][1],
    //   tar[0],
    //   tar[1]
    // );
    // this.path.endFill();

    this.path = new PIXI.Graphics();
    // this.path.lineStyle(5, 0x555555, 0.4);
    let testTexture = PIXI.Texture.from("assets/road.png");
    this.path.lineTextureStyle({ width: 10, texture: testTexture });
    this.path.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
      this.path.lineTo(points[i].x, points[i].y);
    }
    // this.path.filters = [new PIXI.filters.BlurFilter(2)];

    this.path.zOrder = -100;
    // let pathDirection = +(src[0] < tar[0]);
    let pathDirection = 1;
    let path = anime.path("#path" + this.id);
    if (this.direct != pathDirection) {
      this.person.scale.x *= -1;
    }
    let tl = anime.timeline({
      autoplay: false,
      loop: true,
    });
    let positionMovingAnime = {
      targets: this.object.position,
      x: path("x"),
      y: path("y"),
      duration: distance / speed,
      easing: "linear",
      update: () => {
        this.object.zOrder = 10000 + this.object.position.y;
        this.parentContainer.children.sort(function (a, b) {
          if (a.position.y > b.position.y) return 1;
          if (a.position.y < b.position.y) return -1;
          return 0;
        });
      },
    };
    tl.add(positionMovingAnime);
    // .add(positionMovingAnime);
    setTimeout(() => tl.play(), Math.random() * 5000);
    // if (this.id === 0) {
    //   setInterval(() => {
    //     console.log(this.object.zOrder, this.object.position.y);
    //   }, 100);
    // }
  }
}

function set_pos(ob, x, y, bd) {
  ob.position.set(x - bd.anchor.x * bd.width, y - bd.anchor.y * bd.height);
}

export class Character_0 extends Character {
  constructor(name, id) {
    super(name, id, 0, 1);
    set_pos(this.head, 78, 130, this.body);
    set_pos(this.leftleg, 69, 213, this.body);
    set_pos(this.rightleg, 42, 211, this.body);
  }
}

export class Character_1 extends Character {
  constructor(name, id) {
    super(name, id, 1, 0, {
      swingRangeCoef: 0.7,
      swingTime: 0.7,
      swingRangeLCoef: 1.3,
    });
    set_pos(this.head, 53, 17, this.body);
    set_pos(this.leftleg, 88, 110, this.body);
    set_pos(this.rightleg, 44, 120, this.body);
  }
}

export class Character_2 extends Character {
  constructor(name, id) {
    super(name, id, 2, 1, { swingRangeCoef: 0.5, swingTime: 0.5 });
    set_pos(this.head, 50, -1, this.body);
    set_pos(this.leftleg, 54, 101, this.body);
    set_pos(this.rightleg, 35, 108, this.body);
    this.head.zOrder = -2;
  }
}

export class Character_3 extends Character {
  constructor(name, id) {
    super(name, id, 3, 0, { swingRangeCoef: 0.7, swingTime: 0.7 });
    set_pos(this.head, 84, 37, this.body);
    set_pos(this.leftleg, 132, 130, this.body);
    set_pos(this.rightleg, 162, 117, this.body);
  }
}

export class Character_4 extends Character {
  constructor(name, id) {
    super(name, id, 4, 0, { swingRangeCoef: 0.4, swingTime: 0.4 });
    set_pos(this.head, 165, 195, this.body);
    set_pos(this.leftleg, 183, 665, this.body);
    set_pos(this.rightleg, 107, 645, this.body);
    this.person.scale.set(0.26, 0.26);
  }
}

export class Character_5 extends Character {
  constructor(name, id) {
    super(name, id, 5, 1, { swingRangeCoef: 0.6, swingTime: 0.6 });
    set_pos(this.head, 305, 45, this.body);
    set_pos(this.leftleg, 389, 416, this.body);
    set_pos(this.rightleg, 286, 482, this.body);
    this.person.scale.set(0.3, 0.3);
  }
}

export class Character_6 extends Character {
  constructor(name, id) {
    super(name, id, 6, 1, { swingRangeCoef: 0.6, swingTime: 0.6 });
    set_pos(this.head, 82, 32, this.body);
    set_pos(this.leftleg, 85, 221, this.body);
    set_pos(this.rightleg, 43, 232, this.body);
    this.person.scale.set(0.7, 0.7);
  }
}

export class Character_7 extends Character {
  constructor(name, id) {
    super(name, id, 7, 0, {
      swingRangeCoef: 0.8,
      swingTime: 0.8,
    });
    set_pos(this.head, 171, 27, this.body);
    set_pos(this.leftleg, 184, 277, this.body);
    set_pos(this.rightleg, 118, 275, this.body);
    this.person.scale.set(0.4, 0.4);
  }
}

export class Character_8 extends Character {
  constructor(name, id) {
    super(name, id, 8, 1, {
      swingRangeCoef: 0.8,
      swingTime: 0.8,
    });
    set_pos(this.head, 84, 45, this.body);
    set_pos(this.leftleg, 89, 186, this.body);
    set_pos(this.rightleg, 50, 200, this.body);
    this.person.scale.set(0.6, 0.6);
  }
}

export async function initializeCharacter() {
  await loadCharacter();
  characterTextures = getCharacterTextures();
}

export function getCharacterList() {
  return [
    Character_0,
    Character_1,
    Character_2,
    Character_3,
    Character_4,
    Character_5,
    Character_6,
    Character_7,
    Character_8,
  ];
}

// import { Loader } from "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.1.0-rc.4/browser/pixi.min.mjs";

let characterLoader = new PIXI.Loader();
let characterTextures = undefined;

export async function loadCharacter() {
  characterLoader.add("assets/character/character.json");
  characterTextures = await new Promise((resolve, reject) => {
    characterLoader.load((loader) => {
      resolve(loader.resources["assets/character/character.json"].textures);
    });
  });
}

export function getCharacterTextures() {
  return characterTextures;
}

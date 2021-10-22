let backgroundLoader = new PIXI.Loader();
let backgroundTexture = undefined;
let personPlaqueTexture = undefined;
let buildingPlaqueTexture = undefined;

export async function loadBackground() {
  backgroundLoader.add("assets/background_white.jpg");
  backgroundLoader.add("assets/plaque_building.png");
  backgroundLoader.add("assets/plaque_person.png");
  let resources = await new Promise((resolve, reject) => {
    backgroundLoader.load((loader) => {
      console.log(loader);
      resolve(loader.resources);
    });
  });
  backgroundTexture = resources["assets/background_white.jpg"].texture;
  personPlaqueTexture = resources["assets/plaque_person.png"].texture;
  buildingPlaqueTexture = resources["assets/plaque_building.png"].texture;
}

export function getBackgroundTexture() {
  return backgroundTexture;
}

export function getPlaqueTexture() {
  return { building: buildingPlaqueTexture, person: personPlaqueTexture };
}

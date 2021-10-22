let curCharacter = {};
let characterInfo = undefined;

function updatecurCharacter(curCharacter) {
  $(".card--name").text(curCharacter.name);
  $(".card--avatar img").attr("src", curCharacter.avatar);
  $(".card--info").text(curCharacter.resume);
}

export function updateCard(name) {
  let data = characterInfo["人物信息"];
  let flag = false;
  curCharacter = {};
  curCharacter.name = name;
  for (let i in data) {
    if (name === data[i].name) {
      flag = true;
      curCharacter.avatar = data[i].avatar;
      curCharacter.resume = data[i].info.slice(0, 128);
    }
  }
  if (curCharacter.avatar === undefined || curCharacter.avatar === "") {
    curCharacter.avatar = "./assets/unknown.png";
  }
  if (curCharacter.resume === undefined || curCharacter.resume === "") {
    curCharacter.resume = "不详";
  }
  curCharacter.resume += "......";
  updatecurCharacter(curCharacter);
}

export async function initializeCard() {
  characterInfo = await d3.json("assets/information.json");
  updateCard("程頤");
}

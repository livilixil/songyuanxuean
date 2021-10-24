let relData;
let personData;
let schools = [];
let person2school = {};
let school2person = {};

export async function loadData() {
  relData = await d3.csv("./data/學案傳承關係.csv");
  personData = await d3.json("./data/result_definitive.json");
  schools = [
    ...relData.map((d) => d["案主名稱"]),
    ...relData.map((d) => d["前見名稱"]),
  ];
  schools = [...new Set(schools)];
  for (let i of relData) {
    let a, b;
    a = i["案主"];
    b = i["案主名稱"];
    if (a in person2school && person2school[a] !== b) {
      console.log(a, person2school[a], b);
    }
    person2school[a] = b;
    a = i["上位人物"];
    b = i["前見名稱"];
    if (a in person2school && person2school[a] !== b) {
      console.log(a, person2school[a], b);
    }
    person2school[a] = b;
  }
  for (let i in person2school) {
    let a, b;
    a = i;
    b = person2school[i];
    if (!(b in school2person)) {
      school2person[b] = [];
    }
    school2person[b].push(a);
  }
  //   console.log(person2school, school2person);
}

export function getRelData() {
  return relData;
}

export function getPersonData() {
  return personData;
}

export function getSchools() {
  return schools;
}

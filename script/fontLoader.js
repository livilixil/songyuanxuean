export async function loadFont() {
  let font = new FontFaceObserver("SONGTI");
  await font.load();
}

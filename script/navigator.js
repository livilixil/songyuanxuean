export function initializeNavigator() {
  $("#navigator-selector").css({ position: "relative" });
  //   $("#navigator-selector").draggable({
  //     containment: "#navigator-container",
  //     create: function (event, ui) {
  //       // console.log(this);
  //     },
  //     drag: function (event, ui) {
  //       // console.log(this);
  //     },
  //     start: function (event, ui) {
  //       // console.log(this);
  //     },
  //     stop: function (event, ui) {
  //       var curElem = $(this);
  //       var offsetPos = [curElem[0].offsetLeft, curElem[0].offsetTop];
  //       console.log(offsetPos);
  //     },
  //   });
}

export function updateNavigator(boxPos) {
  let selector = $("#navigator-selector");
  let container = $("#navigator-selector").parent();
  let cW = container.width();
  let cH = container.height();
  selector.width(Math.min(1, boxPos.width) * cW);
  selector.height(Math.min(1, boxPos.height) * cH);
  selector.css({
    left: Math.max(0, boxPos.x) * cW + "px",
    top: Math.max(0, boxPos.y) * cH + "px",
  });
}

function click(node) {
  try {
    node.dispatchEvent(new MouseEvent('click'));
  } catch (e) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(
      'click',
      true,
      true,
      window,
      0,
      0,
      0,
      80,
      20,
      false,
      false,
      false,
      false,
      0,
      null
    );
    node.dispatchEvent(evt);
  }
}

function downloadBlob(blob, name) {
  var a = document.createElement('a');
  a.download = name;
  a.rel = 'noopener'; // tabnabbing
  a.href = URL.createObjectURL(blob);
  setTimeout(function() {
    URL.revokeObjectURL(a.href);
  }, 4e4); // 40s
  setTimeout(function() {
    click(a);
  }, 0);
}

export default downloadBlob;

export async function render() {
  var view = await fetch("view/?file=index.html")
  var html = await view.text()
  
  var div = document.createElement("div")
  div.style = "position: absolute; width: 100%; height: 100%;"
  document.body.appendChild(div)

  addHtml(div, html)

  var style = await fetch("view/?file=style.css")
    .then(response => response.text());
  var style_tag = document.createElement("style");
  style_tag.innerText = style;
  document.body.appendChild(style_tag);
}

function addHtml(elm, html) {
  elm.innerHTML =  html;
  Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
    const newScript = document.createElement("script");
    newScript.async = false;
    Array.from(oldScript.attributes)
      .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}
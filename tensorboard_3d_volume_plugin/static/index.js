/*
This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.
This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with
this program. If not, see <http://www.gnu.org/licenses/>.
*/
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

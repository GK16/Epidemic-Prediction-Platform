export function loadjs(url, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (typeof callback != "undefined") {
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function () {
        callback();
      };
    }
  }
  script.src = url;
  document.body.appendChild(script);
}

export function getViewTtoken() {
  return new Promise((resolve, reject) => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST", "https://apigate.glodon.com/bimface/api/oauth2/token");
    //Authorization  Basic + 令牌
    xmlHttp.setRequestHeader(
      "Authorization",
      "Basic" + "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    );
    xmlHttp.send(null);
    xmlHttp.onreadystatechange = function () {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          var viewTokenInitial = JSON.parse(xmlHttp.response).data.token;
          var xmlHttp1 = new XMLHttpRequest();
          //模型ID
          let fileId = "2093888524003552";
          xmlHttp1.open(
            "GET",
            `https://apigate.glodon.com/bimface/api/view/token?fileId=${fileId}`
          );
          //Authorization bearer + 应用级Token
          xmlHttp1.setRequestHeader(
            "Authorization",
            "bearer " + "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          );
          xmlHttp1.send(null);
          xmlHttp1.onreadystatechange = function () {
            if (xmlHttp1.readyState == 4) {
              if (xmlHttp1.status == 200) {
                let viewToken = JSON.parse(xmlHttp1.response).data;
                resolve(viewToken);
              }
            }
          };
        }
      }
    };
  });
}

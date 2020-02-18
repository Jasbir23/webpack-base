function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getParameterByName(getUserURL, playerId) {
  var getUrl = `${getUserURL}/user/:${playerId}`;
  fetch(getUrl, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log("data: ", data);
    });
}


export {
  random,
  getParameterByName
}
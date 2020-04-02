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

function extractTouchPoint(e) {
  const targetValue = e && e.changedTouches && e.changedTouches[0];
  if (targetValue) {
    return {
      x: targetValue.clientX,
      y: targetValue.clientY
    };
  } else {
    return {
      x: 0,
      y: 0
    };
  }
}

export { random, getParameterByName, extractTouchPoint };

var tunes = document.getElementById('tunes');
var idArr = [];

// Orbit
var Orbit = function() {
  this.requests = [];
};

Orbit.prototype.get = function(url, cb) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.addEventListener('load', cb.bind(request));
  request.send();
  return request;
};

var orbit = new Orbit();


tunes.addEventListener('load', function () {
    var ids = this.response;

    ids.forEach(function(el) {
      idArr.push(el.id);
      console.log('idArr', idArr)
      // counter++;
      });

      });

var name = document.getElementById('name');
var tuneId = document.getElementById('tune-id');

 // {{#tunesSess}}
  name.addEventListener('click', function(e) {
    tuneId.innerHTML = input.value
  })

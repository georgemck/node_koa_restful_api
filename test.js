var chakram = require('chakram/lib/chakram.js'),
  expect = chakram.expect;

//var testURL = "https://midivr.com:4443/";
var testURL = "http://localhost:8080/";

describe("Endpoint assertions", function () {
  it("/ passes without any errors", function () {
    var response = chakram.get(testURL);
    expect(response).to.have.status(200);
    expect(response).to.have.header("content-type", "application/json; charset=utf-8");
    expect(response).not.to.be.encoded.with.gzip;
    expect(response).to.be.json;
    return chakram.wait();
  })
});

describe("retrieve assertions", function () {
  it("retrieve/ passes without any errors", function () {
    var response = chakram.get(testURL + "retrieve/");
    expect(response).to.have.status(200);
    expect(response).to.have.header("content-type", "application/json; charset=utf-8");
    expect(response).not.to.be.encoded.with.gzip;
    return chakram.wait();
  });
});

var postdata = {
  "create": {
    "type": "Feature",
    "name": "Emiline",
    "description": "Animated feature. Fearless optimist, the Princess Anna, sets off on an epic journey—teaming up with rugged mountain man, Kristoff, and his loyal reindeer Sven—to find her sister Elsa, whose icy powers have trapped the kingdom of Arendelle in eternal winter.",
    "theatricalReleaseDate": "11/27/2013",
    "duration": "102 min",
    "bonuses": [{
        "type": "bonus",
        "name": "Breaking the Ice",
        "description": "Get to know frozen from the snowy ground up as the filmmakers and songwriters discuss the story's roots and inspiration; the joys of animating olaf, the little snowman with the sunny personality; and the creation of those amazing songs.",
        "duration": "15 min"
      },
      {
        "type": "bonus",
        "name": "Deleted Scene: Meet Kristoff 2 - Introduction By Directors",
        "description": "Kristoff goes mountain climbing with a friend. With an introduction by directors chris buck and jennifer lee.",
        "duration": "13 min"
      }
    ]
  }
};

describe("create assertions", function () {
  it("create/ passes without any errors", function () {
    var response = chakram.post(testURL + "create/", undefined, postdata)
      .then(function (res) {
        expect(res).to.have.status(200);
        expect(res).to.have.header("content-type", "application/json; charset=utf-8");
        expect(res).not.to.be.encoded.with.gzip;
      });

    return chakram.wait();
  });
});

describe("update assertions", function () {
  it("update/Feature/Frozen/ passes without any errors", function () {
    var response = chakram.put(testURL + "update/Feature/Frozen/");
    expect(response).to.have.status(200);
    expect(response).to.have.header("content-type", "application/json; charset=utf-8");
    expect(response).not.to.be.encoded.with.gzip;
    return chakram.wait();
  });
});

describe("delete assertions", function () {
  it("delete/Feature/Frozen passes without any errors", function () {
    var response = chakram.delete(testURL + "delete/Feature/Frozen");
    expect(response).to.have.status(200);
    expect(response).to.have.header("content-type", "application/json; charset=utf-8");
    expect(response).not.to.be.encoded.with.gzip;
    return chakram.wait();
  });
});

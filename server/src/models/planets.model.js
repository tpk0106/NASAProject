const { parse } = require("csv-parse");
const fs = require("fs");

const path = require("path");

const planets = require("./planets.mongo");

//const habitablePlanets = [];

function isHabitablePlanets(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanets(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end", async () => {
        // console.log(
        //   habitablePlanets.map((planet) => {
        //     return planet["kepler_name"];
        //   })
        // );
        const countPlanetFound = (await getAllPlanets()).length;
        console.log(`${countPlanetFound} is habitable`);
        console.log("done");
        resolve();
      });
  });
}
async function getAllPlanets() {
  //return habitablePlanets;
  return await planets.find(
    {},
    {
      __v: 0,
      _id: 0,
    }
  );
}

async function savePlanet(planet) {
  // insert+update = upsert
  // save to mongo collection in the cloud
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.error(`could not save planet ${error} `);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};

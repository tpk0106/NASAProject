const { describe, test, before, after } = require("node:test");
const { deepStrictEqual } = require("node:assert");

const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

// below are for jest and jest is uninstalled to test node test
// but node test takes request as it is using .expect syntax same as jest
// desribe and test uses both same bbut with diufferent imports

const request = require("supertest");
const app = require("../../app");
const { loadPlanetsData } = require("../../models/planets.model");

describe("Launches API", () => {
  // connect to mongo prior to test
  before(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  after(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect(200)
        .expect("Content-Type", /json/);
      //expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /launches", () => {
    const completeLaunchData = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
      launchDate: "January 4, 2029",
    };

    const launchDataWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-62 f",
    };

    const launchDataWithInvalidDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-186 f",
      launchDate: "Hello",
    };
    test("It should respond with 201 success", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      // expect(responseDate).toBe(requestDate); // comment to test node test

      // node testing way
      deepStrictEqual(responseDate, requestDate);

      const { mission, rocket, target } = response.body;
      deepStrictEqual(
        {
          mission,
          rocket,
          target,
        },
        launchDataWithoutDate
      );
      // end of node testing

      // expect(response.body).toMatchObject(launchDataWithoutDate);
    });

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      // expect coming from jest
      // expect(response.body).toStrictEqual({
      //   error: "missing required launch property",
      // });

      // node testing way
      deepStrictEqual(response.body, {
        error: "missing required launch property",
      });
    });

    test("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      // expect(response.body).toStrictEqual({
      //   error: "Invalid launch date",
      // });

      // node testing way
      deepStrictEqual(response.body, {
        error: "Invalid launch date",
      });
    });
  });
});

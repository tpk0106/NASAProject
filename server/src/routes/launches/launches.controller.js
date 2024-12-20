const {
  addNewLaunch,
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
  scheduleNewLaunch,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  console.log(req.query);
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);

  if (launch.launchDate.toString() === "Invalid Date") {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  // or
  // workings at chrome console

  //  const myDate = new Date("2 December 2024");
  // isNaN(myDate)
  // false
  // myDate.valueOf()
  // 1733058000000
  // const notDate = new Date("Thusith");
  // isNaN(notDate)
  // true
  // notDate.valueOf()
  // NaN

  //launch.launchDate.isValueOf returns
  // if (isNaN(launch.launchDate)) {
  //   return req.status(400).json({
  //     error: "Invalid launch date",
  //   });
  // }

  //console.log("new launch : ", launch);
  //addNewLaunch(launch);
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);
  // console.log("launch Id : ", launchId);
  const existsLaunch = await existsLaunchWithId(launchId);
  if (!existsLaunch) {
    // launch does not exist
    return res.status(404).json({
      error: "Launch not found",
    });
  }

  // if launch does exits
  const aborted = await abortLaunchById(launchId);
  if (!aborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };

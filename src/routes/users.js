const express = require("express");
const router = express.Router();
const Handlers = require("../handlers/users/index");
const { UserServices } = require("../services/index");

const { catchErrors } = require("../util/index");

router.post(
  "/login/:platform",
  catchErrors(async (req, res) => {
    const token = req.body.access_token;
    const platform = req.params.platform;

    let user = null;

    if (platform === "groupme") {
      user = await Handlers.login(token);
    } else if (platform === "slack") {
      user = await Handlers.loginSlack(token);
    }

    res.json({
      user,
      token: user ? (user.isNew ? token : null) : null
    });
  })
);

router.get(
  "/:id",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const user = await UserServices.findUserById(id);

    res.json({ user });
  })
);

router.get(
  "/:id/overall",
  catchErrors(async (req, res) => {
    const { id } = req.params;

    const overall = await Handlers.getUserOverall(id);

    res.json({ overall });
  })
);

/* Update a user's movie prediction */
router.post(
  "/predict/:movieId",
  catchErrors(async (req, res) => {
    const { movieId } = req.params;
    const { userId, prediction } = req.body;

    const updatedUser = await Handlers.handleUserPrediction(
      userId,
      movieId,
      prediction
    );

    res.json({ user: updatedUser });
  })
);

module.exports = router;

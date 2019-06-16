const express = require("express");
const router = express.Router();
const Handlers = require("../handlers/users/index");
const { UserServices } = require("../services/index");

const { catchErrors } = require("../util/index");

/* With auth token */
router.post(
  "/login",
  catchErrors(async (req, res) => {
    const token = req.body.access_token;

    const user = await Handlers.login(token);

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

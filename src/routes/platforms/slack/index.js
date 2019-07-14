const express = require("express");
const router = express.Router();
const { WebClient } = require("@slack/web-api");
var prettyjson = require("prettyjson");

const { catchErrors } = require("../../../util/index");
const Handlers = require("../../../handlers/platforms/slack");
const GroupHandlers = require("../../../handlers/groups");
const UserHandlers = require("../../../handlers/users");
const { GroupServices, UserServices } = require("../../../services");
const { messages } = require("../../../util");
const { Slack } = require("../../../platforms");

router.post("/events", async (req, res) => {
  console.log("EVENT", req.body);
  if (req.body.event) {
    const eventType = req.body.event.type;
    const { event } = req.body;
    const client = new WebClient(process.env.SLACK_ACCESS_TOKEN);

    switch (eventType) {
      case "member_joined_channel":
        Handlers.userAddedToChannel(event.user, event.channel);
        res.send();
        return;
    }
  }

  res.json({ challenge: req.body.challenge });
});

router.post(
  "/create_channel",
  catchErrors(async (req, res) => {
    const { code } = req.body;
    const SlackAPI = Slack.createApi();
    const response = await SlackAPI.authenticate(code);
    // console.log("RESPONSE", response.data);
    const { access_token, bot, user_id } = response.data;

    const { user, group } = await Handlers.createChannel(code);

    res.json({ user, group });
  })
);

router.post(
  "/interactivity",
  catchErrors(async (req, res) => {
    const payload = JSON.parse(req.body.payload);
    res.send();
    // console.log(payload);
    const client = new WebClient(process.env.SLACK_ACCESS_TOKEN);
    if (payload.type === "dialog_submission") {
      if (payload.callback_id.includes("predict_movie")) {
        const movieId = payload.state;
        const user = await UserServices.findOrCreateSlackUser(payload.user);
        const { prediction } = payload.submission;
        const updatedUser = await UserHandlers.handleUserPrediction(
          user._id,
          movieId,
          Number(prediction.trim().replace("%", ""))
        );
      }
    }

    if (payload.type === "block_actions") {
      const action = payload.actions[0] ? payload.actions[0].value : null;
      if (action.includes("predict_movie")) {
        // console.log(payload);
        let blockWithMovieTitle = payload.message.blocks.find(
          block => block.text && block.text.text
        );
        let movieTitle = blockWithMovieTitle.text.text;
        movieTitle = movieTitle.split(":movie_camera: ")[1];
        const movieId = action.split("_")[2];

        const response = client.dialog.open({
          trigger_id: payload.trigger_id,
          dialog: {
            callback_id: "predict_movie",
            title:
              movieTitle.length > 24
                ? `${movieTitle.slice(0, 20)}...`
                : movieTitle,
            submit_label: "Save",
            notify_on_cancel: true,
            state: movieId,
            elements: [
              {
                label: `Prediction (%)`,
                hint: `Rotten Tomatoes Score for ${movieTitle} will be...`,
                name: "prediction",
                type: "text",
                subtype: "number",
                placeholder: "50"
              }
            ]
          }
        });
      }
    }
  })
);

router.post(
  "/commands",
  catchErrors(async (req, res) => {
    const { command } = req.body;

    switch (command) {
      case "/overall":
        const group = await GroupServices.findGroupBySlackId(
          req.body.channel_id
        );
        const overallRankings = await GroupHandlers.getOverallGroupRankings(
          group._id
        );

        const text = messages.overallRankings(overallRankings);
        console.log("GROUP", overallRankings);

        res.json({
          text,
          response_type: "in_channel"
        });
        break;
      case "/predict":
      case "/p":
        Handlers.handleUserPrediction(req.body);
        res.send("Saving prediction...");
        break;
      default:
        break;
    }
  })
);

module.exports = router;

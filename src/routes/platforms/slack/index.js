const express = require("express");
const router = express.Router();
const { WebClient } = require("@slack/web-api");
const crypto = require("crypto");
const qs = require("query-string");
const validateSlackRequest = require("../../../util/validateSlackRequest");

const { catchErrors } = require("../../../util/index");
const Handlers = require("../../../handlers/platforms/slack");
const GroupHandlers = require("../../../handlers/groups");
const UserHandlers = require("../../../handlers/users");
const {
  GroupServices,
  UserServices,
  MovieServices
} = require("../../../services");
const { messages } = require("../../../util");
const { Slack } = require("../../../platforms");
const Emitter = require("../../../EventEmitter");

router.post(
  "/events",
  catchErrors(async (req, res) => {
    if (req.body.event) {
      const eventType = req.body.event.type;
      const { event } = req.body;

      switch (eventType) {
        case "app_home_opened":
          res.send();
          const user = await UserServices.findUserBySlackId(event.user);
          if (user) {
            if (!user.events.slackAppHomeOpened) {
              Emitter.emit("slackAppHomeOpened", req.body);

              user.events = {
                ...user.events,
                ...{ slackAppHomeOpened: true }
              };
              await user.save();
            }
          }
          return;
        case "message":
          res.send();
          if (event.channel_type === "im") {
            if (
              !event.subtype &&
              event.username !== "MM Dev" &&
              event.username !== "Movie Medium" &&
              event.username !== "MM Staging"
            ) {
              await Handlers.saveFeedback(event, req.body.token);
            }
          }
          // else if (
          //   event.message &&
          //   event.message.text.includes("mentioned")
          // ) {
          //   console.log("IN CHANNEL FEEDBACK", event);
          // }
          return;
        case "member_joined_channel":
          console.log("ADDED TO CHANNEL");
          res.send();
          const group = await GroupServices.findGroupBySlackId(event.channel);
          if (!group) {
            return;
          }

          Handlers.userAddedToChannel(
            event.user,
            event.channel,
            group.bot.bot_access_token
          );
          res.send();
          return;
      }
    }

    res.json({ challenge: req.body.challenge });
  })
);

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
    const group = await GroupServices.findGroupBySlackId(payload.channel.id);
    const client = new WebClient(group.bot.bot_access_token);

    // user submits score
    if (payload.type === "dialog_submission") {
      if (payload.callback_id.includes("predict_movie")) {
        const movieId = payload.state;
        const currentUserInfo = await client.users.info({
          user: payload.user.id
        });

        const user = await UserServices.findOrCreateSlackUser(
          currentUserInfo.user,
          group._id
        );

        const { prediction } = payload.submission;
        let numPrediction = Number(prediction.trim().replace("%", ""));

        if (
          !Number.isInteger(numPrediction) ||
          numPrediction < 0 ||
          numPrediction > 100
        ) {
          Emitter.emit("slackUserMadeBadPrediction", user, group);
          return;
        }

        const updatedUser = await UserHandlers.handleUserPrediction(
          user._id,
          movieId,
          numPrediction
        );

        if (updatedUser) {
          Emitter.emit(
            "userPredictionOnSlackSaved",
            user,
            group,
            movieId,
            numPrediction
          );
        }
      }
    }

    if (payload.type === "block_actions") {
      const action = payload.actions[0] ? payload.actions[0].value : null;
      if (action.includes("predict_movie")) {
        // console.log(payload);
        const movieId = action.split("_")[2];
        const movie = await MovieServices.findMovieById(movieId);

        if (!movie.isClosed) {
          client.dialog.open({
            trigger_id: payload.trigger_id,
            dialog: {
              callback_id: "predict_movie",
              title:
                movie.title.length > 24
                  ? `${movie.title.slice(0, 20)}...`
                  : movie.title,
              submit_label: "Save",
              notify_on_cancel: true,
              state: movieId,
              elements: [
                {
                  label: `Prediction (%)`,
                  hint: `Rotten Tomatoes Score for ${movie.title} will be...`,
                  name: "prediction",
                  type: "text",
                  subtype: "number",
                  placeholder: "50"
                }
              ]
            }
          });
        } else {
          Emitter.emit("userPredictedClosedMovie", user, group);
        }
      }
    }
  })
);

router.post(
  "/commands",
  catchErrors(async (req, res) => {
    console.log("REQ", req.headers, req.body);

    let timestamp = req.headers["x-slack-request-timestamp"];
    const time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - timestamp) > 300) {
      return res.status(400).send("Ignore this request.");
    }

    if (!validateSlackRequest(process.env.SLACK_SIGNING_SECRET, req)) {
      return res.status(400).send("Verification failed");
    }
    const { command } = req.body;

    switch (command) {
      case "/overall":
        const group = await GroupServices.findGroupBySlackId(
          req.body.channel_id
        );
        const overallRankings = await GroupHandlers.getOverallGroupRankings(
          group._id
        );

        const text = messages.overallRankings(overallRankings, "slack");

        res.status(200).json({
          text,
          response_type: "in_channel"
        });
        break;
      case "/predict":
        res.send();
        Handlers.handleUserPrediction(req.body);

        break;
      case "/season":
        res.send();
        Handlers.sendSeasonRankings(req.body.channel_id);
        break;
      default:
        break;
    }

    res.send();
  })
);

module.exports = router;

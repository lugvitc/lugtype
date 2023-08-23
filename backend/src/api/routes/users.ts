import joi from "joi";
import { authenticateRequest } from "../../middlewares/auth";
import { Router } from "express";
import * as UserController from "../controllers/user";
import {
  asyncHandler,
  validateRequest,
  validateConfiguration,
  checkUserPermissions,
} from "../../middlewares/api-utils";
import * as RateLimit from "../../middlewares/rate-limit";
import { withApeRateLimiter } from "../../middlewares/ape-rate-limit";
import { containsProfanity, isUsernameValid } from "../../utils/validation";
import filterSchema from "../schemas/filter-schema";

const router = Router();

const tagNameValidation = joi
  .string()
  .required()
  .regex(/^[0-9a-zA-Z_.-]+$/)
  .max(16)
  .messages({
    "string.pattern.base":
      "Tag name invalid. Name cannot contain special characters or more than 16 characters. Can include _ . and -",
    "string.max": "Tag name exceeds maximum of 16 characters",
  });

const customThemeNameValidation = joi
  .string()
  .max(16)
  .regex(/^[0-9a-zA-Z_.-]+$/)
  .required()
  .messages({
    "string.max": "The name must not exceed 16 characters",
    "string.pattern.base":
      "Name cannot contain special characters. Can include _ . and -",
  });

const customThemeColorsValidation = joi
  .array()
  .items(
    joi
      .string()
      .length(7)
      .regex(/^#[0-9a-fA-F]{6}$/)
      .messages({
        "string.pattern.base": "The colors must be valid hexadecimal",
        "string.length": "The colors must be 7 characters long",
      })
  )
  .length(10)
  .required()
  .messages({
    "array.length": "The colors array must have 10 colors",
  });

const customThemeIdValidation = joi
  .string()
  .length(24)
  .regex(/^[0-9a-fA-F]+$/)
  .required()
  .messages({
    "string.length": "The themeId must be 24 characters long",
    "string.pattern.base": "The themeId must be valid hexadecimal string",
  });

const usernameValidation = joi
  .string()
  .required()
  .custom((value, helpers) => {
    if (containsProfanity(value)) {
      return helpers.error("string.profanity");
    }

    if (!isUsernameValid(value)) {
      return helpers.error("string.pattern.base");
    }

    return value;
  })
  .messages({
    "string.profanity":
      "The username contains profanity. If you believe this is a mistake, please contact us ",
    "string.pattern.base":
      "Username invalid. Name cannot use special characters or contain more than 16 characters. Can include _ . and - ",
  });

const languageSchema = joi.string().min(1).required();
const quoteIdSchema = joi.string().min(1).max(5).regex(/\d+/).required();

router.get(
  "/",
  authenticateRequest(),
  RateLimit.userGet,
  asyncHandler(UserController.getUser)
);

router.post(
  "/signup",
  validateConfiguration({
    criteria: (configuration) => {
      return configuration.users.signUp;
    },
    invalidMessage: "Sign up is temporarily disabled",
  }),
  authenticateRequest(),
  RateLimit.userSignup,
  validateRequest({
    body: {
      email: joi.string().email(),
      name: usernameValidation,
      uid: joi.string(),
      captcha: joi.string().required(),
    },
  }),
  asyncHandler(UserController.createNewUser)
);

router.get(
  "/checkName/:name",
  authenticateRequest({
    isPublic: true,
  }),
  RateLimit.userCheckName,
  validateRequest({
    params: {
      name: usernameValidation,
    },
  }),
  asyncHandler(UserController.checkName)
);

router.delete(
  "/",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userDelete,
  asyncHandler(UserController.deleteUser)
);

router.patch(
  "/reset",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userReset,
  asyncHandler(UserController.resetUser)
);

router.patch(
  "/name",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userUpdateName,
  validateRequest({
    body: {
      name: usernameValidation,
    },
  }),
  asyncHandler(UserController.updateName)
);

router.patch(
  "/leaderboardMemory",
  authenticateRequest(),
  RateLimit.userUpdateLBMemory,
  validateRequest({
    body: {
      mode: joi
        .string()
        .valid("time", "words", "quote", "zen", "custom")
        .required(),
      mode2: joi.string().required(),
      language: joi.string().required(),
      rank: joi.number().required(),
    },
  }),
  asyncHandler(UserController.updateLbMemory)
);

router.patch(
  "/email",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userUpdateEmail,
  validateRequest({
    body: {
      newEmail: joi.string().email().required(),
      previousEmail: joi.string().email().required(),
    },
  }),
  asyncHandler(UserController.updateEmail)
);

router.delete(
  "/personalBests",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userClearPB,
  asyncHandler(UserController.clearPb)
);

router.post(
  "/optOutOfLeaderboards",
  authenticateRequest({
    requireFreshToken: true,
  }),
  RateLimit.userOptOutOfLeaderboards,
  asyncHandler(UserController.optOutOfLeaderboards)
);

const requireFilterPresetsEnabled = validateConfiguration({
  criteria: (configuration) => {
    return configuration.results.filterPresets.enabled;
  },
  invalidMessage: "Result filter presets are not available at this time.",
});

router.post(
  "/resultFilterPresets",
  requireFilterPresetsEnabled,
  authenticateRequest(),
  RateLimit.userCustomFilterAdd,
  validateRequest({
    body: filterSchema,
  }),
  asyncHandler(UserController.addResultFilterPreset)
);

router.delete(
  "/resultFilterPresets/:presetId",
  requireFilterPresetsEnabled,
  authenticateRequest(),
  RateLimit.userCustomFilterRemove,
  validateRequest({
    params: {
      presetId: joi.string().required(),
    },
  }),
  asyncHandler(UserController.removeResultFilterPreset)
);

router.get(
  "/tags",
  authenticateRequest(),
  RateLimit.userTagsGet,
  asyncHandler(UserController.getTags)
);

router.post(
  "/tags",
  authenticateRequest(),
  RateLimit.userTagsAdd,
  validateRequest({
    body: {
      tagName: tagNameValidation,
    },
  }),
  asyncHandler(UserController.addTag)
);

router.patch(
  "/tags",
  authenticateRequest(),
  RateLimit.userTagsEdit,
  validateRequest({
    body: {
      tagId: joi
        .string()
        .regex(/^[a-f\d]{24}$/i)
        .required(),
      newName: tagNameValidation,
    },
  }),
  asyncHandler(UserController.editTag)
);

router.delete(
  "/tags/:tagId",
  authenticateRequest(),
  RateLimit.userTagsRemove,
  validateRequest({
    params: {
      tagId: joi
        .string()
        .regex(/^[a-f\d]{24}$/i)
        .required(),
    },
  }),
  asyncHandler(UserController.removeTag)
);

router.delete(
  "/tags/:tagId/personalBest",
  authenticateRequest(),
  RateLimit.userTagsClearPB,
  validateRequest({
    params: {
      tagId: joi
        .string()
        .regex(/^[a-f\d]{24}$/i)
        .required(),
    },
  }),
  asyncHandler(UserController.clearTagPb)
);

router.get(
  "/customThemes",
  authenticateRequest(),
  RateLimit.userCustomThemeGet,
  asyncHandler(UserController.getCustomThemes)
);

router.post(
  "/customThemes",
  authenticateRequest(),
  RateLimit.userCustomThemeAdd,
  validateRequest({
    body: {
      name: customThemeNameValidation,
      colors: customThemeColorsValidation,
    },
  }),
  asyncHandler(UserController.addCustomTheme)
);

router.delete(
  "/customThemes",
  authenticateRequest(),
  RateLimit.userCustomThemeRemove,
  validateRequest({
    body: {
      themeId: customThemeIdValidation,
    },
  }),
  asyncHandler(UserController.removeCustomTheme)
);

router.patch(
  "/customThemes",
  authenticateRequest(),
  RateLimit.userCustomThemeEdit,
  validateRequest({
    body: {
      themeId: customThemeIdValidation,
      theme: {
        name: customThemeNameValidation,
        colors: customThemeColorsValidation,
      },
    },
  }),
  asyncHandler(UserController.editCustomTheme)
);

const requireDiscordIntegrationEnabled = validateConfiguration({
  criteria: (configuration) => {
    return configuration.users.discordIntegration.enabled;
  },
  invalidMessage: "Discord integration is not available at this time",
});

router.get(
  "/discord/oauth",
  requireDiscordIntegrationEnabled,
  authenticateRequest(),
  RateLimit.userDiscordLink,
  asyncHandler(UserController.getOauthLink)
);

router.post(
  "/discord/link",
  requireDiscordIntegrationEnabled,
  authenticateRequest(),
  RateLimit.userDiscordLink,
  validateRequest({
    body: {
      tokenType: joi.string().required(),
      accessToken: joi.string().required(),
      state: joi.string().length(20).required(),
    },
  }),
  asyncHandler(UserController.linkDiscord)
);

router.post(
  "/discord/unlink",
  authenticateRequest(),
  RateLimit.userDiscordUnlink,
  asyncHandler(UserController.unlinkDiscord)
);

router.get(
  "/personalBests",
  authenticateRequest({
    acceptApeKeys: true,
  }),
  withApeRateLimiter(RateLimit.userGet),
  validateRequest({
    query: {
      mode: joi.string().required(),
      mode2: joi.string(),
    },
  }),
  asyncHandler(UserController.getPersonalBests)
);

router.get(
  "/stats",
  authenticateRequest({
    acceptApeKeys: true,
  }),
  withApeRateLimiter(RateLimit.userGet),
  asyncHandler(UserController.getStats)
);

router.post(
  "/setStreakHourOffset",
  authenticateRequest(),
  RateLimit.setStreakHourOffset,
  validateRequest({
    body: {
      hourOffset: joi.number().min(-11).max(12).required(),
    },
  }),
  asyncHandler(UserController.setStreakHourOffset)
);

router.get(
  "/favoriteQuotes",
  authenticateRequest(),
  RateLimit.quoteFavoriteGet,
  asyncHandler(UserController.getFavoriteQuotes)
);

router.post(
  "/favoriteQuotes",
  authenticateRequest(),
  RateLimit.quoteFavoritePost,
  validateRequest({
    body: {
      language: languageSchema,
      quoteId: quoteIdSchema,
    },
  }),
  asyncHandler(UserController.addFavoriteQuote)
);

router.delete(
  "/favoriteQuotes",
  authenticateRequest(),
  RateLimit.quoteFavoriteDelete,
  validateRequest({
    body: {
      language: languageSchema,
      quoteId: quoteIdSchema,
    },
  }),
  asyncHandler(UserController.removeFavoriteQuote)
);

const requireProfilesEnabled = validateConfiguration({
  criteria: (configuration) => {
    return configuration.users.profiles.enabled;
  },
  invalidMessage: "Profiles are not available at this time",
});

router.get(
  "/:uidOrName/profile",
  requireProfilesEnabled,
  authenticateRequest({
    isPublic: true,
    acceptApeKeys: true,
  }),
  withApeRateLimiter(RateLimit.userProfileGet),
  validateRequest({
    params: {
      uidOrName: joi.string().required(),
    },
    query: {
      isUid: joi.string().allow(""),
    },
  }),
  asyncHandler(UserController.getProfile)
);

const profileDetailsBase = joi
  .string()
  .allow("")
  .custom((value, helpers) => {
    if (containsProfanity(value)) {
      return helpers.error("string.profanity");
    }

    return value;
  })
  .messages({
    "string.profanity": "Profanity detected. Please remove it.",
  });

router.patch(
  "/profile",
  requireProfilesEnabled,
  authenticateRequest(),
  RateLimit.userProfileUpdate,
  validateRequest({
    body: {
      bio: profileDetailsBase.max(250),
      keyboard: profileDetailsBase.max(75),
      selectedBadgeId: joi.number(),
      socialProfiles: joi.object({
        twitter: profileDetailsBase.regex(/^[0-9a-zA-Z_.-]+$/).max(20),
        github: profileDetailsBase.regex(/^[0-9a-zA-Z_.-]+$/).max(39),
        website: profileDetailsBase
          .uri({
            scheme: "https",
            domain: {
              tlds: {
                allow: true,
              },
            },
          })
          .max(200),
      }),
    },
  }),
  asyncHandler(UserController.updateProfile)
);

const mailIdSchema = joi.array().items(joi.string().guid()).min(1).default([]);

const requireInboxEnabled = validateConfiguration({
  criteria: (configuration) => {
    return configuration.users.inbox.enabled;
  },
  invalidMessage: "Your inbox is not available at this time.",
});

router.get(
  "/inbox",
  requireInboxEnabled,
  authenticateRequest(),
  RateLimit.userMailGet,
  asyncHandler(UserController.getInbox)
);

router.patch(
  "/inbox",
  requireInboxEnabled,
  authenticateRequest(),
  RateLimit.userMailUpdate,
  validateRequest({
    body: {
      mailIdsToDelete: mailIdSchema,
      mailIdsToMarkRead: mailIdSchema,
    },
  }),
  asyncHandler(UserController.updateInbox)
);

const withCustomMessages = joi.string().messages({
  "string.pattern.base": "Invalid parameter format",
});

router.post(
  "/report",
  validateConfiguration({
    criteria: (configuration) => {
      return configuration.quotes.reporting.enabled;
    },
    invalidMessage: "User reporting is unavailable.",
  }),
  authenticateRequest(),
  RateLimit.quoteReportSubmit,
  validateRequest({
    body: {
      uid: withCustomMessages.regex(/^\w+$/).required(),
      reason: joi
        .string()
        .valid(
          "Inappropriate name",
          "Inappropriate bio",
          "Inappropriate social links",
          "Suspected cheating"
        )
        .required(),
      comment: withCustomMessages
        .allow("")
        .regex(/^([.]|[^/<>])+$/)
        .max(250)
        .required(),
      captcha: withCustomMessages.regex(/[\w-_]+/).required(),
    },
  }),
  checkUserPermissions({
    criteria: (user) => {
      return user.canReport !== false;
    },
  }),
  asyncHandler(UserController.reportUser)
);

router.get(
  "/verificationEmail",
  authenticateRequest({
    noCache: true,
  }),
  RateLimit.userRequestVerificationEmail,
  asyncHandler(UserController.sendVerificationEmail)
);

router.post(
  "/forgotPasswordEmail",
  RateLimit.userForgotPasswordEmail,
  validateRequest({
    body: {
      email: joi.string().email().required(),
    },
  }),
  asyncHandler(UserController.sendForgotPasswordEmail)
);

export default router;

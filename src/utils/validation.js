import Joi from 'joi';

const feedbackSchema = Joi.object({
analysis: Joi.string().required(),
correct: Joi.boolean().required(),
timestamp: Joi.date().iso().required(),
});

export function validateFeedback(feedback) {
return feedbackSchema.validate(feedback);
}
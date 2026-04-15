import Joi from 'joi'


const userSignupSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  password: Joi.string().min(4).required(),
  email: Joi.string().email().required(),
})

const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

export {userLoginSchema, userSignupSchema, }
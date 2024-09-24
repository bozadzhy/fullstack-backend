import { body } from "express-validator";

export const loginValidation = [
  body("email", "неверный формат почты").isEmail(),
  body("password", "пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
];
export const registValidation = [
  body("email", "неверный формат почты").isEmail(),
  body("password", "пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
  body("fullName", "укажите имя").isLength({ min: 3 }),
  body("avatarUrl", "неверная ссылка на аватарку").optional().isURL(),
];

export const postCreateValidation = [
  body("title", "введите заголовок статьи").isLength({ min: 5 }).isString(),
  body("text", "введите текст статьи").isLength({ min: 5 }).isString(),
  body("tags", "не верный формат тегов").optional().isString(),
  body("imageUrl", "неверная ссылка на изображение").optional().isString(),
];

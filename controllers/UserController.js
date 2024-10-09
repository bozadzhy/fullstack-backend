import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    //соль- алгоритм шифрования
    const solt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, solt);

    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatar,
      passwordHash: hash,
    });
    // сохраняем юзера в монгоДБ
    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    // деструктуризация - вытаскиваем из юзера пароль (он не нужен)) а всё остальное в userData  и его в кидаем в ответ
    const { passwordHash, ...userData } = user._doc;

    // возвращаем инфо о пользователе
    res.json({
      ...userData,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: " не удалось зарегистрировать юзера",
    });
  }
};

export const login = async (req, res) => {
  try {
    // находим юзера по емайлу
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: "такого юзера нет",
      });
    }
    // сравниваем его пароль с зашифрованным
    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPassword) {
      return res.status(404).json({
        message: "неверный логин или пароль",
      });
    }
    // если всё ок. создаем новый токен
    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secret123",
      {
        expiresIn: "30d",
      }
    );
    // деструктуризация - вытаскиваем из юзера пароль (он не нужен)) а всё остальное в userData  и его в кидаем в ответ
    const { passwordHash, ...userData } = user._doc;

    // возвращаем инфо о пользователе
    res.json({
      ...userData,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: " не удалось авторизоваться",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    // Проверка на наличие идентификатора пользователя
    if (!req.userId) {
      return res.status(400).json({
        message: "Некорректный токен",
      });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.error("Ошибка при получении пользователя:", err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find();
    if (!users) {
      return res.status(404).json({
        message: "Пользователи не найдени",
      });
    }
    res.json(users);
  } catch (err) {
    console.error("Ошибка при получении пользователей:", err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

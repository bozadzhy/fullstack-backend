import PostModel from "../models/Post.js";

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate("user").exec(); // обьединяем пости и создателя поста с помощью populate().exec()
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось получить статьи",
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(10).exec(); // обьединяем пости и создателя поста с помощью populate().exec()
    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось получить теги",
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id; // достаем динамический параметр id из запроса

    const updatedPost = await PostModel.findOneAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 }, // то что ми будем оновлять (просмотри)
      },
      {
        returnDocument: "after", // вернуть обновленній документ
      }
    ).populate("user");
    if (!updatedPost) {
      return res.status(404).json({
        message: "статья не найдена",
      });
    }
    res.json(updatedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "не удалось получить статью",
    });
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id; // достаем динамический параметр id из запроса
    const deletedPost = await PostModel.findOneAndDelete({
      _id: postId,
    });
    if (!deletedPost) {
      return res.status(404).json({
        message: "статья не найдена",
      });
    }
    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "не удалось удалить статью",
    });
  }
};

export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.trim().split(','),
      user: req.userId,
    });
    const post = await doc.save();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось создать статью",
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    await PostModel.updateOne(
      {
        _id: postId,
      },  
      {
        title: req.body.title,
        text: req.body.text,
        imageUrl: req.body.imageUrl,
        tags: req.body.tags.trim().split(','),
        user: req.userId,
      }
    );
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "не удалось обновить статью",
    });
  }
};

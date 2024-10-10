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
    const posts = await PostModel.find().limit(5).exec(); // обьединяем пости и создателя поста с помощью populate().exec()
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
      tags: req.body.tags.split(",").map((str) => str.replace(/\s+/g, "")),
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

export const createComments = async (req, res) => {
  try {
    const { id } = req.params; // ID поста
    const { body } = req.body; // Текст комментария
    const userId = req.userId; // ID пользователя из токена

    if (!userId) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    const post = await PostModel.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!body) {
      return res.status(400).json({ message: "Comment body is required" });
    }

    // Добавление нового комментария
    post.comments.push({ user: userId, body });
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res
      .status(500)
      .json({ message: "Error adding comment", error: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate(
      "comments.user"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("Error fetching post:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching post", error: err.message });
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
        tags: req.body.tags.split(",").map((str) => str.replace(/\s+/g, "")),
        user: req.userId,
        comments: req.body.comments,
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

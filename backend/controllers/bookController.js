const { Book } = require("../models");

exports.getAllBooks = async (req, res) => {
  const books = await Book.findAll();
  res.json(books);
};

exports.getBookById = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
};

exports.createBook = async (req, res) => {
  const { title, author, stock } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: "Title & Author required" });
  }
  const book = await Book.create({ title, author, stock });
  res.json(book);
};

exports.updateBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  await book.update(req.body);
  res.json(book);
};

exports.deleteBook = async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  await book.destroy();
  res.json({ message: "Book deleted" });
};

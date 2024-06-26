const { nanoid } = require('nanoid');
const books = require('../data/books');

const addBook = (req, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
  } = req.payload;

  const bookId = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const yearNum = parseInt(year, 10);
  const pageCountNum = parseInt(pageCount, 10);
  const readPageNum = parseInt(readPage, 10);

  const isReading = readPageNum !== 0;
  const isFinished = pageCountNum === readPageNum;

  try {
    if (name === undefined || name === '') {
      const res = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. Mohon isi nama buku',
      })
        .code(400);
      return res;
    }
    if (readPage > pageCount) {
      const res = h.response({
        status: 'fail',
        message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
      })
        .code(400);
      return res;
    }

    const newBook = {
      bookId,
      name,
      year: yearNum,
      author,
      summary,
      publisher,
      pageCount: pageCountNum,
      readPage: readPageNum,
      finished: isFinished,
      reading: isReading,
      insertedAt,
      updatedAt,
    };

    books.push(newBook);

    const isSuccess = books.filter((book) => book.bookId === bookId).length > 0;
    
    if (isSuccess) {
      const res = h.response({
        status: 'success',
        message: 'Buku berhasil ditambahkan',
        data: {
          ...newBook,
        },
      })
        .header('Access-Control-Allow-Origin', '*')
        .code(201);
      return res;
    }
  } catch (error) {
    console.error('Error adding book :', error);
    return h.response({ status: 'fail', message: 'Failed to add the book' }).code(500);
  }
};

const getAllBooks = (req, h) => {
  let {
    name = '',
    page = 0,
    limit = 0,
    finished,
    reading,
  } = req.query;
  try {
    let filteredBooks = books;
    const pageNum = parseInt(page, 10) || 1;
    let limitNum = parseInt(limit, 10) || 2;
    let startIndex = (pageNum - 1) * limitNum;

    if ((reading === '1' || finished === '1') && limitNum === 0) {
      limitNum = 3;
    } else if (finished === '0' && limitNum === 0) {
      limitNum = 3;
    } else if (finished === '1') {
      limitNum = 1;
    } else if (finished === '0') {
      limitNum = 3;
    }

    if (name !== '') {
      const searchName = name.toLowerCase();
      filteredBooks = filteredBooks.filter((book) => book.name?.toLowerCase().includes(searchName));
    }
    if (reading !== undefined) {
      filteredBooks = filteredBooks.filter((book) => book.reading === Boolean(Number(reading)));
    }
    if (finished !== undefined) {
      filteredBooks = filteredBooks.filter((book) => book.finished === Boolean(Number(finished)));
    }

    const bookPagination = filteredBooks.slice(startIndex, startIndex + limitNum);

    const bookProperties = bookPagination.map((filteredBooks) => ({
      id: filteredBooks.bookId,
      name: filteredBooks.name,
      publisher: filteredBooks.publisher,
    }));

    const responseData = {
      status: 'success',
      data: {
        books: bookProperties,
      },
    };

    const res = h.response(responseData).code(200);
    return res;
  } catch (error) {
    console.error('Error getting books data:', error.message);
    return h.response({ status: 'fail', message: 'Failed to fetch books data' }).code(503);
  }
};

const getBookDetail = (req, h) => {
  const { id } = req.params;
  try {
    const book = books.filter((a) => a.bookId === id)[0];

    if (!book) {
      const res = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      })
        .code(404);
      return res;
    }

    const res = h.response({
      status: 'success',
      data: {
        book: {
          id: book.bookId,
          name: book.name,
          year: book.year,
          author: book.author,
          summary: book.summary,
          publisher: book.publisher,
          pageCount: book.pageCount,
          readPage: book.readPage,
          finished: book.pageCount === book.readPage,
          reading: book.readPage === 0,
          insertedAt: book.insertedAt,
          updatedAt: book.updatedAt,
        },
      },
    })
      .code(200);
    return res;
  } catch (error) {
    console.error('Error getting book detail :', error);
    return h.response({ status: 'fail', message: `Failed to find book with id ${id}` }).code(500);
  }
};

const updateBook = (req, h) => {
  const { id } = req.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
  } = req.payload;
  const updateAt = new Date().toISOString();

  const yearNum = parseInt(year, 10);
  const pageCountNum = parseInt(pageCount, 10);
  const readPageNum = parseInt(readPage, 10);

  const isReading = readPageNum !== 0;
  const isFinished = pageCountNum === readPageNum;
  try {
    const index = books.findIndex((book) => book.bookId === id);
    if (!name) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
        .code(400);
    }
    if (readPage > pageCount) {
      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
        .code(400);
    }

    if (index !== -1) {
      books[index] = {
        ...books[index],
        name,
        year: yearNum,
        author,
        summary,
        publisher,
        pageCount: pageCountNum,
        readPage: readPageNum,
        finished: isFinished,
        reading: isReading,
        updateAt,
      };
      const res = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui',
      })
        .code(200);
      return res;
    }
    const res = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    })
      .code(404);
    return res;
  } catch (error) {
    console.error('Error updating books :', error);
    return h.response({
      status: 'fail',
      message: 'Failed updating book',
    })
      .code(500);
  }
};

const deleteBook = (req, h) => {
  const { id } = req.params;
  try {
    const index = books.findIndex((book) => book.bookId === id);

    if (index !== -1) {
      books.splice(index, 1);
      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      })
        .code(200);
    }
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    })
      .code(404);
  } catch (error) {
    console.error('Error deleting book :', error);
    return h.response({
      status: 'fail',
      message: 'Delete failed',
    }).code(500);
  }
};

module.exports = {
  addBook, getAllBooks, getBookDetail, updateBook, deleteBook,
};

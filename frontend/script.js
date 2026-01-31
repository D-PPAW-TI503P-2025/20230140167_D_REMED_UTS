// ===================
// GLOBAL VARIABLES
// ===================
const API = "http://localhost:3001/api";
let allBooks = [];
let filteredBooks = [];

// ===================
// UTILITY FUNCTIONS
// ===================
function showLoadingState(elementId, show = true) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle('d-none', !show);
  }
}

function showAlert(message, type = 'info', containerId = 'result') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    // Auto-hide after 5 seconds
    setTimeout(() => {
      const alert = container.querySelector('.alert');
      if (alert) {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
      }
    }, 5000);
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStockStatus(stock) {
  if (stock === 0) return { class: 'stock-empty', text: 'Out of Stock', badgeClass: 'status-out-of-stock' };
  if (stock <= 2) return { class: 'stock-low', text: 'Low Stock', badgeClass: 'status-low-stock' };
  return { class: 'stock-high', text: 'Available', badgeClass: 'status-available' };
}

// ===================
// LOAD BOOKS (INDEX PAGE)
// ===================
function loadBooks() {
  showLoadingState('loadingState', true);
  showLoadingState('emptyState', false);

  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      allBooks = data;
      filteredBooks = [...allBooks];

      // Update statistics
      updateStatistics(data);

      // Display books
      displayBooks(filteredBooks);

      showLoadingState('loadingState', false);

      // Debug: Log statistics update
      console.log('Books loaded:', data.length, 'Available:', data.filter(book => book.stock > 0).length);
    })
    .catch(error => {
      console.error('Error loading books:', error);
      showLoadingState('loadingState', false);
      showAlert('Failed to load books. Please check your connection and try again.', 'danger');
    });
}

function updateStatistics(books) {
  const totalBooks = document.getElementById("totalBooks");
  const availableBooks = document.getElementById("availableBooks");
  const adminTotalBooks = document.getElementById("adminTotalBooks");
  const adminAvailableBooks = document.getElementById("adminAvailableBooks");
  const adminLowStockBooks = document.getElementById("adminLowStockBooks");

  if (totalBooks) totalBooks.textContent = books.length;
  if (availableBooks) availableBooks.textContent = books.filter(book => book.stock > 0).length;
  if (adminTotalBooks) adminTotalBooks.textContent = books.length;
  if (adminAvailableBooks) adminAvailableBooks.textContent = books.filter(book => book.stock > 0).length;
  if (adminLowStockBooks) adminLowStockBooks.textContent = books.filter(book => book.stock > 0 && book.stock <= 2).length;
}

function displayBooks(books) {
  const list = document.getElementById("bookList");
  if (!list) return;

  if (books.length === 0) {
    showLoadingState('emptyState', true);
    list.innerHTML = '';
    return;
  }

  showLoadingState('emptyState', false);

  list.innerHTML = books.map(book => {
    const stockStatus = getStockStatus(book.stock);

    return `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="book-card fade-in">
          <div class="book-header">
            <h5 class="card-title mb-0">
              <i class="fas fa-book me-2"></i>${book.title}
            </h5>
            <span class="stock-badge ${stockStatus.class}">${stockStatus.text}</span>
          </div>
          <div class="book-body">
            <h6 class="card-subtitle mb-2 text-muted">
              <i class="fas fa-user me-1"></i>${book.author}
            </h6>
            <p class="card-text">
              <strong>Book ID:</strong> ${book.id}<br>
              <strong>Stock:</strong> ${book.stock} copies
            </p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="fas fa-calendar me-1"></i>Added ${formatDate(book.createdAt)}
              </small>
              ${book.stock > 0 ?
                `<button class="btn btn-custom btn-sm" onclick="borrowBook(${book.id})">
                  <i class="fas fa-hand-holding me-1"></i>Borrow
                </button>` :
                `<button class="btn btn-secondary btn-sm" disabled>
                  <i class="fas fa-times me-1"></i>Unavailable
                </button>`
              }
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ===================
// SEARCH AND FILTER FUNCTIONS
// ===================
function setupSearchAndFilter() {
  const searchInput = document.getElementById('searchInput');
  const filterButtons = document.querySelectorAll('.filter-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterBooks(e.target.value, getActiveFilter());
    });
  }

  if (filterButtons) {
    filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        filterBooks(searchInput ? searchInput.value : '', e.target.dataset.filter);
      });
    });
  }
}

function getActiveFilter() {
  const activeButton = document.querySelector('.filter-btn.active');
  return activeButton ? activeButton.dataset.filter : 'all';
}

function filterBooks(searchTerm, filterType) {
  let filtered = [...allBooks];

  // Apply search filter
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(book =>
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  }

  // Apply category filter
  switch (filterType) {
    case 'available':
      filtered = filtered.filter(book => book.stock > 0);
      break;
    case 'low-stock':
      filtered = filtered.filter(book => book.stock > 0 && book.stock <= 2);
      break;
    case 'all':
    default:
      // No additional filtering
      break;
  }

  filteredBooks = filtered;
  displayBooks(filteredBooks);
}

// ===================
// INITIALIZE INDEX PAGE
// ===================
if (typeof document !== 'undefined' && document.getElementById("bookList")) {
  // Load books when page loads
  loadBooks();

  // Setup search and filter after books are loaded
  setTimeout(setupSearchAndFilter, 1000);
}

// ===================
// ADMIN: ADD BOOK
// ===================
function addBook() {
  if (typeof fetch === 'undefined') return;
  const title = document.getElementById("title");
  const author = document.getElementById("author");
  const stock = document.getElementById("stock");
  const result = document.getElementById("result");

  if (!title || !author || !stock || !result) return;

  fetch(`${API}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "admin"
    },
    body: JSON.stringify({
      title: title.value,
      author: author.value,
      stock: parseInt(stock.value)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      result.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
    } else {
      result.innerHTML = `<div class="alert alert-success">Buku berhasil ditambahkan!</div>`;
      // Clear form
      title.value = '';
      author.value = '';
      stock.value = '';
      // Refresh book list if on admin page
      if (typeof loadBooks === 'function') loadBooks();
    }
  })
  .catch(error => {
    result.innerHTML = `<div class="alert alert-danger">Gagal menambah buku: ${error.message}</div>`;
  });
}

// ===================
// USER: BORROW BOOK (Multiple implementations)
// ===================

// For homepage borrow buttons
function borrowBook(bookId) {
  if (typeof navigator === 'undefined' || typeof fetch === 'undefined') return;

  if (bookId) {
    // Direct borrow from homepage
    navigator.geolocation.getCurrentPosition(position => {
      fetch(`${API}/borrow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-role": "user",
          "x-user-id": "1"
        },
        body: JSON.stringify({
          bookId: bookId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Peminjaman berhasil!");
        location.reload(); // Refresh to update stock
      })
      .catch(error => {
        alert("Error borrowing book: " + error.message);
      });
    });
    return;
  }

  // Original simple borrow logic for basic user.html
  const bookIdInput = document.getElementById("bookId");
  const result = document.getElementById("result");

  if (!bookIdInput || !result) return;

  navigator.geolocation.getCurrentPosition(position => {
    fetch(`${API}/borrow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "user",
        "x-user-id": "1"
      },
      body: JSON.stringify({
        bookId: parseInt(bookIdInput.value),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.message && data.message.includes("success")) {
        result.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
      } else {
        result.innerHTML = `<div class="alert alert-danger">${data.message || "Peminjaman gagal"}</div>`;
      }
    })
    .catch(error => {
      result.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
    });
  });
}

// ===================
// ADMIN FUNCTIONS (for admin.html)
// ===================
function loadBooksAdmin() {
  if (typeof fetch === 'undefined') return;

  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("bookTableBody");
      if (!tbody) return;

      tbody.innerHTML = data.map(book => `
        <tr>
          <td>${book.id}</td>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.stock}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.stock})">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteBook(${book.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading books:', error);
    });
}

function editBook(id, title, author, stock) {
  // Set form values for editing
  document.getElementById("editBookId").value = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editAuthor").value = author;
  document.getElementById("editStock").value = stock;

  // Show edit modal
  const editModal = new bootstrap.Modal(document.getElementById('editBookModal'));
  editModal.show();
}

function updateBook() {
  const id = document.getElementById("editBookId").value;
  const title = document.getElementById("editTitle").value;
  const author = document.getElementById("editAuthor").value;
  const stock = document.getElementById("editStock").value;

  fetch(`${API}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "admin"
    },
    body: JSON.stringify({
      title: title,
      author: author,
      stock: parseInt(stock)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      alert(data.message);
    } else {
      alert("Book updated successfully!");
      loadBooks(); // Refresh table
      bootstrap.Modal.getInstance(document.getElementById('editBookModal')).hide();
    }
  })
  .catch(error => {
    alert("Error updating book: " + error.message);
  });
}

function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    fetch(`${API}/books/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-role": "admin"
      }
    })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Book deleted successfully!");
      loadBooks(); // Refresh table
    })
    .catch(error => {
      alert("Error deleting book: " + error.message);
    });
  }
}

// ===================
// ADMIN FUNCTIONS (for admin.html)
// ===================
function loadBooks() {
  if (typeof fetch === 'undefined') return;

  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("bookTableBody");
      const bookCount = document.getElementById("bookCount");
      if (!tbody) return;

      // Update book count
      if (bookCount) {
        bookCount.textContent = `${data.length} books`;
      }

      tbody.innerHTML = data.map(book => {
        const stockStatus = getStockStatus(book.stock);
        return `
          <tr>
            <td>${book.id}</td>
            <td>
              <strong>${book.title}</strong>
            </td>
            <td>${book.author}</td>
            <td>${book.stock}</td>
            <td>
              <span class="status-badge ${stockStatus.badgeClass}">${stockStatus.text}</span>
            </td>
            <td>
              <button class="action-btn btn-edit" onclick="editBook(${book.id}, '${book.title}', '${book.author}', ${book.stock})">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="action-btn btn-delete" onclick="deleteBook(${book.id})">
                <i class="fas fa-trash"></i> Delete
              </button>
            </td>
          </tr>
        `;
      }).join('');
    })
    .catch(error => {
      console.error('Error loading books:', error);
      showAlert('Failed to load books. Please try again.', 'danger');
    });
}

function editBook(id, title, author, stock) {
  // Set form values for editing
  document.getElementById("editBookId").value = id;
  document.getElementById("editTitle").value = title;
  document.getElementById("editAuthor").value = author;
  document.getElementById("editStock").value = stock;

  // Show edit modal
  const editModal = new bootstrap.Modal(document.getElementById('editBookModal'));
  editModal.show();
}

function updateBook() {
  const id = document.getElementById("editBookId").value;
  const title = document.getElementById("editTitle").value;
  const author = document.getElementById("editAuthor").value;
  const stock = document.getElementById("editStock").value;

  fetch(`${API}/books/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "admin"
    },
    body: JSON.stringify({
      title: title,
      author: author,
      stock: parseInt(stock)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      showAlert(data.message, 'danger');
    } else {
      showAlert("Book updated successfully!", 'success');
      loadBooks(); // Refresh table
      bootstrap.Modal.getInstance(document.getElementById('editBookModal')).hide();
    }
  })
  .catch(error => {
    showAlert("Error updating book: " + error.message, 'danger');
  });
}

function deleteBook(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    fetch(`${API}/books/${id}`, {
      method: "DELETE",
      headers: {
        "x-user-role": "admin"
      }
    })
    .then(res => res.json())
    .then(data => {
      showAlert(data.message || "Book deleted successfully!", 'success');
      loadBooks(); // Refresh table
    })
    .catch(error => {
      showAlert("Error deleting book: " + error.message, 'danger');
    });
  }
}

function refreshData() {
  showAlert("Refreshing data...", 'info');
  loadBooks();
  // Refresh admin statistics
  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      updateStatistics(data);
      showAlert("Data refreshed successfully!", 'success');
    })
    .catch(error => {
      showAlert("Failed to refresh data.", 'danger');
    });
}

function exportBooks() {
  fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
      // Create CSV content
      const csvContent = [
        ['ID', 'Title', 'Author', 'Stock', 'Created At'],
        ...data.map(book => [
          book.id,
          book.title,
          book.author,
          book.stock,
          new Date(book.createdAt).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library_books_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showAlert("Books exported successfully!", 'success');
    })
    .catch(error => {
      showAlert("Failed to export books.", 'danger');
    });
}

// ===================
// FORM HANDLING
// ===================
function handleAddBookForm(event) {
  event.preventDefault();

  const title = document.getElementById("title");
  const author = document.getElementById("author");
  const stock = document.getElementById("stock");

  if (!title || !author || !stock) return;

  fetch(`${API}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-role": "admin"
    },
    body: JSON.stringify({
      title: title.value.trim(),
      author: author.value.trim(),
      stock: parseInt(stock.value)
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.message) {
      showAlert(data.message, 'danger');
    } else {
      showAlert("Book added successfully!", 'success');
      // Clear form
      title.value = '';
      author.value = '';
      stock.value = '';
      // Refresh data
      loadBooks();
    }
  })
  .catch(error => {
    showAlert("Failed to add book: " + error.message, 'danger');
  });
}

// ===================
// INITIALIZATION
// ===================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize index page
  if (document.getElementById("bookList")) {
    // Load books when page loads
    loadBooks();

    // Setup search and filter after books are loaded
    setTimeout(setupSearchAndFilter, 1000);
  }

  // Initialize admin page
  if (document.getElementById("bookTableBody")) {
    loadBooks();

    // Setup form handler
    const addBookForm = document.getElementById("addBookForm");
    if (addBookForm) {
      addBookForm.addEventListener('submit', handleAddBookForm);
    }
  }
});

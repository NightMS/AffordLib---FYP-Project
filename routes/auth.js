const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/articles/'); // create this folder if not exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


// Show register form
router.get('/register', (req, res) => {
    res.render('register');
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Registration Error:', err);
            return res.send('Error registering user');
        }
        res.render('success', { message: 'Registration successful! Redirecting to login...' });
    });
});

router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  const [rows] = await db.promise().query('SELECT id FROM users WHERE username = ?', [username]);
  res.json({ exists: rows.length > 0 });
});

router.get('/check-email', async (req, res) => {
  const { email } = req.query;
  const [rows] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
  res.json({ exists: rows.length > 0 });
});

router.get('/login', (req, res) => {
  const successMessage = req.session.successMessage;
  const errorMessage = req.session.errorMessage;
  req.session.successMessage = null;
  req.session.errorMessage = null;
  res.render('login', { successMessage, errorMessage });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Login error:', err);
      req.session.errorMessage = 'Internal server error.';
      return res.redirect('/login');
    }

    if (results.length === 0) {
      req.session.errorMessage = 'Incorrect username or password. Please try again.';
      return res.redirect('/login');
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.session.errorMessage = 'Incorrect username or password. Please try again.';
      return res.redirect('/login');
    }

    // Store user session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      subscription: user.subscription
    };

    req.session.successMessage = 'Login successful!';
    res.redirect('/profile');
  });
});

router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const successMessage = req.session.successMessage;
  const errorMessage = req.session.errorMessage;

  // Clear the messages after displaying once
  req.session.successMessage = null;
  req.session.errorMessage = null;

  res.render('profile', {
    user: req.session.user,
    successMessage,
    errorMessage
  });
});

router.get('/profile/edit', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('edit-profile', { user: req.session.user });
});

router.post('/profile/update-username', (req, res) => {
  const { newUsername } = req.body;
  const userId = req.session.user.id;

  console.log('Received username:', newUsername);
  console.log('User ID:', userId);

  const sql = 'UPDATE users SET username = ? WHERE id = ?';
  db.query(sql, [newUsername, userId], (err) => {
    if (err) {
      console.error('Update username error:', err);
      return res.send('Error updating username');
    }

    // Update session
    req.session.user.username = newUsername;
    
    req.session.successMessage = 'Username updated successfully!';
    res.redirect('/profile');
  });
});

router.post('/profile/update-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  // Fetch current hashed password from DB
  db.query('SELECT password FROM users WHERE id = ?', [userId], async (err, results) => {
    if (err || results.length === 0) {
      console.error('Password fetch error:', err);
      req.session.errorMessage = 'Error verifying user.';
      return res.redirect('/profile');
    }

    const match = await bcrypt.compare(currentPassword, results[0].password);
    if (!match) {
      req.session.errorMessage = 'Current password is incorrect.';
      return res.redirect('/profile');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
      if (err) {
        console.error('Password update error:', err);
        req.session.errorMessage = 'Error updating password.';
        return res.redirect('/profile');
      }

      req.session.successMessage = 'Password updated successfully!';
      res.redirect('/profile');
    });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.send('Error logging out');
    }
    res.redirect('/login'); // Redirect to login page after logout
  });
});


router.get('/adminlogin', (req, res) => {
  res.render('adminlogin', {
    errorMessage: req.session.errorMessage || null,
    successMessage: req.session.successMessage || null
  });

  // Clear messages after rendering
  req.session.errorMessage = null;
  req.session.successMessage = null;
});

// Handle admin login
router.post('/adminlogin', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM adminuser WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Admin login error:', err);
      req.session.errorMessage = 'Server error. Please try again.';
      return res.redirect('/adminlogin');
    }

    if (results.length === 0) {
      req.session.errorMessage = 'No admin found with that email.';
      return res.redirect('/adminlogin');
    }

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      req.session.errorMessage = 'Incorrect password.';
      return res.redirect('/adminlogin');
    }

    // Store admin session
    req.session.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      isAdmin: admin.IsAdmin
    };

    req.session.successMessage = 'Login successful!';
    res.redirect('/admindashboard');
  });
});

router.get('/adminlogout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout Error:', err);
      return res.send('Error logging out');
    }
    res.redirect('/adminlogin'); // Redirect to login page after logout
  });
});

router.get('/admindashboard', ensureAdminLoggedIn, (req, res) => {
  const userQuery = 'SELECT COUNT(*) AS count FROM users';
  const adminQuery = 'SELECT COUNT(*) AS count FROM adminuser';
  const articleQuery = 'SELECT COUNT(*) AS count FROM journal_articles';
  const tagQuery = 'SELECT COUNT(*) AS count FROM tags';

  db.query(userQuery, (err1, userResult) => {
    db.query(adminQuery, (err2, adminResult) => {
      db.query(articleQuery, (err3, articleResult) => {
        db.query(tagQuery, (err4, tagResult) => {
          if (err1 || err2 || err3 || err4) return res.send("Error loading dashboard");

          res.render('admindashboard', {
            userCount: userResult[0].count,
            adminCount: adminResult[0].count,
            articleCount: articleResult[0].count,
            tagCount: tagResult[0].count
          });
        });
      });
    });
  });
});

router.get('/admin/manageusers', ensureAdminLoggedIn, (req, res) => {
  const search = req.query.search || '';
  let sql = 'SELECT * FROM users';
  const params = [];

  if (search) {
    sql += ' WHERE username LIKE ? OR email LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.send('Database error while fetching users');
    }

    res.render('admin/manageusers', { users: results, search });
  });
});

router.get('/admin/adduser',ensureAdminLoggedIn, (req, res) => {
  res.render('admin/adduser');
});

// Handle user creation
router.post('/admin/adduser', async (req, res) => {
  const { username, email, password, subscription } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, email, password, subscription) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, subscription],
    (err) => {
      if (err) {
        console.error('Error adding user:', err);
        return res.send('Error adding user');
      }
      res.redirect('/admin/manageusers');
    }
  );
});

router.get('/admin/edituser/:id',ensureAdminLoggedIn, (req, res) => {
  const userId = req.params.id;
  const sql = 'SELECT * FROM users WHERE id = ?';
  
  db.query(sql, [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.send('User not found');
    }
    res.render('admin/edituser', { user: results[0] });
  });
});

router.post('/admin/edituser/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, subscription } = req.body;

  const sql = 'UPDATE users SET username = ?, email = ?, subscription = ? WHERE id = ?';
  db.query(sql, [username, email, subscription, userId], (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.send('Error updating user');
    }
    res.redirect('/admin/manageusers');
  });
});

// View all admins
router.get('/admin/manageadmins', ensureAdminLoggedIn, (req, res) => {
  const search = req.query.search || '';

  let sql = 'SELECT * FROM adminuser';
  let params = [];

  if (search) {
    sql += ' WHERE username LIKE ?';
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching admins:', err);
      return res.send('Error loading admin data');
    }
    res.render('admin/manageadmins', { admins: results, search });
  });
});

// Add admin form
router.get('/admin/addadmin',ensureAdminLoggedIn, (req, res) => {
  if (!req.session.admin) return res.redirect('/adminlogin');
  res.render('admin/addadmin');
});

// Handle admin insertion
router.post('/admin/addadmin', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO adminuser (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err) => {
      if (err) return res.send('Error adding admin');
      res.redirect('/admin/manageadmins');
    }
  );
});

// Edit admin form
router.get('/admin/editadmin/:id',ensureAdminLoggedIn, (req, res) => {
  if (!req.session.admin) return res.redirect('/adminlogin');
  const adminId = req.params.id;

  db.query('SELECT * FROM adminuser WHERE id = ?', [adminId], (err, results) => {
    if (err || results.length === 0) return res.send('Admin not found');
    res.render('admin/editadmin', { admin: results[0] });
  });
});

// Handle admin update
router.post('/admin/editadmin/:id', (req, res) => {
  const adminId = req.params.id;
  const { username, email } = req.body;

  db.query(
    'UPDATE adminuser SET username = ?, email = ? WHERE id = ?',
    [username, email, adminId],
    (err) => {
      if (err) return res.send('Error updating admin');
      res.redirect('/admin/manageadmins');
    }
  );
});


router.get('/admin/managetags', ensureAdminLoggedIn, (req, res) => {
  const search = req.query.search || '';
  let sql = 'SELECT * FROM tags';
  const params = [];

  if (search) {
    sql += ' WHERE name LIKE ?';
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching tags:', err);
      return res.send('Database error while fetching tags');
    }

    res.render('admin/managetags', { tags: results, search });
  });
});

router.get('/admin/addtags',ensureAdminLoggedIn, (req, res) => {
  res.render('admin/addtags');
});

router.post('/admin/addtags', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO tags (name) VALUES (?)', [name], (err) => {
    if (err) return res.send('Error adding tag');
    res.redirect('/admin/managetags');
  });
});

router.get('/admin/edittag/:id',ensureAdminLoggedIn, (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tags WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.send('Tag not found');
    res.render('admin/edittag', { tag: results[0] });
  });
});

router.post('/admin/edittag/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.query('UPDATE tags SET name = ? WHERE id = ?', [name, id], (err) => {
    if (err) return res.send('Error updating tag');
    res.redirect('/admin/managetags');
  });
});

router.get('/admin/deletetag/:id',ensureAdminLoggedIn, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tags WHERE id = ?', [id], (err) => {
    if (err) return res.send('Error deleting tag');
    res.redirect('/admin/managetags');
  });
});

router.get('/admin/managejournalarticles', ensureAdminLoggedIn, (req, res) => {
  const search = req.query.search || '';

  let sql = `
    SELECT ja.*, GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
    FROM journal_articles ja
    LEFT JOIN article_tags at ON ja.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
  `;
  const params = [];

  if (search) {
    sql += ` WHERE ja.title LIKE ? OR ja.author LIKE ?`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` GROUP BY ja.id ORDER BY ja.created_at DESC`;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error fetching articles:', err);
      return res.send('Error loading journal articles');
    }

    res.render('admin/managejournalarticles', {
      articles: results,
      search
    });
  });
});

router.get('/admin/addarticle',ensureAdminLoggedIn, (req, res) => {
  db.query('SELECT * FROM tags', (err, tags) => {
    if (err) return res.send('Error loading tags');
    res.render('admin/addarticle', { tags });
  });
});

router.post('/admin/addarticle', upload.single('pdf'), (req, res) => {
  const { title, author, abstract, visibility, article_publish_time, tags } = req.body;
  const pdfFilename = req.file.filename;

  const sql = `
    INSERT INTO journal_articles (title, author, abstract, visibility, file_path, created_at, article_publish_time)
    VALUES (?, ?, ?, ?, ?, NOW(), ?)`;

  db.query(sql, [title, author, abstract, visibility, pdfFilename, article_publish_time], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.send('Error saving article');
    }

    const articleId = result.insertId;

    if (Array.isArray(tags) && tags.length > 0) {
      const tagPairs = tags.map(tagId => [articleId, tagId]);
      db.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagPairs], () => {
        res.redirect('/admin/managejournalarticles');
      });
    } else {
      res.redirect('/admin/managejournalarticles');
    }
  });
});

router.get('/admin/editarticle/:id', ensureAdminLoggedIn, (req, res) => {
  const articleId = req.params.id;

  const articleSql = 'SELECT * FROM journal_articles WHERE id = ?';
  const tagsSql = 'SELECT * FROM tags';
  const selectedTagsSql = 'SELECT tag_id FROM article_tags WHERE article_id = ?';

  db.query(articleSql, [articleId], (err, articles) => {
    if (err || articles.length === 0) return res.send('Article not found');

    db.query(tagsSql, (err, tags) => {
      db.query(selectedTagsSql, [articleId], (err, selectedTags) => {
        const selectedIds = selectedTags.map(tag => tag.tag_id);
        res.render('admin/editarticle', {
          article: articles[0],
          tags,
          selectedIds
        });
      });
    });
  });
});

router.post('/admin/editarticle/:id', upload.single('pdf'), (req, res) => {
  const articleId = req.params.id;
  const { title, author, abstract, visibility, article_publish_time, tags } = req.body;

  let updateFields = `title = ?, author = ?, abstract = ?, visibility = ?, article_publish_time = ?`;
  const values = [title, author, abstract, visibility, article_publish_time];

  if (req.file) {
    updateFields += `, file_path = ?`;
    values.push(req.file.filename);
  }

  values.push(articleId);

  db.query(`UPDATE journal_articles SET ${updateFields} WHERE id = ?`, values, (err) => {
    if (err) {
      console.error('Update error:', err);
      return res.send('Error updating article');
    }

    // Update tags
    db.query('DELETE FROM article_tags WHERE article_id = ?', [articleId], () => {
      if (Array.isArray(tags) && tags.length > 0) {
        const tagPairs = tags.map(tagId => [articleId, tagId]);
        db.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagPairs], () => {
          res.redirect('/admin/managejournalarticles');
        });
      } else {
        res.redirect('/admin/managejournalarticles');
      }
    });
  });
});

router.get('/admin/deletearticle/:id', (req, res) => {
  const articleId = req.params.id;
  db.query('DELETE FROM journal_articles WHERE id = ?', [articleId], (err) => {
    if (err) return res.send('Error deleting article');
    res.redirect('/admin/managejournalarticles');
  });
});

router.get('/journals', (req, res) => {
  const user = req.session.user || null;
  const admin = req.session.admin || null;
  const search = req.query.search || '';
  const selectedTag = req.query.tag || '';
  const selectedDate = req.query.date || '';

  const isSubscribed = user && user.subscription === 'subscribe';
  const isAdmin = admin && admin.isAdmin === 1;

  let sql = `
    SELECT ja.*, GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
    FROM journal_articles ja
    LEFT JOIN article_tags at ON ja.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE (ja.title LIKE ? OR ja.author LIKE ?)
  `;

  const params = [`%${search}%`, `%${search}%`];

  if (!isAdmin) {
    sql += ` AND (ja.visibility = 'public' ${isSubscribed ? "OR ja.visibility = 'private'" : ''})`;
  }

  if (selectedTag) {
    sql += ' AND ja.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)';
    params.push(selectedTag);
  }

  if (selectedDate) {
    sql += ' AND DATE(ja.created_at) = ?';
    params.push(selectedDate);
  }

  sql += ' GROUP BY ja.id';

  db.query('SELECT * FROM tags', (err, tags) => {
    if (err) return res.send('Error fetching tags');

    db.query(sql, params, (err, articles) => {
      if (err) return res.send('Error fetching articles');

      res.render('journalsarticle', {
        articles,
        user,
        admin,
        search,
        tags,
        selectedTag,
        selectedDate
      });
    });
  });
});

router.get('/viewarticle/:id', (req, res) => {
  const articleId = req.params.id;
  const editingCommentId = parseInt(req.query.edit);
  const userId = req.session.user ? req.session.user.id : null;

  const articleSql = `
    SELECT ja.*, GROUP_CONCAT(t.name SEPARATOR ', ') AS tags
    FROM journal_articles ja
    LEFT JOIN article_tags at ON ja.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE ja.id = ?
    GROUP BY ja.id`;

  const commentsSql = `
    SELECT c.id, c.comment, c.created_at, u.username
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.article_id = ?
    ORDER BY c.created_at DESC`;

  const avgRatingSql = `SELECT ROUND(AVG(rating), 1) AS average FROM ratings WHERE article_id = ?`;
  const userRatingSql = `SELECT rating FROM ratings WHERE article_id = ? AND user_id = ?`;

  db.query(articleSql, [articleId], (err, articleResults) => {
    if (err || articleResults.length === 0) return res.send('Article not found');
    const article = articleResults[0];

    db.query(commentsSql, [articleId], (err, comments) => {
      db.query(avgRatingSql, [articleId], (err, avgRatingResults) => {
        const avgRating = avgRatingResults[0].average || 'No ratings yet';

        if (userId) {
          db.query(userRatingSql, [articleId, userId], (err, userRatingResults) => {
            const userRating = userRatingResults.length ? userRatingResults[0].rating : null;
            res.render('viewarticle', {
              article, comments, avgRating, userRating,
              editingCommentId, user: req.session.user
            });
          });
        } else {
          res.render('viewarticle', {
            article, comments, avgRating, userRating: null,
            editingCommentId, user: null
          });
        }
      });
    });
  });
});

// Submit rating
router.post('/viewarticle/:id/rate', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { rating } = req.body;
  const articleId = req.params.id;
  const userId = req.session.user.id;

  const sql = `INSERT INTO ratings (article_id, user_id, rating)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE rating = VALUES(rating)`;

  db.query(sql, [articleId, userId, rating], (err) => {
    if (err) console.error(err);
    res.redirect(`/viewarticle/${articleId}`);
  });
});

// Submit comment
router.post('/viewarticle/:id/comment', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const { comment } = req.body;
  const articleId = req.params.id;
  const userId = req.session.user.id;

  db.query('INSERT INTO comments (article_id, user_id, comment) VALUES (?, ?, ?)', [articleId, userId, comment], (err) => {
    if (err) console.error(err);
    res.redirect(`/viewarticle/${articleId}`);
  });
});

router.post('/viewarticle/:articleId/deletecomment/:commentId', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { articleId, commentId } = req.params;
  const userId = req.session.user.id;

  const sql = 'DELETE FROM comments WHERE id = ? AND user_id = ?';
  db.query(sql, [commentId, userId], (err) => {
    if (err) console.error(err);
    res.redirect(`/viewarticle/${articleId}`);
  });
});

router.post('/viewarticle/:articleId/editcomment/:commentId', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { articleId, commentId } = req.params;
  const { editedComment } = req.body;
  const userId = req.session.user.id;

  const sql = 'UPDATE comments SET comment = ? WHERE id = ? AND user_id = ?';
  db.query(sql, [editedComment, commentId, userId], (err) => {
    if (err) console.error(err);
    res.redirect(`/viewarticle/${articleId}`);
  });
});

function ensureAdminLoggedIn(req, res, next) {
  if (req.session.admin) {
    next(); 
  } else {
    res.redirect('/adminlogin'); 
  }
}

module.exports = router;
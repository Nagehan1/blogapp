/* eslint-disable no-undef */
const express = require("express");
const app = express();
const cors = require("cors");
const { Pool } = require("pg");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const secret = "secret";
app.use(cors());
app.use(express.json());
pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog",
  password: "nagehan123",
  port: 5433,
});


app.post(
  "/register",
  [
    check("email", "please write valid email addres").isEmail(),
    check("password", "please write valid password").isLength({ min: 6 }),
    check("username", "please write valid name").isLength({ min: 3 }),
    check("is_admin").isBoolean(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password,username, is_admin } = req.body;
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      const query =
        "INSERT INTO users (email, password, username, is_admin) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [email, hashedPassword, username, is_admin];
      await pool.query(query, values);
      res.status(201).json({
        message: "User created",
        data: {
          email,
          password,
          username,
          is_admin
        },
      });
    } catch (err) {
      //eslint-disable-next-line
      console.error(err);
      res.status(500).json({ errors: [{ msg: "Server error" }] });
    }
  }
);



app.post(
  "/login",
  [
    check("email", "please write valid email addres").isEmail(),
    check("password", "please write valid password").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (rows.length === 0) {
        return res.status(400).json({
          errors: [{ msg: "Invalid credentials" }],
        });
      }
      const isMatch = await bcrypt.compare(password, rows[0].password);
      if (!isMatch) {
        return res.status(400).json({
          errors: [{ msg: "Invalid credentials" }],
        });
      }
      const token = jwt.sign(
        {
          user: {
            id: rows[0].id,
            email: rows[0].email,
            username: rows[0].username,
            is_admin: rows[0].is_admin,
          },
        },
        secret,
        { expiresIn: "2h" }
      );
      res.status(200).json({
        status: "success",
        message: "User logged in",
        data: {
          token,
          is_admin: rows[0].is_admin,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

 

app.post( // blog olusturma
  "/blog",
  [
    check("title", "Please enter a title").isLength({ min: 1 }),
    check("content", "Please enter some content").isLength({ min: 1 }),
    check("author", "Please enter an author").isLength({ min: 1 }),
  ],
  async (req, res) => {
    //only admin can create a blog post
    jwt.verify(req.headers.authorization, secret, async (error, decoded) => {  //jwt var mi
      if (error) {
        res.status(401).json({ error: "Unauthorized" });
      } else {
        if (!decoded.user.is_admin) { //admin mi ?
          res.status(401).json({ error: "Unauthorized" });
          return;
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) { // checkpoint k/
          return res.status(400).json({ errors: errors.array() });
        }
        const { title, content, author } = req.body;
        try {
          const { rows } = await pool.query(
            "INSERT INTO blog_posts (title, content, author) VALUES ($1, $2, $3) RETURNING *",
            [title, content, author]
          );
          res.status(201).json({
            status: "success",
            message: "Blog post created",
            data: {
              id: rows[0].id,
              title: rows[0].title,
              content: rows[0].content,
              author:rows[0].author
            },
          });
        } catch (err) {
          console.error(err.message);
          res.status(500).send("Server error");
        }
      }
    });
  }
);
// get all blog posts
app.get("/blog", async (req, res) => {
        try {
            const {rows} = await pool.query("SELECT * FROM blog_posts");
            res.status(200).json({
                status: "success",
                message: "All blog posts",
                data: rows,
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server error");
        }
    }
);
app.get("/blog/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM blog_posts WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Blog post not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Blog post found",
      data: rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
// update a blog post
app.put("/blog/:id", async (req, res) => {
  //only admin can update a blog post
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const { title, content, author } = req.body;
      try {
        const { rows } = await pool.query(
          "UPDATE blog_posts SET title = $1, content = $2, author = $3 WHERE id = $4 RETURNING *",
          [title, content, author, req.params.id]
        );
        if (rows.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "Blog post not found",
          });
        }
        res.status(200).json({
          status: "success",
          message: "Blog post updated",
          data: rows[0],
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});
// delete a blog post
app.delete("/blog/:id", async (req, res) => {
  //only admin can delete a blog post
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      try {
        const { rows } = await pool.query(
          "DELETE FROM blog_posts WHERE id = $1 RETURNING *",
          [req.params.id]
        );
        if (rows.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "Blog post not found",
          });
        }
        res.status(200).json({
          status: "success",
          message: "Blog post deleted",
          data: rows[0],
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});
 




app.get("/users", async (req, res) => {  //users 
  //only admin can get all users
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      try {
        const { rows } = await pool.query("SELECT * FROM users");
        res.status(200).json({
          status: "success",
          message: "All users",
          data: {
            users: rows,
          },
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});
// get a user
app.get("/users/:id", async (req, res) => {
  //only admin can get a user
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      try {
        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
          req.params.id,
        ]);
        res.status(200).json({
          status: "success",
          message: "User",
          data: {
            user: rows[0],
          },
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});
// update a user
app.put("/users/:id", async (req, res) => {
  //only admin can update a user
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const { name, email, address, phone } = req.body;
      try {
        const { rows } = await pool.query(
          "UPDATE users SET name = $1, email = $2, address = $3, phone = $4 WHERE id = $5 RETURNING *",
          [name, email, address, phone, req.params.id]
        );
        res.status(200).json({
          status: "success",
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});
// delete a user
app.delete("/users/:id", async (req, res) => {
  //only admin can delete a user
  jwt.verify(req.headers.authorization, secret, async (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      if (!decoded.user.is_admin) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      try {
        const { rows } = await pool.query("DELETE FROM users WHERE id = $1", [
          req.params.id,
        ]);
        res.status(200).json({
          status: "success",
          message: "User deleted",
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
      }
    }
  });
});




app.listen(3001, () => {
    console.log("Server is running on port 3001");})
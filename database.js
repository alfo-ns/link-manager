const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'links.db'));
    this.init();
  }

  init() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT,
        tags TEXT,
        domain TEXT,
        favicon TEXT,
        is_starred INTEGER DEFAULT 0,
        date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
        date_modified DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createTable, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Database initialized successfully');
        this.seedData();
      }
    });
  }

  seedData() {
    this.db.get("SELECT COUNT(*) as count FROM links", (err, row) => {
      if (err) {
        console.error('Error checking data:', err);
        return;
      }

      if (row.count === 0) {
        const sampleLinks = [
          {
            title: "React Documentation",
            url: "https://react.dev",
            description: "Official React documentation and guides",
            category: "Development",
            tags: "react,javascript,frontend",
            domain: "react.dev",
            is_starred: 1
          },
          {
            title: "Tailwind CSS",
            url: "https://tailwindcss.com",
            description: "Utility-first CSS framework",
            category: "Design",
            tags: "css,tailwind,design",
            domain: "tailwindcss.com",
            is_starred: 0
          },
          {
            title: "Node.js Documentation",
            url: "https://nodejs.org/docs",
            description: "Official Node.js documentation",
            category: "Development",
            tags: "nodejs,backend,javascript",
            domain: "nodejs.org",
            is_starred: 1
          }
        ];

        const insertStmt = this.db.prepare(`
          INSERT INTO links (title, url, description, category, tags, domain, is_starred)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        sampleLinks.forEach(link => {
          insertStmt.run([
            link.title, link.url, link.description, 
            link.category, link.tags, link.domain, link.is_starred
          ]);
        });

        insertStmt.finalize();
        console.log('Sample data inserted');
      }
    });
  }

  getAllLinks(callback) {
    const query = `
      SELECT id, title, url, description, category, tags, domain, 
             favicon, is_starred, date_added, date_modified
      FROM links 
      ORDER BY date_added DESC
    `;
    this.db.all(query, callback);
  }

  addLink(link, callback) {
    const query = `
      INSERT INTO links (title, url, description, category, tags, domain, favicon)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    this.db.run(query, [
      link.title, link.url, link.description, 
      link.category, link.tags, link.domain, link.favicon
    ], callback);
  }

  updateLink(id, updates, callback) {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(id);

    const query = `UPDATE links SET ${fields}, date_modified = CURRENT_TIMESTAMP WHERE id = ?`;
    this.db.run(query, values, callback);
  }

  deleteLink(id, callback) {
    this.db.run("DELETE FROM links WHERE id = ?", [id], callback);
  }

  toggleStar(id, callback) {
    this.db.run(
      "UPDATE links SET is_starred = NOT is_starred, date_modified = CURRENT_TIMESTAMP WHERE id = ?", 
      [id], 
      callback
    );
  }

  searchLinks(term, category, starredOnly, callback) {
    let query = `
      SELECT id, title, url, description, category, tags, domain, 
             favicon, is_starred, date_added, date_modified
      FROM links WHERE 1=1
    `;
    const params = [];

    if (term) {
      query += ` AND (title LIKE ? OR description LIKE ? OR tags LIKE ? OR domain LIKE ?)`;
      const searchTerm = `%${term}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (starredOnly) {
      query += ` AND is_starred = 1`;
    }

    query += ` ORDER BY date_added DESC`;

    this.db.all(query, params, callback);
  }

  getCategories(callback) {
    this.db.all("SELECT DISTINCT category FROM links WHERE category IS NOT NULL ORDER BY category", callback);
  }
}

module.exports = Database;
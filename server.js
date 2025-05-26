
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Utility function to extract metadata from URL
async function extractMetadata(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const domain = new URL(url).hostname;
    
    return {
      title: $('title').text().trim() || $('meta[property="og:title"]').attr('content') || domain,
      description: $('meta[name="description"]').attr('content') || 
                   $('meta[property="og:description"]').attr('content') || '',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      domain: domain
    };
  } catch (error) {
    console.error('Error extracting metadata:', error.message);
    const domain = new URL(url).hostname;
    return {
      title: domain,
      description: '',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      domain: domain
    };
  }
}

// Routes
app.get('/api/links', (req, res) => {
  const { search, category, starred } = req.query;
  
  if (search || category || starred) {
    db.searchLinks(search, category, starred === 'true', (err, links) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(links.map(link => ({
          ...link,
          tags: link.tags ? link.tags.split(',') : [],
          isStarred: !!link.is_starred
        })));
      }
    });
  } else {
    db.getAllLinks((err, links) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(links.map(link => ({
          ...link,
          tags: link.tags ? link.tags.split(',') : [],
          isStarred: !!link.is_starred
        })));
      }
    });
  }
});

app.post('/api/links', async (req, res) => {
  try {
    const { url, title, description, category, tags } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Extract metadata if title is not provided
    let linkData = { url, title, description, category, tags: tags || [] };
    
    if (!title) {
      const metadata = await extractMetadata(url);
      linkData = {
        ...linkData,
        title: metadata.title,
        description: description || metadata.description,
        favicon: metadata.favicon,
        domain: metadata.domain
      };
    } else {
      const domain = new URL(url).hostname;
      linkData.domain = domain;
      linkData.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    }

    db.addLink({
      ...linkData,
      tags: Array.isArray(linkData.tags) ? linkData.tags.join(',') : linkData.tags
    }, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          res.status(409).json({ error: 'Link already exists' });
        } else {
          res.status(500).json({ error: err.message });
        }
      } else {
        res.json({ id: this.lastID, ...linkData });
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid URL' });
  }
});

app.put('/api/links/:id', (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  
  if (updates.tags && Array.isArray(updates.tags)) {
    updates.tags = updates.tags.join(',');
  }

  db.updateLink(id, updates, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Link updated successfully' });
    }
  });
});

app.delete('/api/links/:id', (req, res) => {
  const { id } = req.params;
  
  db.deleteLink(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Link deleted successfully' });
    }
  });
});

app.post('/api/links/:id/toggle-star', (req, res) => {
  const { id } = req.params;
  
  db.toggleStar(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Star toggled successfully' });
    }
  });
});

app.get('/api/categories', (req, res) => {
  db.getCategories((err, categories) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(categories.map(cat => cat.category));
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Link Manager server running at http://localhost:${PORT}`);
  console.log(`📊 Database: SQLite (links.db)`);
});
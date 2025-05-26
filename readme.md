## 7. README.md
```markdown
# Link Manager - Applicazione Locale

Una completa applicazione per gestire i tuoi link con database locale SQLite.

## Caratteristiche

- 🗄️ Database SQLite locale
- 🔍 Ricerca avanzata in tempo reale
- 🏷️ Sistema di tag e categorie
- ⭐ Preferiti
- 🎨 Favicon automatiche
- 📱 Design responsive
- 🚀 Estrazione automatica metadati

## Installazione

1. Clona o scarica il progetto
2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Avvia l'applicazione:
   ```bash
   npm start
   ```

4. Apri il browser su: http://localhost:3000

## Sviluppo

Per il modo sviluppo con auto-reload:
```bash
npm run dev
```

## Database

Il database SQLite viene creato automaticamente in `links.db` nella cartella del progetto.

## API Endpoints

- `GET /api/links` - Ottieni tutti i link
- `POST /api/links` - Aggiungi nuovo link
- `PUT /api/links/:id` - Aggiorna link
- `DELETE /api/links/:id` - Elimina link
- `POST /api/links/:id/toggle-star` - Toggle preferito
- `GET /api/categories` - Ottieni categorie
```

## Installazione e Avvio

1. **Crea la cartella del progetto:**
   ```bash
   mkdir link-manager
   cd link-manager
   ```

2. **Crea tutti i file** come mostrato sopra

3. **Installa le dipendenze:**
   ```bash
   npm install
   ```

4. **Avvia l'applicazione:**
   ```bash
   npm start
   ```

5. **Apri il browser su:** `http://localhost:3000`

## Funzionalità Principali

✅ **Database SQLite locale** - Nessuna dipendenza cloud
✅ **Estrazione automatica metadati** - Titolo e descrizione dal sito
✅ **Favicon automatiche** - Icone dei siti caricate automaticamente
✅ **Ricerca potente** - In titoli, descrizioni, tag e domini
✅ **Sistema di categorie e tag**
✅ **Preferiti con stelline**
✅ **Interface responsive**
✅ **API REST completa**

L'app è completamente funzionale e pronta per l'uso locale!
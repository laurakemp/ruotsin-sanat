# Ruotsin sanat 🇸🇪

Kevyt websovellus ruotsin sanojen harjoitteluun puhelimella.

**Avaa sovellus:** https://laurakemp.github.io/ruotsin-sanat/

## Harjoitukset

- **Sanakortit:** näet sanan, käännät kortin ja kerrot itse, osasitko.
- **Monivalinta:** valitse oikea käännös neljästä vaihtoehdosta.
- **Kirjoitus:** kirjoita käännös itse.

Harjoitella voi kumpaankin suuntaan (suomi → ruotsi tai ruotsi → suomi). Lopuksi
väärin menneitä sanoja voi harjoitella uudelleen.

## Ylläpito

- [Sanojen lisääminen](docs/sanojen-lisaaminen.md)
- Tekniset ohjeet: [CLAUDE.md](CLAUDE.md)

## Kehitys

Sovellus on pelkkää HTML:ää, CSS:ää ja JavaScriptiä ilman riippuvuuksia.
Paikallinen ajo:

```bash
python3 -m http.server 8000 --directory src
```

Avaa sitten selaimessa http://localhost:8000.

Muutokset julkaistaan automaattisesti, kun ne viedään `main`-haaraan.

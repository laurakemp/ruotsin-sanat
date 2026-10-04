# Ruotsin sanat 🇸🇪

Kevyt websovellus ruotsin sanojen ja epäsäännöllisten verbien harjoitteluun
puhelimella.

**Avaa sovellus:** https://laurakemp.github.io/ruotsin-sanat/

## Harjoitukset

Kokeen tapaan suomenkielinen sana annetaan ja vastataan ruotsiksi.

| Harjoitus | Mitä tehdään |
| --- | --- |
| 📖 Opettele | Katso verbin kaikki muodot ja arvioi, osasitko |
| 🎯 Monivalinta | Valitse oikea muoto neljästä vaihtoehdosta |
| ✏️ Kirjoita muoto | Kirjoita yksi pyydetty muoto |
| 🏆 Koe | Kirjoita kaikki muodot, ja ansaitse tähtiä |

Kierroksella on 10 sanaa, heikoimmin osatut ensin. Väärin menneet sanat tulevat
uudelleen kierroksen lopussa. Pisteet, putkibonukset, päiväputki ja sanojen
tähdet kannustavat jatkamaan. Sana on opittu, kun se saa kolme tähteä.

## Ylläpito

- [Uusien sanojen vaihtaminen](docs/sanojen-lisaaminen.md)
- Tekniset ohjeet: [CLAUDE.md](CLAUDE.md)

## Kehitys

Sovellus on pelkkää HTML:ää, CSS:ää ja JavaScriptiä ilman riippuvuuksia.
Paikallinen ajo:

```bash
python3 -m http.server 8000 --directory src
```

Avaa sitten selaimessa http://localhost:8000.

Muutokset julkaistaan automaattisesti, kun ne viedään `main`-haaraan.

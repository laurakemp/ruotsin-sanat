# Ruotsin sanat 🇸🇪

Kevyt websovellus ruotsin sanojen ja epäsäännöllisten verbien harjoitteluun
puhelimella.

**Avaa sovellus:** https://laurakemp.github.io/ruotsin-sanat/

## Toiminta

Kokeen tapaan suomenkielinen sana annetaan ja vastataan ruotsiksi.

- **Aloita harjoittelu:** 10 sanaa, vaikeimmat ensin. Tehtävätyypit vaihtelevat
  satunnaisesti: muotokortit, monivalinta, yhden muodon kirjoitus ja kaikkien
  muotojen kirjoitus. Lopuksi väärin menneet kerrataan, kunnes ne menevät oikein.
- **Koe** ([oma linkki](https://laurakemp.github.io/ruotsin-sanat/#koe)):
  kaikkien sanojen kaikki muodot kirjoittaen. Lopuksi näkyy, mitkä menivät
  oikein ja mitkä väärin, ja vaikeat sanat voi kerrata heti. Täysillä pisteillä
  ansaitsee 5 € palkkion 💶.

Pisteet, putkibonukset, päiväputki ja sanojen tähdet kannustavat jatkamaan.
Sana on opittu, kun se saa kolme tähteä.

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

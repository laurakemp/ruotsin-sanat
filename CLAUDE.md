# CLAUDE.md

Ohje Claudelle tämän repositorion parissa työskentelyyn.

## Projekti

Kevyt websovellus, jolla lapsi harjoittelee ruotsin sanoja puhelimella. Sovellus
julkaistaan GitHub Pagesiin: https://laurakemp.github.io/ruotsin-sanat/

- Käyttäjä: koululainen, käyttää puhelinta. Käyttöliittymän pitää olla selkeä,
  isot painikkeet, toimii yhdellä kädellä.
- Ylläpitäjä: Laura, joka ei ole kehittäjä. **Selitä aina suomeksi ja selkeästi,
  mitä teet ja miksi.** Neuvo vaihe vaiheelta, kun Lauran pitää tehdä jotain itse.
- Käyttöliittymän ja ohjeiden kieli on suomi. Noudata suomen kielen
  oikeinkirjoitusta (yhdyssanat, pilkutus).

## Tekniikka

- Pelkkä HTML, CSS ja JavaScript (ES-moduulit). **Ei build-vaihetta, ei
  riippuvuuksia, ei frameworkia.** Pidä se näin, ellei Laura toisin päätä.
- Julkaistava sovellus on kokonaan `src/`-kansiossa.
- Sanat ovat tiedostossa `src/data/words.json`, ei koodissa.

## Kansiorakenne

```
src/                  Julkaistava sovellus (GitHub Pages julkaisee tämän kansion)
  index.html          Kaikki näkymät (PIN, valikko, harjoitus, tulokset)
  css/styles.css      Tyylit, värit muuttujina :root-lohkossa, tumma tila mukana
  js/main.js          Käyttöliittymä: näkymien vaihto ja tapahtumat
  js/quiz.js          Harjoituslogiikka ilman DOMia (kysymykset, tarkistus)
  js/pin.js           Kevyt PIN-kysely
  js/storage.js       localStorage-kääre (virheet niellään)
  js/config.js        Asetukset (PIN_HASH, vaihtoehtojen määrä)
  data/words.json     Sanalistat
scripts/              Apuskriptit (Node), eivät mene julkaisuun
  validate-words.mjs  Tarkistaa words.json-tiedoston muodon
  pin-hash.mjs        Laskee PIN-tiivisteen config.js-tiedostoon
docs/                 Ohjeet Lauralle
.github/workflows/    GitHub Actions: tarkistus ja julkaisu
```

## Sanalistan muoto

```json
{
  "lists": [
    {
      "id": "kappale-1",
      "name": "Kappale 1",
      "words": [{ "fi": "koira", "sv": "en hund" }]
    }
  ]
}
```

- `id` on yksilöllinen, pienillä kirjaimilla, ei välilyöntejä.
- Ruotsin substantiiveihin kirjoitetaan artikkeli (`en`/`ett`). Kirjoitusharjoitus
  hyväksyy vastauksen ilman artikkelia "melkein oikeana".
- Tarkista muutoksen jälkeen: `node scripts/validate-words.mjs`

## PIN-koodi

- Kevyt este, **ei oikea tietoturvasuoja**: repo on julkinen ja sanat näkyvät
  koodissa. Älä lisää sovellukseen henkilötietoja (esim. lapsen nimeä).
- `PIN_HASH` tiedostossa `src/js/config.js` on SHA-256 merkkijonosta
  `ruotsin-sanat:<PIN>`. Tyhjä arvo poistaa PIN-kyselyn.
- Uusi tiiviste: `node scripts/pin-hash.mjs <PIN>`. Älä kirjoita itse PIN-koodia
  repoon, commit-viesteihin tai muualle.

## Paikallinen ajo

ES-moduulit ja `fetch` eivät toimi `file://`-osoitteessa, joten tarvitaan
paikallinen palvelin:

```bash
python3 -m http.server 8000 --directory src
```

Avaa http://localhost:8000. Sama on määritelty tiedostossa `.claude/launch.json`
(käynnistä `preview_start`-työkalulla nimellä `ruotsin-sanat`).

## Julkaisu

- Push `main`-haaraan käynnistää workflow'n `.github/workflows/deploy.yml`:
  ensin sanalistan tarkistus, sitten julkaisu GitHub Pagesiin. Julkaisu kestää
  noin minuutin.
- Pull requestissa ajetaan vain tarkistus.
- Repositorio on github.com-tilillä `laurakemp`. Koneella on kirjautuminen myös
  työpaikan GitHubiin (`barona.ghe.com`). Käytä tämän projektin `gh`-komennoissa
  aina `--hostname github.com` tai `--repo laurakemp/ruotsin-sanat`.

## Työtavat

- Commit-viestit suomeksi, imperatiivissa: "Lisää kappaleen 3 sanat".
- Pienet muutokset (esim. uudet sanat) voi tehdä suoraan `main`-haaraan.
  Isommat muutokset omaan haaraan ja pull requestiin, jotta Laura voi katsoa ne
  ennen julkaisua.
- Testaa muutokset paikallisesti puhelimen levyisessä näkymässä (375 px) ennen
  pushia.
- Pidä koodi luettavana: lyhyet funktiot, kuvaavat nimet, kommentit suomeksi
  vain siellä, missä syy ei ole ilmeinen.

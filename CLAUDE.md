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

## Oppimisen malli

- Koe on muotoa: suomenkielinen sana annetaan, ja oppilas kirjoittaa ruotsiksi.
  Siksi harjoitus kulkee aina suunnassa suomi → ruotsi.
- Nykyiset sanat ovat **epäsäännöllisiä verbejä** neljässä muodossa:
  perusmuoto, preesens, imperfekti ja supiini.
- Sovelluksessa on aina **yksi ajankohtainen sanalista**. Kun opettaja antaa
  uudet sanat, vanha lista korvataan kokonaan. Vanhoja listoja ei säilytetä.
- Etusivulla on sanalista-linkki, yksi **Aloita harjoittelu** -painike ja
  linkki kokeeseen.
- **Harjoittelu osioina:** sanalista jaetaan kirjan järjestyksessä
  `ROUND_SIZE` sanan osioihin (oletus 5, eli 20 sanaa = 4 osiota). Aloita
  harjoittelu -painike vie aina seuraavaan osioon (`nextSection` tallessa
  puhelimessa), ja viimeisen jälkeen aloitetaan alusta. Näin kaikki sanat
  käydään varmasti läpi. Osio vaihtuu vasta, kun kierros on tehty loppuun.
- Kierroksella jokainen osion sana käy läpi kaikki vaiheet (`STEPS` tiedostossa
  `quiz.js`): ensin kaikki monivalintana, sitten järjestystehtävänä, sitten
  yksi muoto kirjoittaen ja viimeisenä kaikki muodot kirjoittaen. Lopuksi
  väärin menneet kerrataan kirjoittamalla kaikki muodot, kunnes ne menevät
  oikein. Harjoituskokeen jälkeinen kertaus harjoittelee väärin menneet sanat
  eikä vaihda osiota.
- **Pidä oppiminen yksinkertaisena.** Tavoite on, että verbin rivi jää mieleen
  kirjan järjestyksessä. Muodot numeroidaan (1.–4.), ja kun kysytään yhtä
  muotoa, näytetään aina lyhyt selitys (`formHints`) ja kirjan rivi, jossa
  kysytyn muodon paikalla on "?". Monivalinnassa rivillä näkyvät muut muodot,
  ja väärät vaihtoehdot ovat muiden verbien samaa muotoa. Etusivun "Mitä muodot
  tarkoittavat?" selittää muodot esimerkin (`example`) avulla.
- Erillisiä å/ä/ö-nappeja ei tarvita, koska suomalaisessa näppäimistössä ne ovat. Lopuksi väärin
  menneet kerrataan kirjoittaen, kunnes ne menevät oikein.
- **Harjoituskoe** (`…/#koe`, oma linkki): kaikkien sanojen kaikki muodot kirjoittaen,
  ei palautetta kesken kokeen. Lopuksi näkyy, mitkä menivät oikein ja mitkä
  väärin, sekä painike väärin menneiden sanojen kertaukseen.
- Kannustus: pisteet, putkibonus, päiväputki, sanakohtaiset tähdet (0–3) ja
  konfetti. Tähden saa, kun kaikki muodot menevät oikein ensimmäisellä
  yrityksellä (kaikki muodot -tehtävä tai koe). Väärä vastaus vie tähden.
  Kolme tähteä = opittu. Täydet pisteet harjoituskokeessa merkitsevät kaikki
  listan sanat opituiksi.
- **Palkkio:** oppilas saa `SCHOOL_REWARD` (5 €) **koulun kokeen** täysistä
  pisteistä, ei sovelluksen kokeesta. Sovelluksen koe on harjoituskoe: täysillä
  pisteillä se kertoo, että oppilas on valmis koulun kokeeseen, ja muistuttaa
  palkkiosta. Jos virheitä on enintään `REWARD_NEAR_WORDS`, kortti kannustaa
  yrittämään uudelleen. Etusivu näyttää palkkion ja valmiuden.
- Edistyminen tallentuu puhelimen `localStorage`en. Tähdet on avainnettu listan
  `id`:llä, joten uusi lista alkaa puhtaalta pöydältä, mutta pisteet säilyvät.

## Tekniikka

- Pelkkä HTML, CSS ja JavaScript (ES-moduulit). **Ei build-vaihetta, ei
  riippuvuuksia, ei frameworkia.** Pidä se näin, ellei Laura toisin päätä.
- Julkaistava sovellus on kokonaan `src/`-kansiossa.
- Sanat ovat tiedostossa `src/data/words.json`, ei koodissa.

## Kansiorakenne

```
src/                  Julkaistava sovellus (GitHub Pages julkaisee tämän kansion)
  index.html          Kaikki näkymät (etusivu, sanalista, harjoitus, kertaus, tulokset, koe)
  css/styles.css      Tyylit, värit muuttujina :root-lohkossa, tumma tila mukana
  js/main.js          Käyttöliittymä: reititys (#koe), harjoittelun ja kokeen kulku
  js/quiz.js          Harjoituslogiikka ilman DOMia (kysymykset, tarkistus)
  js/progress.js      Pisteet, tähdet, virheet ja päiväputki
  js/data.js          Sanalistan lataus ja muodon yhtenäistys
  js/confetti.js      Konfetti onnistumisesta
  js/storage.js       localStorage-kääre (virheet niellään)
  js/config.js        Asetukset (kierroksen koko, bonukset, palkkio)
  data/words.json     Ajankohtainen sanalista
scripts/              Apuskriptit (Node), eivät mene julkaisuun
  validate-words.mjs  Tarkistaa words.json-tiedoston muodon
docs/                 Ohjeet Lauralle
.github/workflows/    GitHub Actions: tarkistus ja julkaisu
```

## Sanalistan muoto

```json
{
  "id": "verbit-be-heta",
  "title": "Epäsäännöllisiä verbejä",
  "forms": ["perusmuoto", "preesens", "imperfekti", "supiini"],
  "formHints": ["sanakirjamuoto, esim. juoda", "tapahtuu nyt, esim. juo",
                "tapahtui ennen, esim. joi", "har + muoto = on tehnyt, esim. on juonut"],
  "example": {
    "sv": ["dricka", "dricker", "drack", "druckit"],
    "fi": ["juoda", "juo", "joi", "on juonut (har druckit)"]
  },
  "words": [
    { "fi": "pyytää; rukoilla", "sv": ["be", "ber", "bad", "bett"] },
    { "fi": "antaa", "sv": ["ge", "ger", "gav", "gett/givit"] }
  ]
}
```

- `id`: **anna jokaiselle uudelle listalle uusi id** (esim. listan ensimmäinen ja
  viimeinen verbi), jotta tähdet alkavat alusta.
- `fi`: suomennos kuten kirjassa. Useat merkitykset puolipisteellä tai pilkulla.
- `sv`: yhtä monta muotoa kuin `forms`-taulukossa. Vaihtoehtoiset oikeat
  vastaukset erotetaan vinoviivalla (`gett/givit`), jolloin kumpikin hyväksytään.
- Jos lista on tavallisia sanoja eikä verbejä, `forms` voi olla
  `["ruotsiksi"]` ja `sv` pelkkä merkkijono. Substantiiveihin kirjoitetaan
  artikkeli (`en`/`ett`), ja vastaus ilman artikkelia hyväksytään muistutuksella.
- Tarkista muutoksen jälkeen: `node scripts/validate-words.mjs`

## Uuden sanalistan lisääminen kuvasta

Laura lähettää kuvan kirjan sanastosivusta. Tee näin:

1. Litteroi kaikki sanat kuvasta tarkasti, myös å/ä/ö. Jos jokin kohta on
   epäselvä tai rajautuu kuvan ulkopuolelle, kysy Lauralta.
2. Korvaa `src/data/words.json`:n `id`, `title` ja `words` uusilla. Säilytä
   `forms`, `formHints` ja `example`, jos uudet sanat ovat myös verbejä.
3. Aja `node scripts/validate-words.mjs`.
4. Näytä Lauralle lista tarkistettavaksi (suomi – ruotsin muodot).
5. Commit ("Vaihda sanalista: <kuvaus>") ja push `main`-haaraan.

## Välimuisti ja versiot

- Kaikissa sovelluksen sisäisissä osoitteissa on pääte `?v=__VERSION__`
  (`index.html`:n CSS ja JS sekä jokainen `import`). Julkaisu-workflow korvaa
  sen commitin tunnisteella, jotta puhelimen selain ei sekoita vanhoja ja uusia
  tiedostoja. **Lisää pääte jokaiseen uuteen `import`-riviin.** Käytä samaa
  päätettä kaikkialla, jotta moduuli ladataan vain kerran.
- Jos sovellus ei käynnisty 4 sekunnissa, `index.html` näyttää Päivitä-painikkeen.
- Sovelluksessa ei ole PIN-koodia, eikä sitä tarvita. Repo on julkinen, joten
  älä lisää henkilötietoja.

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

# Sanojen lisääminen

Sanat ovat tiedostossa [`src/data/words.json`](../src/data/words.json).

## Helpoin tapa: pyydä Claudea

Kirjoita Claudelle esimerkiksi:

> Lisää uusi sanalista "Kappale 4" näillä sanoilla:
> koira - en hund
> kissa - en katt

Voit myös lähettää kuvan kirjan sanastosivusta. Claude lisää sanat, tarkistaa
tiedoston ja julkaisee muutoksen.

## Käsin GitHubin verkkosivulla

1. Avaa https://github.com/laurakemp/ruotsin-sanat/blob/main/src/data/words.json
2. Paina kynän kuvaa (Edit this file).
3. Lisää sanat samaan muotoon kuin muut:
   ```json
   { "fi": "koira", "sv": "en hund" },
   ```
   Huomaa pilkku rivin lopussa. Listan viimeisen sanan perään ei tule pilkkua.
4. Paina **Commit changes** ja kirjoita lyhyt kuvaus, esim. "Lisää kappaleen 4 sanat".
5. Noin minuutin kuluttua uudet sanat näkyvät sovelluksessa.

Jos tiedostossa on virhe, julkaisu ei mene läpi. Vanha versio jää silloin
näkyviin, ja välilehdellä **Actions** näkyy punainen rasti ja virheen kuvaus.

## Muistettavaa

- Kirjoita ruotsin substantiiveihin artikkeli: **en** hund, **ett** hus.
- Älä lisää sanalistoihin henkilötietoja, koska repositorio on julkinen.

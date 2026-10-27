/**
 * Svarer 410 Gone paa spam-soekeparametre som ble liggende igjen paa domenet
 * fra tiden foer denne siden.
 *
 * Bakgrunn: foer siden ble lagt om i oktober 2026 fant Google flere tusen
 * oppdiktede adresser paa domenet, laget av spam. Da siden kom paa Cloudflare
 * Pages begynte alle de adressene aa svare 200 med forsiden, fordi Pages
 * ignorerer soekeparametre. Canonical-taggen gjorde at Google lot vaere aa
 * indeksere dem, men de ble staaende i Search Console og gjennomsoekt om igjen.
 *
 * 410 forteller Google at adressen er borte for godt, og da slipper den dem
 * raskere enn ved 404.
 *
 * Moensteret er hentet ut av Search Console, ikke gjettet. Av 1000 adresser
 * hadde 764 skraastrek inne i soekestrengen og resten var én bokstav fulgt
 * av et langt tall. Ingen hadde noen annen form.
 *
 * Ekte sporingsparametre har ingen av delene: utm_source, fbclid og gclid
 * har flerbokstavs navn og ingen skraastrek.
 */
const SOEPPEL = [
  /\//,                 // skraastrek inne i soekestrengen: ?item/3326620
  /^[a-z]=\d{6,}$/i,    // én bokstav og et langt tall: ?a=002039115
];

const SVAR = `<!DOCTYPE html>
<html lang="nb"><head><meta charset="utf-8">
<meta name="robots" content="noindex">
<title>Siden finnes ikke | Alfavinkel</title></head>
<body><h1>Siden finnes ikke</h1>
<p>Denne adressen har aldri hoert til Alfavinkel.</p>
<p><a href="https://alfavinkel.no/">Til forsiden</a></p>
</body></html>`;

export async function onRequest(context) {
  const soek = new URL(context.request.url).search.slice(1);

  if (soek && SOEPPEL.some((m) => m.test(soek))) {
    return new Response(SVAR, {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return context.next();
}

const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

async function generarFeed() {
  try {
    const targetUrl = 'https://www.tycsports.com/agenda-deportiva-hoy.html';

    const feed = new RSS({
      title: 'Agenda Deportiva TyC Sports',
      description: 'Partidos de hoy, horarios y canales de televisión transmitidos por TyC Sports',
      feed_url: 'https://ejemplo.com/feed.xml',
      site_url: targetUrl,
      language: 'es',
    });

    const { data } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    });

    const $ = cheerio.load(data);

    $('.agenda-item, .card-agenda, .item-partido, li').each((index, element) => {
      const textoCompleto = $(element).text().trim();

      if (textoCompleto.includes('VS') || textoCompleto.includes('vs.') || textoCompleto.includes('HS')) {
        const partido = $(element).find('.title, .equipos, .partido, h3, a').first().text().trim() || textoCompleto.split('\n')[0];
        const hora = $(element).find('.time, .hora, .hs').text().trim() || 'Horario a confirmar';
        const canal = $(element).find('.channel, .canal, .tv').text().trim() || 'Ver transmisión en TyC Sports / TV';

        if (partido && partido.length > 3) {
          feed.item({
            title: partido.replace(/\s+/g, ' '),
            description: `<b>Horario:</b> ${hora}<br><b>Canal / Detalle:</b> ${canal}<br><b>Fuente:</b> TyC Sports`,
            url: targetUrl,
            date: new Date(),
            guid: `${partido}-${hora}`.replace(/\s+/g, '-')
          });
        }
      }
    });

    const xml = feed.xml({ indent: true });
    fs.writeFileSync('feed.xml', xml);
    console.log('¡Feed RSS de TyC Sports generado con éxito en feed.xml!');

  } catch (error) {
    console.error('Error al obtener la agenda de TyC Sports:', error.message);
    process.exit(1);
  }
}

generarFeed();
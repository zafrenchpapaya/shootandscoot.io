const boards = {
  tier1: {
    read: '6aa9c9608f40bb15a8830fb1',
    write: 'l4wz18VoLk-xy3rJZrx3IwPmVxp1-oXE-tPZw39InUGA'
  },
  tier2: {
    read: '6aa9cbc78f40bb15a8831874',
    write: '8FJXZaIybkixLRq1zEZCygUfygvjxn002AIa8Ed83l8Q'
  },
  tier3: {
    read: '6aa9cbdd8f40bb15a88318f7',
    write: 'l4mGhDbUX0W9wzI1OSu6Gg_P7yyiu0rke7Fx151aLttQ'
  },
  helicopters: {
    read: '6aa9cbf38f40bb15a883196f',
    write: 'uZeYhNp65kSWW0-Z7_MHXAsFro67hUk0Ko9_YkiXhhzQ'
  },
  atlas: {
    read: '6aa9cc0b8f40bb15a88319bd',
    write: 'l7Q-gpc_d0ilSvKcZD1R_Au2IyHXjZqk6RwJW5r4wlyQ'
  }
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
});

exports.handler = async event => {
  const params = event.queryStringParameters || {};
  const board = boards[params.board];
  if (!board) return json(400, { error: 'Unknown leaderboard.' });

  if (event.httpMethod === 'GET') {
    const response = await fetch(`http://dreamlo.com/lb/${board.read}/json/50`);
    if (!response.ok) return json(502, { error: 'Dreamlo read failed.' });
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      body: await response.text()
    };
  }

  if (event.httpMethod === 'POST') {
    let input;
    try {
      input = JSON.parse(event.body || '{}');
    } catch {
      return json(400, { error: 'Invalid request body.' });
    }

    const username = String(input.username || 'Player').replace(/[\\/]/g, '').slice(0, 20);
    const score = Math.floor(Number(input.score));
    if (!Number.isFinite(score) || score < 0) return json(400, { error: 'Invalid score.' });

    const url = `http://dreamlo.com/lb/${board.write}/add/${encodeURIComponent(username)}/${score}`;
    const response = await fetch(url);
    if (!response.ok) return json(502, { error: 'Dreamlo write failed.' });
    return json(200, { ok: true });
  }

  return json(405, { error: 'Method not allowed.' });
};

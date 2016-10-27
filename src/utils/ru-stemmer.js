const
  RVRE = /^(.*?[аеиоуыэюя])(.*)$/i,
  PERFECTIVEGROUND_1 = /([ая])(в|вши|вшись)$/gi,
  PERFECTIVEGROUND_2 = /(ив|ивши|ившись|ыв|ывши|ывшись)$/i,
  REFLEXIVE = /(с[яь])$/i,
  ADJECTIVE = /(ее|ие|ые|ое|ими|ыми|ей|ий|ый|ой|ем|им|ым|ом|его|ого|ему|ому|их|ых|ую|юю|ая|яя|ою|ею)$/i,
  PARTICIPLE_1 = /([ая])(ем|нн|вш|ющ|щ)$/gi,
  PARTICIPLE_2 = /(ивш|ывш|ующ)$/i,
  VERB_1 = /([ая])(ла|на|ете|йте|ли|й|л|ем|н|ло|но|ет|ют|ны|ть|ешь|нно)$/gi,
  VERB_2 = /(ила|ыла|ена|ейте|уйте|ите|или|ыли|ей|уй|ил|ыл|им|ым|ен|ило|ыло|ено|ят|ует|уют|ит|ыт|ены|ить|ыть|ишь|ую|ю)$/i,
  NOUN = /(а|ев|ов|ие|ье|е|иями|ями|ами|еи|ии|и|ией|ей|ой|ий|й|иям|ям|ием|ем|ам|ом|о|у|ах|иях|ях|ы|ь|ию|ью|ю|ия|ья|я)$/i,
  DERIVATIONAL = /.*[^аеиоуыэюя]+[аеиоуыэюя].*ость?$/i,
  DER = /ость?$/i,
  SUPERLATIVE = /(ейше|ейш)$/i,
  I = /и$/i,
  P = /ь$/i,
  NN = /нн$/i;

export default function(word) {
  word = word.replace(/ё/gi, 'e');
  const wParts = word.match(RVRE);
  if (!wParts) {
    return word;
  }
  const start = wParts[1];
  let  rv = wParts[2];
  let temp = rv.replace(PERFECTIVEGROUND_2, '');
  if (temp == rv) {
    temp = rv.replace(PERFECTIVEGROUND_1, '$1');
  }
  if (temp == rv) {
    rv = rv.replace(REFLEXIVE, '');
    temp = rv.replace(ADJECTIVE, '');
    if (temp != rv) {
      rv = temp;
      temp = rv.replace(PARTICIPLE_2, '');
      if (temp == rv) {
        rv = rv.replace(PARTICIPLE_1, '$1');
      }
    } else {
      temp = rv.replace(VERB_2, '');
      if (temp == rv) {
        temp = rv.replace(VERB_1, '$1');
      }
      if (temp == rv) {
        rv = rv.replace(NOUN, '');
      } else {
        rv = temp;
      }
    }
  } else {
    rv = temp;
  }
  rv = rv.replace(I, '');
  if (rv.match(DERIVATIONAL)) {
    rv = rv.replace(DER, '');
  }
  temp = rv.replace(P, '');
  if (temp == rv) {
    rv = rv.replace(SUPERLATIVE, '');
    rv = rv.replace(NN, 'н');
  } else {
    rv = temp;
  }
  return start + rv;
}

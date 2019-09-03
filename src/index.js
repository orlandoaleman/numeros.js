/*
numeros.js - Copyright (C) 2019, Orlando <orlando@orlandoaleman.com>
*/

!(function() {
    "use strict";

    var VERSION = '0.1.1';

    const literal = [
        { number: 0, text: "cero" },
        { number: 100, text: "cien" }
    ];

    const literales1_9 = [
        { number: 1, text: "un" },
        { number: 1, text: "una" },
        { number: 1, text: "uno" },
        { number: 2, text: "dos" },
        { number: 3, text: "tres" },
        { number: 4, text: "cuatro" },
        { number: 5, text: "cinco" },
        { number: 6, text: "seis" },
        { number: 7, text: "siete" },
        { number: 8, text: "ocho" },
        { number: 9, text: "nueve" },
    ];

    const literales10_29 = [
        { number: 10, text: "diez" },
        { number: 11, text: "once" },
        { number: 12, text: "doce" },
        { number: 13, text: "trece" },
        { number: 14, text: "catorce" },
        { number: 15, text: "quince" },
        { number: 16, text: "dieciséis" },
        { number: 17, text: "diecisiete" },
        { number: 18, text: "dieciocho" },
        { number: 19, text: "diecinueve" },
        { number: 20, text: "veinte" },
        { number: 21, text: "veintiuno" },
        { number: 22, text: "veintidós" },
        { number: 23, text: "veintitrés" },
        { number: 24, text: "veinticuatro" },
        { number: 25, text: "veinticinco" },
        { number: 26, text: "veintiséis" },
        { number: 27, text: "veintisiete" },
        { number: 28, text: "veintiocho" },
        { number: 29, text: "veintinueve" },
    ];

    // numeros30_99: literal decena [+ conector + literales1_9]
    const literalesDecena = [
        { number: 30, text: "treinta", conector: "y" },
        { number: 40, text: "cuarenta", conector: "y" },
        { number: 50, text: "cincuenta", conector: "y" },
        { number: 60, text: "sesenta", conector: "y" },
        { number: 70, text: "setenta", conector: "y" },
        { number: 80, text: "ochenta", conector: "y" },
        { number: 90, text: "noventa", conector: "y" }
    ];


    // numeros100_999: literalesCentena [+ conector + (numeros30_99|literales10_29|literales1_9) ]
    const literalesCentena = [

        { number: 100, text: "ciento" },
        { number: 200, text: "doscientos" },
        { number: 300, text: "trescientos"},
        { number: 400, text: "cuatrocientos" },
        { number: 500, text: "quinientos" },
        { number: 600, text: "seiscientos" },
        { number: 700, text: "setecientos" },
        { number: 800, text: "ochocientos" },
        { number: 900, text: "novecientos" }
    ];

    // numero1_999 = (literales1_9|literales10_29|numeros30_99|numeros100_999)
    // numero = numero2_999 + magnitud + (...otras magnitudes menores) [+ numero1_999]
    const magnitudMayor = [ // La magnitud mayor admite una menor como sufijo
        { magnitud: 1000, text: "mil" },
        { magnitud: 1000000, text: "millón" },
        { magnitud: 1000000, text: "millones" },
    ];


    function words2numbers( texto ) {
        let words = texto.replace(/\s{2,}/g, " ").split(" ");

        let i = 0;
        while( true ) {
            if ( i >= words.length) { break; }

            let r = getNumero({ words, i });
            if (!r) {
                i++;
                continue;
            }

            words.splice( i, r.i - i, r.number );
            i = r.i;
        }

        return words.join( " " );
    }


    //
    // palabra = literal => Sustitución directa
    // palabra = numero1_999 => Hay que buscar una magnitud, multiplicar y buscar una nueva magnitud
    //
    // numero1_999
    function getNumero({ words, i = 0 })  {
        let word = words[i];


        let r = literal.find(r => r.text === word);
        if ( r ) {
            // C'est finit!
            return { number: r.number, i: i+1 };
        }

        let accum = 0;
        r = magnitudMayor.find(r => r.text === word); // *Mil* novecientos...
        if ( r ) {
            accum += r.magnitud;
            i++;
            word = words[i];

            r = getNumero1_999({ words, i });
            if ( r ) {
                accum += r.number;
                i = r.i;
            }

            return { number: accum, i: i };
        }


        let magnitudRef = 1000000000000;

        while ( true ) {
            r = getNumero1_999({ words, i });

            if ( r ) {
                let next = words[r.i];
                let r_multiplicador = magnitudMayor.find(r => r.text === next);

                if (r_multiplicador && r_multiplicador.magnitud < magnitudRef ) {
                    accum = accum + r.number * r_multiplicador.magnitud;
                    magnitudRef = r_multiplicador.magnitud;
                    i = r.i + 1;
                }
                else {
                    accum += r.number;
                    i = r.i;
                    break;
                }
            }
            else {
                break;
            }
        }

        return accum === 0 ? null : { number: accum, i: i };
    }


    function getNumero1_99({ words, i = 0 })  {
        let word = words[i];

        let r = literales1_9.find(r => r.text === word);
        if ( r ) {
            return { number: r.number, i: i+1 };
        }

        r = literales10_29.find(r => r.text === word);
        if ( r ) {
            return { number: r.number, i: i+1 };
        }

        r = literalesDecena.find(r => r.text === word);
        if (r) {
            if ( words[i+1] !== r.conector ) {
                return { number: r.number, i: i+1 };
            }

            let sufijo = words[i+2];
            let r_suf = literales1_9.find(r => r.text === sufijo);
            if (!r_suf) { return { number: r.number, i: i+1 }; }

            return { number: r.number + r_suf.number, i: i+3, text: words.slice(i, i+3) };
        }

        return null;
    }


    function getNumero1_999({ words, i = 0 })  {
        let word = words[i];

        let accum = 0;

        let r = literalesCentena.find(r => r.text === word);
        if ( r ) {
            accum += r.number;
            i = i+1;
        }

        r = getNumero1_99({ words, i });
        if ( r ) {
            accum += r.number;
            i = r.i;
        }

        return accum === 0 ? null :  { number: accum, i };
    }



    if (typeof module !== 'undefined'  && typeof module.exports !== 'undefined') {
        module.exports.words2numbers = words2numbers;
    }

}).call(this);

function _bytecrc(crc, poly, n) {
    let mask = 1 << (n - 1);
    for (let _ = 0; _ < 8; _++) {
        crc = (crc & mask) ? ((crc << 1) ^ poly) : (crc << 1);
    }
    return crc & ((1 << n) - 1);
}

function _bytecrc_r(crc, poly, n) {
    crc = BigInt(crc)
    for (let _ = 0; _ < 8; _++) {
        crc = (BigInt(crc) & BigInt(1)) ? ((crc >> BigInt(1)) ^ BigInt(poly)) : (crc >> BigInt(1));
    }
    return crc & ((BigInt(1) << BigInt(n)) - BigInt(1));
}

function _mkTable(poly, n) {
    let table = [];
    for (let i = 0; i < 256; i++) {
        table.push(_bytecrc(i << (n - 8), poly, n));
    }
    return table;
}

function _mkTable_r(poly, n) {
    poly = _bitrev(poly, n);
    let table = [];
    for (let i = 0; i < 256; i++) {
        table.push(_bytecrc_r(i, poly, n));
    }
    return table;
}

function _bitrev(x, n) {
    let y = 0;
    for (let i = 0; i < n; i++) {
        y = (BigInt(y) << BigInt(1)) | (x & BigInt(1));
        x >>= BigInt(1);
    }
    return y;
}

function _crc8(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ crc];
    }
    return crc;
}

function _crc8r(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc & 0xFF)];
    }
    return crc;
}

function _crc16(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc >> 8)] ^ (crc << 8);
    }
    return crc & 0xFFFF;
}

function _crc16r(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc & 0xFF)] ^ (crc >> 8);
    }
    return crc & 0xFFFF;
}

function _crc24(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc >> 16)] ^ (crc << 8);
    }
    return crc & 0xFFFFFF;
}

function _crc24r(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc & 0xFF)] ^ (crc >> 8);
    }
    return crc & 0xFFFFFF;
}

function _crc32(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc >> 24)] ^ (crc << 8);
    }
    return crc & 0xFFFFFFFF;
}

function _crc32r(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc & 0xFF)] ^ (crc >> 8);
    }
    return crc & 0xFFFFFFFF;
}

function _crc64(data, crc, table) {
    for (let i = 0; i < data.length; i++) {
        crc = table[data[i] ^ (crc >> 56)] ^ (crc << 8);
    }
    return crc & 0xFFFFFFFFFFFFFFFFn;
}

function _crc64r(data, crc, table) {
    crc = BigInt(crc)
    for (let i = 0; i < data.length; i++) {
        crc = table[BigInt(data[i]) ^ (crc & BigInt(0xFF))] ^ (crc >> BigInt(8));
    }
    return crc & 0xFFFFFFFFFFFFFFFFn;
}

function mkCrcFun(poly, initCrc = ~0, rev = true, xorOut = 0) {
    let sizeBits = _verifyPoly(poly);
    initCrc &= (BigInt(1) << sizeBits) - BigInt(1);
    xorOut &= (BigInt(1) << sizeBits) - BigInt(1);
    let table = rev ? _mkTable_r(poly, sizeBits) : _mkTable(poly, sizeBits);
    let fun = eval(`_crc${sizeBits}${rev ? 'r' : ''}`);
    return function(data, crc = initCrc) {
        return xorOut ^ fun(data, xorOut ^ crc, table);
    };
}

function _verifyPoly(poly) {
    for (let n of [8, 16, 24, 32, 64]) {
        let lowerBound = BigInt(1) << BigInt(n);
        let upperBound = BigInt(1) << BigInt(n + 1);
        if (lowerBound <= poly && poly < upperBound) {
            return BigInt(n);
        }
    }
    throw new Error("Invalid polynomial");
}

let do_crc64 = mkCrcFun(0x142F0E1EBA9EA3693n, 0n, true, 0xFFFFFFFFFFFFFFFFn);
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function calculate_hash(file_path) {
    let crc64_signature = BigInt(0);
    const md5_hash = crypto.createHash('md5');
    const buf_size = 65536 * 16;

    const readStream = fs.createReadStream(file_path, { highWaterMark: buf_size });

    readStream.on('data', (chunk) => {
        crc64_signature = do_crc64(chunk, crc64_signature);
        md5_hash.update(chunk);
    });

    readStream.on('end', () => {
        const md5_digest = md5_hash.digest();
        const md5_str = Buffer.from(md5_digest).toString('base64');

        const hasher = crypto.createHash('sha256');
        hasher.update(`${md5_str}${crc64_signature.toString()}`);
        const hash_string = hasher.digest('hex');

        console.log(hash_string);
        return hash_string;
    });

    readStream.on('error', (err) => {
        console.error('Error reading file:', err);
        throw err;
    });
}

calculate_hash('./input.txt');

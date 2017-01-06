(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Pbf = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// lightweight Buffer shim for pbf browser build
// based on code from github.com/feross/buffer (MIT-licensed)

module.exports = Buffer;

var ieee754 = require('ieee754');

var BufferMethods;

function Buffer(length) {
    var arr;
    if (length && length.length) {
        arr = length;
        length = arr.length;
    }
    var buf = new Uint8Array(length || 0);
    if (arr) buf.set(arr);

    buf.readUInt32LE = BufferMethods.readUInt32LE;
    buf.writeUInt32LE = BufferMethods.writeUInt32LE;
    buf.readInt32LE = BufferMethods.readInt32LE;
    buf.writeInt32LE = BufferMethods.writeInt32LE;
    buf.readFloatLE = BufferMethods.readFloatLE;
    buf.writeFloatLE = BufferMethods.writeFloatLE;
    buf.readDoubleLE = BufferMethods.readDoubleLE;
    buf.writeDoubleLE = BufferMethods.writeDoubleLE;
    buf.toString = BufferMethods.toString;
    buf.write = BufferMethods.write;
    buf.slice = BufferMethods.slice;
    buf.copy = BufferMethods.copy;

    buf._isBuffer = true;
    return buf;
}

var lastStr, lastStrEncoded;

BufferMethods = {
    readUInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] * 0x1000000);
    },

    writeUInt32LE: function(val, pos) {
        this[pos] = val;
        this[pos + 1] = (val >>> 8);
        this[pos + 2] = (val >>> 16);
        this[pos + 3] = (val >>> 24);
    },

    readInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] << 24);
    },

    readFloatLE:  function(pos) { return ieee754.read(this, pos, true, 23, 4); },
    readDoubleLE: function(pos) { return ieee754.read(this, pos, true, 52, 8); },

    writeFloatLE:  function(val, pos) { return ieee754.write(this, val, pos, true, 23, 4); },
    writeDoubleLE: function(val, pos) { return ieee754.write(this, val, pos, true, 52, 8); },

    toString: function(encoding, start, end) {
        var str = '',
            tmp = '';

        start = start || 0;
        end = Math.min(this.length, end || this.length);

        for (var i = start; i < end; i++) {
            var ch = this[i];
            if (ch <= 0x7F) {
                str += decodeURIComponent(tmp) + String.fromCharCode(ch);
                tmp = '';
            } else {
                tmp += '%' + ch.toString(16);
            }
        }

        str += decodeURIComponent(tmp);

        return str;
    },

    write: function(str, pos) {
        var bytes = str === lastStr ? lastStrEncoded : encodeString(str);
        for (var i = 0; i < bytes.length; i++) {
            this[pos + i] = bytes[i];
        }
    },

    slice: function(start, end) {
        return this.subarray(start, end);
    },

    copy: function(buf, pos) {
        pos = pos || 0;
        for (var i = 0; i < this.length; i++) {
            buf[pos + i] = this[i];
        }
    }
};

BufferMethods.writeInt32LE = BufferMethods.writeUInt32LE;

Buffer.byteLength = function(str) {
    lastStr = str;
    lastStrEncoded = encodeString(str);
    return lastStrEncoded.length;
};

Buffer.isBuffer = function(buf) {
    return !!(buf && buf._isBuffer);
};

function encodeString(str) {
    var length = str.length,
        bytes = [];

    for (var i = 0, c, lead; i < length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {

            if (lead) {
                if (c < 0xDC00) {
                    bytes.push(0xEF, 0xBF, 0xBD);
                    lead = c;
                    continue;

                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }

            } else {
                if (c > 0xDBFF || (i + 1 === length)) bytes.push(0xEF, 0xBF, 0xBD);
                else lead = c;

                continue;
            }

        } else if (lead) {
            bytes.push(0xEF, 0xBF, 0xBD);
            lead = null;
        }

        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) bytes.push(c >> 0x6 | 0xC0, c & 0x3F | 0x80);
        else if (c < 0x10000) bytes.push(c >> 0xC | 0xE0, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
        else bytes.push(c >> 0x12 | 0xF0, c >> 0xC & 0x3F | 0x80, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
    }
    return bytes;
}

},{"ieee754":3}],2:[function(require,module,exports){
(function (global){
'use strict';

module.exports = Pbf;

var Buffer = global.Buffer || require('./buffer');

function Pbf(buf) {
    this.buf = !Buffer.isBuffer(buf) ? new Buffer(buf || 0) : buf;
    this.pos = 0;
    this.length = this.buf.length;
}

Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32,
    POW_2_63 = Math.pow(2, 63);

Pbf.prototype = {

    destroy: function() {
        this.buf = null;
    },

    // === READING =================================================================

    readFields: function(readField, result, end) {
        end = end || this.length;

        while (this.pos < end) {
            var val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    },

    readMessage: function(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    },

    readFixed32: function() {
        var val = this.buf.readUInt32LE(this.pos);
        this.pos += 4;
        return val;
    },

    readSFixed32: function() {
        var val = this.buf.readInt32LE(this.pos);
        this.pos += 4;
        return val;
    },

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64: function() {
        var val = this.buf.readUInt32LE(this.pos) + this.buf.readUInt32LE(this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readSFixed64: function() {
        var val = this.buf.readUInt32LE(this.pos) + this.buf.readInt32LE(this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readFloat: function() {
        var val = this.buf.readFloatLE(this.pos);
        this.pos += 4;
        return val;
    },

    readDouble: function() {
        var val = this.buf.readDoubleLE(this.pos);
        this.pos += 8;
        return val;
    },

    readVarint: function() {
        var buf = this.buf,
            val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;

        return readVarintRemainder(val, this);
    },

    readVarint64: function() {
        var startPos = this.pos,
            val = this.readVarint();

        if (val < POW_2_63) return val;

        var pos = this.pos - 2;
        while (this.buf[pos] === 0xff) pos--;
        if (pos < startPos) pos = startPos;

        val = 0;
        for (var i = 0; i < pos - startPos + 1; i++) {
            var b = ~this.buf[startPos + i] & 0x7f;
            val += i < 4 ? b << i * 7 : b * Math.pow(2, i * 7);
        }

        return -val - 1;
    },

    readSVarint: function() {
        var num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    },

    readBoolean: function() {
        return Boolean(this.readVarint());
    },

    readString: function() {
        var end = this.readVarint() + this.pos,
            str = this.buf.toString('utf8', this.pos, end);
        this.pos = end;
        return str;
    },

    readBytes: function() {
        var end = this.readVarint() + this.pos,
            buffer = this.buf.slice(this.pos, end);
        this.pos = end;
        return buffer;
    },

    // verbose for performance reasons; doesn't affect gzipped size

    readPackedVarint: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readVarint());
        return arr;
    },
    readPackedSVarint: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    },
    readPackedBoolean: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    },
    readPackedFloat: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    },
    readPackedDouble: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    },
    readPackedFixed32: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    },
    readPackedSFixed32: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    },
    readPackedFixed64: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    },
    readPackedSFixed64: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    },

    skip: function(val) {
        var type = val & 0x7;
        if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
        else if (type === Pbf.Fixed32) this.pos += 4;
        else if (type === Pbf.Fixed64) this.pos += 8;
        else throw new Error('Unimplemented type: ' + type);
    },

    // === WRITING =================================================================

    writeTag: function(tag, type) {
        this.writeVarint((tag << 3) | type);
    },

    realloc: function(min) {
        var length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            var buf = new Buffer(length);
            this.buf.copy(buf);
            this.buf = buf;
            this.length = length;
        }
    },

    finish: function() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.slice(0, this.length);
    },

    writeFixed32: function(val) {
        this.realloc(4);
        this.buf.writeUInt32LE(val, this.pos);
        this.pos += 4;
    },

    writeSFixed32: function(val) {
        this.realloc(4);
        this.buf.writeInt32LE(val, this.pos);
        this.pos += 4;
    },

    writeFixed64: function(val) {
        this.realloc(8);
        this.buf.writeInt32LE(val & -1, this.pos);
        this.buf.writeUInt32LE(Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeSFixed64: function(val) {
        this.realloc(8);
        this.buf.writeInt32LE(val & -1, this.pos);
        this.buf.writeInt32LE(Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeVarint: function(val) {
        val = +val;

        if (val > 0xfffffff) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    },

    writeSVarint: function(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    },

    writeBoolean: function(val) {
        this.writeVarint(Boolean(val));
    },

    writeString: function(str) {
        str = String(str);
        var bytes = Buffer.byteLength(str);
        this.writeVarint(bytes);
        this.realloc(bytes);
        this.buf.write(str, this.pos);
        this.pos += bytes;
    },

    writeFloat: function(val) {
        this.realloc(4);
        this.buf.writeFloatLE(val, this.pos);
        this.pos += 4;
    },

    writeDouble: function(val) {
        this.realloc(8);
        this.buf.writeDoubleLE(val, this.pos);
        this.pos += 8;
    },

    writeBytes: function(buffer) {
        var len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    },

    writeRawMessage: function(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        var startPos = this.pos;
        fn(obj, this);
        var len = this.pos - startPos;

        if (len >= 0x80) reallocForRawMessage(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeMessage: function(tag, fn, obj) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeRawMessage(fn, obj);
    },

    writePackedVarint:   function(tag, arr) { this.writeMessage(tag, writePackedVarint, arr);   },
    writePackedSVarint:  function(tag, arr) { this.writeMessage(tag, writePackedSVarint, arr);  },
    writePackedBoolean:  function(tag, arr) { this.writeMessage(tag, writePackedBoolean, arr);  },
    writePackedFloat:    function(tag, arr) { this.writeMessage(tag, writePackedFloat, arr);    },
    writePackedDouble:   function(tag, arr) { this.writeMessage(tag, writePackedDouble, arr);   },
    writePackedFixed32:  function(tag, arr) { this.writeMessage(tag, writePackedFixed32, arr);  },
    writePackedSFixed32: function(tag, arr) { this.writeMessage(tag, writePackedSFixed32, arr); },
    writePackedFixed64:  function(tag, arr) { this.writeMessage(tag, writePackedFixed64, arr);  },
    writePackedSFixed64: function(tag, arr) { this.writeMessage(tag, writePackedSFixed64, arr); },

    writeBytesField: function(tag, buffer) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeBytes(buffer);
    },
    writeFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFixed32(val);
    },
    writeSFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeSFixed32(val);
    },
    writeFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeFixed64(val);
    },
    writeSFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeSFixed64(val);
    },
    writeVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeVarint(val);
    },
    writeSVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeSVarint(val);
    },
    writeStringField: function(tag, str) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeString(str);
    },
    writeFloatField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFloat(val);
    },
    writeDoubleField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeDouble(val);
    },
    writeBooleanField: function(tag, val) {
        this.writeVarintField(tag, Boolean(val));
    }
};

function readVarintRemainder(val, pbf) {
    var buf = pbf.buf, b;

    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x10000000;         if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x800000000;        if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x40000000000;      if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x2000000000000;    if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x100000000000000;  if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x8000000000000000; if (b < 0x80) return val;

    throw new Error('Expected varint not more than 10 bytes');
}

function writeBigVarint(val, pbf) {
    pbf.realloc(10);

    var maxPos = pbf.pos + 10;

    while (val >= 1) {
        if (pbf.pos >= maxPos) throw new Error('Given varint doesn\'t fit into 10 bytes');
        var b = val & 0xff;
        pbf.buf[pbf.pos++] = b | (val >= 0x80 ? 0x80 : 0);
        val /= 0x80;
    }
}

function reallocForRawMessage(startPos, len, pbf) {
    var extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.ceil(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./buffer":1}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}]},{},[2])(2)
});


(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vectorTile = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports.VectorTile = require('./lib/vectortile.js');
module.exports.VectorTileFeature = require('./lib/vectortilefeature.js');
module.exports.VectorTileLayer = require('./lib/vectortilelayer.js');

},{"./lib/vectortile.js":2,"./lib/vectortilefeature.js":3,"./lib/vectortilelayer.js":4}],2:[function(require,module,exports){
'use strict';

var VectorTileLayer = require('./vectortilelayer');

module.exports = VectorTile;

function VectorTile(pbf, end) {
    this.layers = pbf.readFields(readTile, {}, end);
}

function readTile(tag, layers, pbf) {
    if (tag === 3) {
        var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer.name] = layer;
    }
}


},{"./vectortilelayer":4}],3:[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = VectorTileFeature;

function VectorTileFeature(pbf, end, extent, keys, values) {
    // Public
    this.properties = {};
    this.extent = extent;
    this.type = 0;

    // Private
    this._pbf = pbf;
    this._geometry = -1;
    this._keys = keys;
    this._values = values;

    pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
    if (tag == 1) feature.id = pbf.readVarint();
    else if (tag == 2) readTag(pbf, feature);
    else if (tag == 3) feature.type = pbf.readVarint();
    else if (tag == 4) feature._geometry = pbf.pos;
}

function readTag(pbf, feature) {
    var end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var key = feature._keys[pbf.readVarint()],
            value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (line) lines.push(line);
                line = [];
            }

            line.push(new Point(x, y));

        } else if (cmd === 7) {

            // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
            if (line) {
                line.push(line[0].clone()); // closePolygon
            }

        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
    var size = this.extent * Math.pow(2, z),
        x0 = this.extent * x,
        y0 = this.extent * y,
        coords = this.loadGeometry(),
        type = VectorTileFeature.types[this.type],
        i, j;

    function project(line) {
        for (var j = 0; j < line.length; j++) {
            var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
            line[j] = [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
        }
    }

    switch (this.type) {
    case 1:
        var points = [];
        for (i = 0; i < coords.length; i++) {
            points[i] = coords[i][0];
        }
        coords = points;
        project(coords);
        break;

    case 2:
        for (i = 0; i < coords.length; i++) {
            project(coords[i]);
        }
        break;

    case 3:
        coords = classifyRings(coords);
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
            }
        }
        break;
    }

    if (coords.length === 1) {
        coords = coords[0];
    } else {
        type = 'Multi' + type;
    }

    var result = {
        type: "Feature",
        geometry: {
            type: type,
            coordinates: coords
        },
        properties: this.properties
    };

    if ('id' in this) {
        result.id = this.id;
    }

    return result;
};

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
    var len = rings.length;

    if (len <= 1) return [rings];

    var polygons = [],
        polygon,
        ccw;

    for (var i = 0; i < len; i++) {
        var area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

},{"point-geometry":5}],4:[function(require,module,exports){
'use strict';

var VectorTileFeature = require('./vectortilefeature.js');

module.exports = VectorTileLayer;

function VectorTileLayer(pbf, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._pbf = pbf;
    this._keys = [];
    this._values = [];
    this._features = [];

    pbf.readFields(readLayer, this, end);

    this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    else if (tag === 2) layer._features.push(pbf.pos);
    else if (tag === 3) layer._keys.push(pbf.readString());
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
    var value = null,
        end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }

    return value;
}

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._pbf.pos = this._features[i];

    var end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
};

},{"./vectortilefeature.js":3}],5:[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function() { return new Point(this.x, this.y); },

    add:     function(p) { return this.clone()._add(p);     },
    sub:     function(p) { return this.clone()._sub(p);     },
    mult:    function(k) { return this.clone()._mult(k);    },
    div:     function(k) { return this.clone()._div(k);     },
    rotate:  function(a) { return this.clone()._rotate(a);  },
    matMult: function(m) { return this.clone()._matMult(m); },
    unit:    function() { return this.clone()._unit(); },
    perp:    function() { return this.clone()._perp(); },
    round:   function() { return this.clone()._round(); },

    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function(p) {
        return this.x === p.x &&
               this.y === p.y;
    },

    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}]},{},[1])(1)
});




L.SVG.Tile = L.SVG.extend({

	initialize: function (tileCoord, tileSize, options) {
		L.SVG.prototype.initialize.call(this, options);
		this._size = tileSize;

		this._initContainer();
		this._container.setAttribute('width', this._size.x);
		this._container.setAttribute('height', this._size.y);
		this._container.setAttribute('viewBox', [0, 0, this._size.x, this._size.y].join(' '));

		if (options.interactive) {
			// By default, Leaflet tiles do not have pointer events
		    this._container.style.pointerEvents = 'auto';
		}
		this._layers = {};
	},

	getCoord: function() {
		return this._tileCoord;
	},

	getContainer: function() {
		return this._container;
	},

	onAdd: L.Util.falseFn,

	addTo: function(map) {
		var this$1 = this;

		this._map = map;
		if (this.options.interactive) {
			for (var i in this._layers) {
				var layer = this$1._layers[i];
				this$1._map._targets[L.stamp(layer._path)] = layer;
			}
		}
	},

	_initContainer: function() {
		L.SVG.prototype._initContainer.call(this);
		var rect =  L.SVG.create('rect');
	},

	/// TODO: Modify _initPath to include an extra parameter, a group name
	/// to order symbolizers by z-index

	_addPath: function (layer) {
		this._rootGroup.appendChild(layer._path);
		this._layers[L.stamp(layer)] = layer;
	},

});


L.svg.tile = function(tileCoord, tileSize, opts){
	return new L.SVG.Tile(tileCoord, tileSize, opts);
}




L.Canvas.Tile = L.Canvas.extend({

	initialize: function (tileCoord, tileSize, options) {
		L.Canvas.prototype.initialize.call(this, options);
		this._tileCoord = tileCoord;
		this._size = tileSize;
        this._drawing = true;
		this._initContainer();
		this._container.setAttribute('width', this._size.x);
		this._container.setAttribute('height', this._size.y);
		this._layers = {};
		this._drawnLayers = {};

		if (options.interactive) {
			// By default, Leaflet tiles do not have pointer events
		    this._container.style.pointerEvents = 'auto';
		}
	},

	getCoord: function() {
		return this._tileCoord;
	},

	getContainer: function() {
		return this._container;
	},

	getOffset: function() {
		return this._tileCoord.scaleBy(this._size).subtract(this._map.getPixelOrigin());
	},

	onAdd: L.Util.falseFn,

	addTo: function(map) {
		this._map = map;
	},

	_onClick: function (e) {
		var this$1 = this;

		var point = this._map.mouseEventToLayerPoint(e).subtract(this.getOffset()), layers = [], layer;

		for (var id in this._layers) {
			layer = this$1._layers[id];
			if (layer.options.interactive && layer._containsPoint(point) && !this$1._map._draggableMoved(layer)) {
				L.DomEvent._fakeStop(e);
				layers.push(layer);
			}
		}
		if (layers.length)  {
			this._fireEvent(layers, e);
		}
	},

	_onMouseMove: function (e) {
		if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) { return; }

		var point = this._map.mouseEventToLayerPoint(e).subtract(this.getOffset());
		this._handleMouseOut(e, point);
		this._handleMouseHover(e, point);
	},

	/// TODO: Modify _initPath to include an extra parameter, a group name
	/// to order symbolizers by z-index

});


L.canvas.tile = function(tileCoord, tileSize, opts){
	return new L.Canvas.Tile(tileCoord, tileSize, opts);
}




L.VectorGrid = L.GridLayer.extend({

	options: {
		rendererFactory: L.svg.tile,
		vectorTileLayerStyles: {},
		interactive: false,
	},

	initialize: function() {
		L.GridLayer.prototype.initialize.apply(this, arguments);
		if (this.options.getFeatureId) {
			this._vectorTiles = {};
			this.on('tileunload', function(e) {
				delete this._vectorTiles[this._tileCoordsToKey(e.coords)];
			}, this);
		}
	},

	createTile: function(coords, done) {
		var storeFeatures = this.options.getFeatureId;

		var tileSize = this.getTileSize();
		var renderer = this.options.rendererFactory(coords, tileSize, this.options);

		var vectorTilePromise = this._getVectorTilePromise(coords);

		if (storeFeatures) {
			this._vectorTiles[this._tileCoordsToKey(coords)] = renderer;
			renderer._features = {};
		}

		vectorTilePromise.then( function renderTile(vectorTile) {
			var this$1 = this;

			for (var layerName in vectorTile.layers) {
				var layer = vectorTile.layers[layerName];

				/// NOTE: THIS ASSUMES SQUARE TILES!!!!!1!
				var pxPerExtent = this$1.getTileSize().x / layer.extent;

				var layerStyle = this$1.options.vectorTileLayerStyles[ layerName ] ||
				L.Path.prototype.options;

				for (var i in layer.features) {
					var feat = layer.features[i];

					var styleOptions = (layerStyle instanceof Function) ?
					layerStyle(feat.properties, coords.z) :
					layerStyle;

					if (!(styleOptions instanceof Array)) {
						styleOptions = [styleOptions];
					}

					if (!styleOptions.length) {
						continue;
					}

					var featureLayer = this$1._createLayer(feat, pxPerExtent);

					for (var j in styleOptions) {
						var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);
						featureLayer.render(renderer, style);
						renderer._addPath(featureLayer);
					}

					if (this$1.options.interactive) {
						featureLayer.makeInteractive();
					}

					if (storeFeatures) {
						var id = this$1.options.getFeatureId(feat);

						renderer._features[id] = {
							layerName: layerName,
							feature: featureLayer
						};
					}
				}

			}
			renderer.addTo(this._map);
			L.Util.requestAnimFrame(done.bind(coords, null, null));
		}.bind(this));

		return renderer.getContainer();
	},

	setFeatureStyle: function(id, layerStyle) {
		var this$1 = this;

		for (var tileKey in this._vectorTiles) {
			var tile = this$1._vectorTiles[tileKey];
			var features = tile._features;
			var data = features[id];
			if (data) {
				var feat = data.feature;
				var styleOptions = (layerStyle instanceof Function) ?
				layerStyle(feat.properties, featureData.zoom) :
				layerStyle;
				this$1._updateStyles(feat, tile, styleOptions);
			}
		}
	},

	resetFeatureStyle: function(id) {
		var this$1 = this;

		for (var tileKey in this._vectorTiles) {
			var tile = this$1._vectorTiles[tileKey];
			var features = tile._features;
			var data = features[id];
			if (data) {
				var feat = data.feature;
				var layerStyle = this$1.options.vectorTileLayerStyles[ data.layerName ] ||
				L.Path.prototype.options;
				var styleOptions = (layerStyle instanceof Function) ?
				layerStyle(feat.properties, tile.getCoord().z) :
				layerStyle;
				this$1._updateStyles(feat, tile, styleOptions);
			}
		}
	},

	_updateStyles: function(feat, renderer, styleOptions) {
		if (!(styleOptions instanceof Array)) {
			styleOptions = [styleOptions];
		}

		for (var j in styleOptions) {
			var style = L.extend({}, L.Path.prototype.options, styleOptions[j]);
			feat.updateStyle(renderer, style);
		}
	},

	_createLayer: function(feat, pxPerExtent, layerStyle) {
		var layerFactory;
		switch (feat.type) {
		case 1:
			layer = new PointLayer(feat, pxPerExtent, this.options.interactive);
			break;
		case 2:
			layer = new PolylineLayer(feat, pxPerExtent, this.options.interactive);
			break;
		case 3:
			layer = new PolygonLayer(feat, pxPerExtent, this.options.interactive);
			break;
		}

		if (this.options.interactive) {
			layer.addEventParent(this);
		}

		return layer;
	},
});

L.vectorGrid = function (options) {
	return new L.VectorGrid(options);
};

var FeatureLayer = L.Class.extend({
	render: function(renderer, style) {
		this._renderer = renderer;
		this.options = style;
		renderer._initPath(this);
		renderer._updateStyle(this);
	},

	updateStyle: function(renderer, style) {
		this.options = style;
		renderer._updateStyle(this);
	},

	_getPixelBounds: function() {
		var parts = this._parts;
		var bounds = L.bounds([]);
		for (var i = 0; i < parts.length; i++) {
			var part = parts[i];
			for (var j = 0; j < part.length; j++) {
				bounds.extend(part[j]);
			}
		}

		var w = this._clickTolerance(),
		    p = new L.Point(w, w);

		bounds.min._subtract(p);
		bounds.max._add(p);

		return bounds;
	},
	_clickTolerance: L.Path.prototype._clickTolerance,
});

var PointLayer = L.CircleMarker.extend({
	includes: FeatureLayer.prototype,

	initialize: function(feature, pxPerExtent) {
		this.properties = feature.properties;
		this._makeFeatureParts(feature, pxPerExtent);
	},

	render: function(renderer, style) {
		FeatureLayer.prototype.render.call(this, renderer, style);
		this._radius = style.radius;
		this._updatePath();
	},

	_makeFeatureParts: function(feat, pxPerExtent) {
		coord = feat.geometry[0][0];
		if ('x' in coord) {
			this._point = L.point(coord.x * pxPerExtent, coord.y * pxPerExtent);
			this._empty = L.Util.falseFn;
		}
	},
	makeInteractive: function() {
		var r = this._radius,
		    r2 = this._radiusY || r,
		    w = this._clickTolerance(),
		    p = [r + w, r2 + w];
		this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
	}
});

var polyBase = {
	_makeFeatureParts: function(feat, pxPerExtent) {
		var this$1 = this;

		var rings = feat.geometry;

		this._parts = [];
		for (var i in rings) {
			var ring = rings[i];
			var part = [];
			for (var j in ring) {
				coord = ring[j];
				if ('x' in coord) {
					// Protobuf vector tiles return {x: , y:}
					part.push(L.point(coord.x * pxPerExtent, coord.y * pxPerExtent));
				} else {
					// Geojson-vt returns [,]
					part.push(L.point(coord[0] * pxPerExtent, coord[1] * pxPerExtent));
				}
			}
			this$1._parts.push(part);
		}
	},

	makeInteractive: function() {
		this._pxBounds = this._getPixelBounds();
	}
};

var PolylineLayer = L.Polyline.extend({
	includes: [FeatureLayer.prototype, polyBase],

	initialize: function(feature, pxPerExtent) {
		this.properties = feature.properties;
		this._makeFeatureParts(feature, pxPerExtent);
	},

	render: function(renderer, style) {
		style.fill = false;
		FeatureLayer.prototype.render.call(this, renderer, style);
		this._updatePath();
	},

	updateStyle: function(renderer, style) {
		style.fill = false;
		FeatureLayer.prototype.updateStyle.call(this, renderer, style);
	},
});

var PolygonLayer = L.Polygon.extend({
	includes: [FeatureLayer.prototype, polyBase],

	initialize: function(feature, pxPerExtent) {
		this.properties = feature.properties;
		this._makeFeatureParts(feature, pxPerExtent);
	},

	render: function(renderer, style) {
		FeatureLayer.prototype.render.call(this, renderer, style);
		this._updatePath();
	}
});




L.VectorGrid.Slicer = L.VectorGrid.extend({

	options: {
		vectorTileLayerName: 'sliced',
		extent: 4096,	// Default for geojson-vt
		maxZoom: 18,  	// Default for geojson-vt
        tolerance: 10,
        indexMaxZoom: 2,        // max zoom in the initial tile index
        indexMaxPoints: 50000 // max number of points per tile in the index
    },

	initialize: function(geojson, options) {
		var this$1 = this;

		L.VectorGrid.prototype.initialize.call(this, options);

		// Slice the geojson/topojson via a web worker
		var workerCode = "\n\t\t\t(function(f){if(typeof exports===\"object\"&&typeof module!==\"undefined\"){module.exports=f()}else if(typeof define===\"function\"&&define.amd){define([],f)}else{var g;if(typeof window!==\"undefined\"){g=window}else if(typeof global!==\"undefined\"){g=global}else if(typeof self!==\"undefined\"){g=self}else{g=this}g.geojsonvt = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require==\"function\"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error(\"Cannot find module '\"+o+\"'\");throw f.code=\"MODULE_NOT_FOUND\",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require==\"function\"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n'use strict';\n\nmodule.exports = clip;\n\nvar createFeature = require('./feature');\n\n/* clip features between two axis-parallel lines:\n *     |        |\n *  ___|___     |     /\n * /   |   ____|____/\n *     |        |\n */\n\nfunction clip(features, scale, k1, k2, axis, intersect, minAll, maxAll) {\n\n    k1 /= scale;\n    k2 /= scale;\n\n    if (minAll >= k1 && maxAll <= k2) return features; // trivial accept\n    else if (minAll > k2 || maxAll < k1) return null; // trivial reject\n\n    var clipped = [];\n\n    for (var i = 0; i < features.length; i++) {\n\n        var feature = features[i],\n            geometry = feature.geometry,\n            type = feature.type,\n            min, max;\n\n        min = feature.min[axis];\n        max = feature.max[axis];\n\n        if (min >= k1 && max <= k2) { // trivial accept\n            clipped.push(feature);\n            continue;\n        } else if (min > k2 || max < k1) continue; // trivial reject\n\n        var slices = type === 1 ?\n                clipPoints(geometry, k1, k2, axis) :\n                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);\n\n        if (slices.length) {\n            // if a feature got clipped, it will likely get clipped on the next zoom level as well,\n            // so there's no need to recalculate bboxes\n            clipped.push(createFeature(feature.tags, type, slices, feature.id));\n        }\n    }\n\n    return clipped.length ? clipped : null;\n}\n\nfunction clipPoints(geometry, k1, k2, axis) {\n    var slice = [];\n\n    for (var i = 0; i < geometry.length; i++) {\n        var a = geometry[i],\n            ak = a[axis];\n\n        if (ak >= k1 && ak <= k2) slice.push(a);\n    }\n    return slice;\n}\n\nfunction clipGeometry(geometry, k1, k2, axis, intersect, closed) {\n\n    var slices = [];\n\n    for (var i = 0; i < geometry.length; i++) {\n\n        var ak = 0,\n            bk = 0,\n            b = null,\n            points = geometry[i],\n            area = points.area,\n            dist = points.dist,\n            outer = points.outer,\n            len = points.length,\n            a, j, last;\n\n        var slice = [];\n\n        for (j = 0; j < len - 1; j++) {\n            a = b || points[j];\n            b = points[j + 1];\n            ak = bk || a[axis];\n            bk = b[axis];\n\n            if (ak < k1) {\n\n                if ((bk > k2)) { // ---|-----|-->\n                    slice.push(intersect(a, b, k1), intersect(a, b, k2));\n                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);\n\n                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |\n\n            } else if (ak > k2) {\n\n                if ((bk < k1)) { // <--|-----|---\n                    slice.push(intersect(a, b, k2), intersect(a, b, k1));\n                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);\n\n                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---\n\n            } else {\n\n                slice.push(a);\n\n                if (bk < k1) { // <--|---  |\n                    slice.push(intersect(a, b, k1));\n                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);\n\n                } else if (bk > k2) { // |  ---|-->\n                    slice.push(intersect(a, b, k2));\n                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);\n                }\n                // | --> |\n            }\n        }\n\n        // add the last point\n        a = points[len - 1];\n        ak = a[axis];\n        if (ak >= k1 && ak <= k2) slice.push(a);\n\n        // close the polygon if its endpoints are not the same after clipping\n\n        last = slice[slice.length - 1];\n        if (closed && last && (slice[0][0] !== last[0] || slice[0][1] !== last[1])) slice.push(slice[0]);\n\n        // add the final slice\n        newSlice(slices, slice, area, dist, outer);\n    }\n\n    return slices;\n}\n\nfunction newSlice(slices, slice, area, dist, outer) {\n    if (slice.length) {\n        // we don't recalculate the area/length of the unclipped geometry because the case where it goes\n        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work\n        slice.area = area;\n        slice.dist = dist;\n        if (outer !== undefined) slice.outer = outer;\n\n        slices.push(slice);\n    }\n    return [];\n}\n\n},{\"./feature\":3}],2:[function(require,module,exports){\n'use strict';\n\nmodule.exports = convert;\n\nvar simplify = require('./simplify');\nvar createFeature = require('./feature');\n\n// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data\n\nfunction convert(data, tolerance) {\n    var features = [];\n\n    if (data.type === 'FeatureCollection') {\n        for (var i = 0; i < data.features.length; i++) {\n            convertFeature(features, data.features[i], tolerance);\n        }\n    } else if (data.type === 'Feature') {\n        convertFeature(features, data, tolerance);\n\n    } else {\n        // single geometry or a geometry collection\n        convertFeature(features, {geometry: data}, tolerance);\n    }\n    return features;\n}\n\nfunction convertFeature(features, feature, tolerance) {\n    if (feature.geometry === null) {\n        // ignore features with null geometry\n        return;\n    }\n\n    var geom = feature.geometry,\n        type = geom.type,\n        coords = geom.coordinates,\n        tags = feature.properties,\n        id = feature.id,\n        i, j, rings, projectedRing;\n\n    if (type === 'Point') {\n        features.push(createFeature(tags, 1, [projectPoint(coords)], id));\n\n    } else if (type === 'MultiPoint') {\n        features.push(createFeature(tags, 1, project(coords), id));\n\n    } else if (type === 'LineString') {\n        features.push(createFeature(tags, 2, [project(coords, tolerance)], id));\n\n    } else if (type === 'MultiLineString' || type === 'Polygon') {\n        rings = [];\n        for (i = 0; i < coords.length; i++) {\n            projectedRing = project(coords[i], tolerance);\n            if (type === 'Polygon') projectedRing.outer = (i === 0);\n            rings.push(projectedRing);\n        }\n        features.push(createFeature(tags, type === 'Polygon' ? 3 : 2, rings, id));\n\n    } else if (type === 'MultiPolygon') {\n        rings = [];\n        for (i = 0; i < coords.length; i++) {\n            for (j = 0; j < coords[i].length; j++) {\n                projectedRing = project(coords[i][j], tolerance);\n                projectedRing.outer = (j === 0);\n                rings.push(projectedRing);\n            }\n        }\n        features.push(createFeature(tags, 3, rings, id));\n\n    } else if (type === 'GeometryCollection') {\n        for (i = 0; i < geom.geometries.length; i++) {\n            convertFeature(features, {\n                geometry: geom.geometries[i],\n                properties: tags\n            }, tolerance);\n        }\n\n    } else {\n        throw new Error('Input data is not a valid GeoJSON object.');\n    }\n}\n\nfunction project(lonlats, tolerance) {\n    var projected = [];\n    for (var i = 0; i < lonlats.length; i++) {\n        projected.push(projectPoint(lonlats[i]));\n    }\n    if (tolerance) {\n        simplify(projected, tolerance);\n        calcSize(projected);\n    }\n    return projected;\n}\n\nfunction projectPoint(p) {\n    var sin = Math.sin(p[1] * Math.PI / 180),\n        x = (p[0] / 360 + 0.5),\n        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);\n\n    y = y < 0 ? 0 :\n        y > 1 ? 1 : y;\n\n    return [x, y, 0];\n}\n\n// calculate area and length of the poly\nfunction calcSize(points) {\n    var area = 0,\n        dist = 0;\n\n    for (var i = 0, a, b; i < points.length - 1; i++) {\n        a = b || points[i];\n        b = points[i + 1];\n\n        area += a[0] * b[1] - b[0] * a[1];\n\n        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation\n        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);\n    }\n    points.area = Math.abs(area / 2);\n    points.dist = dist;\n}\n\n},{\"./feature\":3,\"./simplify\":5}],3:[function(require,module,exports){\n'use strict';\n\nmodule.exports = createFeature;\n\nfunction createFeature(tags, type, geom, id) {\n    var feature = {\n        id: id || null,\n        type: type,\n        geometry: geom,\n        tags: tags || null,\n        min: [Infinity, Infinity], // initial bbox values\n        max: [-Infinity, -Infinity]\n    };\n    calcBBox(feature);\n    return feature;\n}\n\n// calculate the feature bounding box for faster clipping later\nfunction calcBBox(feature) {\n    var geometry = feature.geometry,\n        min = feature.min,\n        max = feature.max;\n\n    if (feature.type === 1) {\n        calcRingBBox(min, max, geometry);\n    } else {\n        for (var i = 0; i < geometry.length; i++) {\n            calcRingBBox(min, max, geometry[i]);\n        }\n    }\n\n    return feature;\n}\n\nfunction calcRingBBox(min, max, points) {\n    for (var i = 0, p; i < points.length; i++) {\n        p = points[i];\n        min[0] = Math.min(p[0], min[0]);\n        max[0] = Math.max(p[0], max[0]);\n        min[1] = Math.min(p[1], min[1]);\n        max[1] = Math.max(p[1], max[1]);\n    }\n}\n\n},{}],4:[function(require,module,exports){\n'use strict';\n\nmodule.exports = geojsonvt;\n\nvar convert = require('./convert'),     // GeoJSON conversion and preprocessing\n    transform = require('./transform'), // coordinate transformation\n    clip = require('./clip'),           // stripe clipping algorithm\n    wrap = require('./wrap'),           // date line processing\n    createTile = require('./tile');     // final simplified tile generation\n\n\nfunction geojsonvt(data, options) {\n    return new GeoJSONVT(data, options);\n}\n\nfunction GeoJSONVT(data, options) {\n    options = this.options = extend(Object.create(this.options), options);\n\n    var debug = options.debug;\n\n    if (debug) console.time('preprocess data');\n\n    var z2 = 1 << options.maxZoom, // 2^z\n        features = convert(data, options.tolerance / (z2 * options.extent));\n\n    this.tiles = {};\n    this.tileCoords = [];\n\n    if (debug) {\n        console.timeEnd('preprocess data');\n        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);\n        console.time('generate tiles');\n        this.stats = {};\n        this.total = 0;\n    }\n\n    features = wrap(features, options.buffer / options.extent, intersectX);\n\n    // start slicing from the top tile down\n    if (features.length) this.splitTile(features, 0, 0, 0);\n\n    if (debug) {\n        if (features.length) console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);\n        console.timeEnd('generate tiles');\n        console.log('tiles generated:', this.total, JSON.stringify(this.stats));\n    }\n}\n\nGeoJSONVT.prototype.options = {\n    maxZoom: 20,            // max zoom to preserve detail on\n    indexMaxZoom: 5,        // max zoom in the tile index\n    indexMaxPoints: 100000, // max number of points per tile in the tile index\n    solidChildren: false,   // whether to tile solid square tiles further\n    tolerance: 3,           // simplification tolerance (higher means simpler)\n    extent: 4096,           // tile extent\n    buffer: 64,             // tile buffer on each side\n    debug: 0                // logging level (0, 1 or 2)\n};\n\nGeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {\n\n    var stack = [features, z, x, y],\n        options = this.options,\n        debug = options.debug,\n        solid = null;\n\n    // avoid recursion by using a processing queue\n    while (stack.length) {\n        y = stack.pop();\n        x = stack.pop();\n        z = stack.pop();\n        features = stack.pop();\n\n        var z2 = 1 << z,\n            id = toID(z, x, y),\n            tile = this.tiles[id],\n            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * options.extent);\n\n        if (!tile) {\n            if (debug > 1) console.time('creation');\n\n            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);\n            this.tileCoords.push({z: z, x: x, y: y});\n\n            if (debug) {\n                if (debug > 1) {\n                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',\n                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);\n                    console.timeEnd('creation');\n                }\n                var key = 'z' + z;\n                this.stats[key] = (this.stats[key] || 0) + 1;\n                this.total++;\n            }\n        }\n\n        // save reference to original geometry in tile so that we can drill down later if we stop now\n        tile.source = features;\n\n        // if it's the first-pass tiling\n        if (!cz) {\n            // stop tiling if we reached max zoom, or if the tile is too simple\n            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;\n\n        // if a drilldown to a specific tile\n        } else {\n            // stop tiling if we reached base zoom or our target tile zoom\n            if (z === options.maxZoom || z === cz) continue;\n\n            // stop tiling if it's not an ancestor of the target tile\n            var m = 1 << (cz - z);\n            if (x !== Math.floor(cx / m) || y !== Math.floor(cy / m)) continue;\n        }\n\n        // stop tiling if the tile is solid clipped square\n        if (!options.solidChildren && isClippedSquare(tile, options.extent, options.buffer)) {\n            if (cz) solid = z; // and remember the zoom if we're drilling down\n            continue;\n        }\n\n        // if we slice further down, no need to keep source geometry\n        tile.source = null;\n\n        if (debug > 1) console.time('clipping');\n\n        // values we'll use for clipping\n        var k1 = 0.5 * options.buffer / options.extent,\n            k2 = 0.5 - k1,\n            k3 = 0.5 + k1,\n            k4 = 1 + k1,\n            tl, bl, tr, br, left, right;\n\n        tl = bl = tr = br = null;\n\n        left  = clip(features, z2, x - k1, x + k3, 0, intersectX, tile.min[0], tile.max[0]);\n        right = clip(features, z2, x + k2, x + k4, 0, intersectX, tile.min[0], tile.max[0]);\n\n        if (left) {\n            tl = clip(left, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);\n            bl = clip(left, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);\n        }\n\n        if (right) {\n            tr = clip(right, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);\n            br = clip(right, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);\n        }\n\n        if (debug > 1) console.timeEnd('clipping');\n\n        if (features.length) {\n            stack.push(tl || [], z + 1, x * 2,     y * 2);\n            stack.push(bl || [], z + 1, x * 2,     y * 2 + 1);\n            stack.push(tr || [], z + 1, x * 2 + 1, y * 2);\n            stack.push(br || [], z + 1, x * 2 + 1, y * 2 + 1);\n        }\n    }\n\n    return solid;\n};\n\nGeoJSONVT.prototype.getTile = function (z, x, y) {\n    var options = this.options,\n        extent = options.extent,\n        debug = options.debug;\n\n    var z2 = 1 << z;\n    x = ((x % z2) + z2) % z2; // wrap tile x coordinate\n\n    var id = toID(z, x, y);\n    if (this.tiles[id]) return transform.tile(this.tiles[id], extent);\n\n    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);\n\n    var z0 = z,\n        x0 = x,\n        y0 = y,\n        parent;\n\n    while (!parent && z0 > 0) {\n        z0--;\n        x0 = Math.floor(x0 / 2);\n        y0 = Math.floor(y0 / 2);\n        parent = this.tiles[toID(z0, x0, y0)];\n    }\n\n    if (!parent || !parent.source) return null;\n\n    // if we found a parent tile containing the original geometry, we can drill down from it\n    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);\n\n    // it parent tile is a solid clipped square, return it instead since it's identical\n    if (isClippedSquare(parent, extent, options.buffer)) return transform.tile(parent, extent);\n\n    if (debug > 1) console.time('drilling down');\n    var solid = this.splitTile(parent.source, z0, x0, y0, z, x, y);\n    if (debug > 1) console.timeEnd('drilling down');\n\n    // one of the parent tiles was a solid clipped square\n    if (solid !== null) {\n        var m = 1 << (z - solid);\n        id = toID(solid, Math.floor(x / m), Math.floor(y / m));\n    }\n\n    return this.tiles[id] ? transform.tile(this.tiles[id], extent) : null;\n};\n\nfunction toID(z, x, y) {\n    return (((1 << z) * y + x) * 32) + z;\n}\n\nfunction intersectX(a, b, x) {\n    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];\n}\nfunction intersectY(a, b, y) {\n    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];\n}\n\nfunction extend(dest, src) {\n    for (var i in src) dest[i] = src[i];\n    return dest;\n}\n\n// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further\nfunction isClippedSquare(tile, extent, buffer) {\n\n    var features = tile.source;\n    if (features.length !== 1) return false;\n\n    var feature = features[0];\n    if (feature.type !== 3 || feature.geometry.length > 1) return false;\n\n    var len = feature.geometry[0].length;\n    if (len !== 5) return false;\n\n    for (var i = 0; i < len; i++) {\n        var p = transform.point(feature.geometry[0][i], extent, tile.z2, tile.x, tile.y);\n        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||\n            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;\n    }\n\n    return true;\n}\n\n},{\"./clip\":1,\"./convert\":2,\"./tile\":6,\"./transform\":7,\"./wrap\":8}],5:[function(require,module,exports){\n'use strict';\n\nmodule.exports = simplify;\n\n// calculate simplification data using optimized Douglas-Peucker algorithm\n\nfunction simplify(points, tolerance) {\n\n    var sqTolerance = tolerance * tolerance,\n        len = points.length,\n        first = 0,\n        last = len - 1,\n        stack = [],\n        i, maxSqDist, sqDist, index;\n\n    // always retain the endpoints (1 is the max value)\n    points[first][2] = 1;\n    points[last][2] = 1;\n\n    // avoid recursion by using a stack\n    while (last) {\n\n        maxSqDist = 0;\n\n        for (i = first + 1; i < last; i++) {\n            sqDist = getSqSegDist(points[i], points[first], points[last]);\n\n            if (sqDist > maxSqDist) {\n                index = i;\n                maxSqDist = sqDist;\n            }\n        }\n\n        if (maxSqDist > sqTolerance) {\n            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate\n            stack.push(first);\n            stack.push(index);\n            first = index;\n\n        } else {\n            last = stack.pop();\n            first = stack.pop();\n        }\n    }\n}\n\n// square distance from a point to a segment\nfunction getSqSegDist(p, a, b) {\n\n    var x = a[0], y = a[1],\n        bx = b[0], by = b[1],\n        px = p[0], py = p[1],\n        dx = bx - x,\n        dy = by - y;\n\n    if (dx !== 0 || dy !== 0) {\n\n        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);\n\n        if (t > 1) {\n            x = bx;\n            y = by;\n\n        } else if (t > 0) {\n            x += dx * t;\n            y += dy * t;\n        }\n    }\n\n    dx = px - x;\n    dy = py - y;\n\n    return dx * dx + dy * dy;\n}\n\n},{}],6:[function(require,module,exports){\n'use strict';\n\nmodule.exports = createTile;\n\nfunction createTile(features, z2, tx, ty, tolerance, noSimplify) {\n    var tile = {\n        features: [],\n        numPoints: 0,\n        numSimplified: 0,\n        numFeatures: 0,\n        source: null,\n        x: tx,\n        y: ty,\n        z2: z2,\n        transformed: false,\n        min: [2, 1],\n        max: [-1, 0]\n    };\n    for (var i = 0; i < features.length; i++) {\n        tile.numFeatures++;\n        addFeature(tile, features[i], tolerance, noSimplify);\n\n        var min = features[i].min,\n            max = features[i].max;\n\n        if (min[0] < tile.min[0]) tile.min[0] = min[0];\n        if (min[1] < tile.min[1]) tile.min[1] = min[1];\n        if (max[0] > tile.max[0]) tile.max[0] = max[0];\n        if (max[1] > tile.max[1]) tile.max[1] = max[1];\n    }\n    return tile;\n}\n\nfunction addFeature(tile, feature, tolerance, noSimplify) {\n\n    var geom = feature.geometry,\n        type = feature.type,\n        simplified = [],\n        sqTolerance = tolerance * tolerance,\n        i, j, ring, p;\n\n    if (type === 1) {\n        for (i = 0; i < geom.length; i++) {\n            simplified.push(geom[i]);\n            tile.numPoints++;\n            tile.numSimplified++;\n        }\n\n    } else {\n\n        // simplify and transform projected coordinates for tile geometry\n        for (i = 0; i < geom.length; i++) {\n            ring = geom[i];\n\n            // filter out tiny polylines & polygons\n            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||\n                                (type === 3 && ring.area < sqTolerance))) {\n                tile.numPoints += ring.length;\n                continue;\n            }\n\n            var simplifiedRing = [];\n\n            for (j = 0; j < ring.length; j++) {\n                p = ring[j];\n                // keep points with importance > tolerance\n                if (noSimplify || p[2] > sqTolerance) {\n                    simplifiedRing.push(p);\n                    tile.numSimplified++;\n                }\n                tile.numPoints++;\n            }\n\n            if (type === 3) rewind(simplifiedRing, ring.outer);\n\n            simplified.push(simplifiedRing);\n        }\n    }\n\n    if (simplified.length) {\n        var tileFeature = {\n            geometry: simplified,\n            type: type,\n            tags: feature.tags || null\n        };\n        if (feature.id !== null) {\n            tileFeature.id = feature.id;\n        }\n        tile.features.push(tileFeature);\n    }\n}\n\nfunction rewind(ring, clockwise) {\n    var area = signedArea(ring);\n    if (area < 0 === clockwise) ring.reverse();\n}\n\nfunction signedArea(ring) {\n    var sum = 0;\n    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {\n        p1 = ring[i];\n        p2 = ring[j];\n        sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);\n    }\n    return sum;\n}\n\n},{}],7:[function(require,module,exports){\n'use strict';\n\nexports.tile = transformTile;\nexports.point = transformPoint;\n\n// Transforms the coordinates of each feature in the given tile from\n// mercator-projected space into (extent x extent) tile space.\nfunction transformTile(tile, extent) {\n    if (tile.transformed) return tile;\n\n    var z2 = tile.z2,\n        tx = tile.x,\n        ty = tile.y,\n        i, j, k;\n\n    for (i = 0; i < tile.features.length; i++) {\n        var feature = tile.features[i],\n            geom = feature.geometry,\n            type = feature.type;\n\n        if (type === 1) {\n            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);\n\n        } else {\n            for (j = 0; j < geom.length; j++) {\n                var ring = geom[j];\n                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);\n            }\n        }\n    }\n\n    tile.transformed = true;\n\n    return tile;\n}\n\nfunction transformPoint(p, extent, z2, tx, ty) {\n    var x = Math.round(extent * (p[0] * z2 - tx)),\n        y = Math.round(extent * (p[1] * z2 - ty));\n    return [x, y];\n}\n\n},{}],8:[function(require,module,exports){\n'use strict';\n\nvar clip = require('./clip');\nvar createFeature = require('./feature');\n\nmodule.exports = wrap;\n\nfunction wrap(features, buffer, intersectX) {\n    var merged = features,\n        left  = clip(features, 1, -1 - buffer, buffer,     0, intersectX, -1, 2), // left world copy\n        right = clip(features, 1,  1 - buffer, 2 + buffer, 0, intersectX, -1, 2); // right world copy\n\n    if (left || right) {\n        merged = clip(features, 1, -buffer, 1 + buffer, 0, intersectX, -1, 2) || []; // center world copy\n\n        if (left) merged = shiftFeatureCoords(left, 1).concat(merged); // merge left into center\n        if (right) merged = merged.concat(shiftFeatureCoords(right, -1)); // merge right into center\n    }\n\n    return merged;\n}\n\nfunction shiftFeatureCoords(features, offset) {\n    var newFeatures = [];\n\n    for (var i = 0; i < features.length; i++) {\n        var feature = features[i],\n            type = feature.type;\n\n        var newGeometry;\n\n        if (type === 1) {\n            newGeometry = shiftCoords(feature.geometry, offset);\n        } else {\n            newGeometry = [];\n            for (var j = 0; j < feature.geometry.length; j++) {\n                newGeometry.push(shiftCoords(feature.geometry[j], offset));\n            }\n        }\n\n        newFeatures.push(createFeature(feature.tags, type, newGeometry, feature.id));\n    }\n\n    return newFeatures;\n}\n\nfunction shiftCoords(points, offset) {\n    var newPoints = [];\n    newPoints.area = points.area;\n    newPoints.dist = points.dist;\n\n    for (var i = 0; i < points.length; i++) {\n        newPoints.push([points[i][0] + offset, points[i][1], points[i][2]]);\n    }\n    return newPoints;\n}\n\n},{\"./clip\":1,\"./feature\":3}]},{},[4])(4)\n});\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2xpcC5qcyIsInNyYy9jb252ZXJ0LmpzIiwic3JjL2ZlYXR1cmUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvc2ltcGxpZnkuanMiLCJzcmMvdGlsZS5qcyIsInNyYy90cmFuc2Zvcm0uanMiLCJzcmMvd3JhcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBjbGlwO1xuXG52YXIgY3JlYXRlRmVhdHVyZSA9IHJlcXVpcmUoJy4vZmVhdHVyZScpO1xuXG4vKiBjbGlwIGZlYXR1cmVzIGJldHdlZW4gdHdvIGF4aXMtcGFyYWxsZWwgbGluZXM6XG4gKiAgICAgfCAgICAgICAgfFxuICogIF9fX3xfX18gICAgIHwgICAgIC9cbiAqIC8gICB8ICAgXFxfX19ffF9fX18vXG4gKiAgICAgfCAgICAgICAgfFxuICovXG5cbmZ1bmN0aW9uIGNsaXAoZmVhdHVyZXMsIHNjYWxlLCBrMSwgazIsIGF4aXMsIGludGVyc2VjdCwgbWluQWxsLCBtYXhBbGwpIHtcblxuICAgIGsxIC89IHNjYWxlO1xuICAgIGsyIC89IHNjYWxlO1xuXG4gICAgaWYgKG1pbkFsbCA+PSBrMSAmJiBtYXhBbGwgPD0gazIpIHJldHVybiBmZWF0dXJlczsgLy8gdHJpdmlhbCBhY2NlcHRcbiAgICBlbHNlIGlmIChtaW5BbGwgPiBrMiB8fCBtYXhBbGwgPCBrMSkgcmV0dXJuIG51bGw7IC8vIHRyaXZpYWwgcmVqZWN0XG5cbiAgICB2YXIgY2xpcHBlZCA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBmZWF0dXJlID0gZmVhdHVyZXNbaV0sXG4gICAgICAgICAgICBnZW9tZXRyeSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlLFxuICAgICAgICAgICAgbWluLCBtYXg7XG5cbiAgICAgICAgbWluID0gZmVhdHVyZS5taW5bYXhpc107XG4gICAgICAgIG1heCA9IGZlYXR1cmUubWF4W2F4aXNdO1xuXG4gICAgICAgIGlmIChtaW4gPj0gazEgJiYgbWF4IDw9IGsyKSB7IC8vIHRyaXZpYWwgYWNjZXB0XG4gICAgICAgICAgICBjbGlwcGVkLnB1c2goZmVhdHVyZSk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtaW4gPiBrMiB8fCBtYXggPCBrMSkgY29udGludWU7IC8vIHRyaXZpYWwgcmVqZWN0XG5cbiAgICAgICAgdmFyIHNsaWNlcyA9IHR5cGUgPT09IDEgP1xuICAgICAgICAgICAgICAgIGNsaXBQb2ludHMoZ2VvbWV0cnksIGsxLCBrMiwgYXhpcykgOlxuICAgICAgICAgICAgICAgIGNsaXBHZW9tZXRyeShnZW9tZXRyeSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIHR5cGUgPT09IDMpO1xuXG4gICAgICAgIGlmIChzbGljZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBpZiBhIGZlYXR1cmUgZ290IGNsaXBwZWQsIGl0IHdpbGwgbGlrZWx5IGdldCBjbGlwcGVkIG9uIHRoZSBuZXh0IHpvb20gbGV2ZWwgYXMgd2VsbCxcbiAgICAgICAgICAgIC8vIHNvIHRoZXJlJ3Mgbm8gbmVlZCB0byByZWNhbGN1bGF0ZSBiYm94ZXNcbiAgICAgICAgICAgIGNsaXBwZWQucHVzaChjcmVhdGVGZWF0dXJlKGZlYXR1cmUudGFncywgdHlwZSwgc2xpY2VzLCBmZWF0dXJlLmlkKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY2xpcHBlZC5sZW5ndGggPyBjbGlwcGVkIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gY2xpcFBvaW50cyhnZW9tZXRyeSwgazEsIGsyLCBheGlzKSB7XG4gICAgdmFyIHNsaWNlID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdlb21ldHJ5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhID0gZ2VvbWV0cnlbaV0sXG4gICAgICAgICAgICBhayA9IGFbYXhpc107XG5cbiAgICAgICAgaWYgKGFrID49IGsxICYmIGFrIDw9IGsyKSBzbGljZS5wdXNoKGEpO1xuICAgIH1cbiAgICByZXR1cm4gc2xpY2U7XG59XG5cbmZ1bmN0aW9uIGNsaXBHZW9tZXRyeShnZW9tZXRyeSwgazEsIGsyLCBheGlzLCBpbnRlcnNlY3QsIGNsb3NlZCkge1xuXG4gICAgdmFyIHNsaWNlcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnZW9tZXRyeS5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIHZhciBhayA9IDAsXG4gICAgICAgICAgICBiayA9IDAsXG4gICAgICAgICAgICBiID0gbnVsbCxcbiAgICAgICAgICAgIHBvaW50cyA9IGdlb21ldHJ5W2ldLFxuICAgICAgICAgICAgYXJlYSA9IHBvaW50cy5hcmVhLFxuICAgICAgICAgICAgZGlzdCA9IHBvaW50cy5kaXN0LFxuICAgICAgICAgICAgb3V0ZXIgPSBwb2ludHMub3V0ZXIsXG4gICAgICAgICAgICBsZW4gPSBwb2ludHMubGVuZ3RoLFxuICAgICAgICAgICAgYSwgaiwgbGFzdDtcblxuICAgICAgICB2YXIgc2xpY2UgPSBbXTtcblxuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbGVuIC0gMTsgaisrKSB7XG4gICAgICAgICAgICBhID0gYiB8fCBwb2ludHNbal07XG4gICAgICAgICAgICBiID0gcG9pbnRzW2ogKyAxXTtcbiAgICAgICAgICAgIGFrID0gYmsgfHwgYVtheGlzXTtcbiAgICAgICAgICAgIGJrID0gYltheGlzXTtcblxuICAgICAgICAgICAgaWYgKGFrIDwgazEpIHtcblxuICAgICAgICAgICAgICAgIGlmICgoYmsgPiBrMikpIHsgLy8gLS0tfC0tLS0tfC0tPlxuICAgICAgICAgICAgICAgICAgICBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSksIGludGVyc2VjdChhLCBiLCBrMikpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNsb3NlZCkgc2xpY2UgPSBuZXdTbGljZShzbGljZXMsIHNsaWNlLCBhcmVhLCBkaXN0LCBvdXRlcik7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJrID49IGsxKSBzbGljZS5wdXNoKGludGVyc2VjdChhLCBiLCBrMSkpOyAvLyAtLS18LS0+ICB8XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWsgPiBrMikge1xuXG4gICAgICAgICAgICAgICAgaWYgKChiayA8IGsxKSkgeyAvLyA8LS18LS0tLS18LS0tXG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSwgaW50ZXJzZWN0KGEsIGIsIGsxKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QsIG91dGVyKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmsgPD0gazIpIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSk7IC8vIHwgIDwtLXwtLS1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goYSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmsgPCBrMSkgeyAvLyA8LS18LS0tICB8XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsxKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QsIG91dGVyKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYmsgPiBrMikgeyAvLyB8ICAtLS18LS0+XG4gICAgICAgICAgICAgICAgICAgIHNsaWNlLnB1c2goaW50ZXJzZWN0KGEsIGIsIGsyKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY2xvc2VkKSBzbGljZSA9IG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QsIG91dGVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gfCAtLT4gfFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gYWRkIHRoZSBsYXN0IHBvaW50XG4gICAgICAgIGEgPSBwb2ludHNbbGVuIC0gMV07XG4gICAgICAgIGFrID0gYVtheGlzXTtcbiAgICAgICAgaWYgKGFrID49IGsxICYmIGFrIDw9IGsyKSBzbGljZS5wdXNoKGEpO1xuXG4gICAgICAgIC8vIGNsb3NlIHRoZSBwb2x5Z29uIGlmIGl0cyBlbmRwb2ludHMgYXJlIG5vdCB0aGUgc2FtZSBhZnRlciBjbGlwcGluZ1xuXG4gICAgICAgIGxhc3QgPSBzbGljZVtzbGljZS5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGNsb3NlZCAmJiBsYXN0ICYmIChzbGljZVswXVswXSAhPT0gbGFzdFswXSB8fCBzbGljZVswXVsxXSAhPT0gbGFzdFsxXSkpIHNsaWNlLnB1c2goc2xpY2VbMF0pO1xuXG4gICAgICAgIC8vIGFkZCB0aGUgZmluYWwgc2xpY2VcbiAgICAgICAgbmV3U2xpY2Uoc2xpY2VzLCBzbGljZSwgYXJlYSwgZGlzdCwgb3V0ZXIpO1xuICAgIH1cblxuICAgIHJldHVybiBzbGljZXM7XG59XG5cbmZ1bmN0aW9uIG5ld1NsaWNlKHNsaWNlcywgc2xpY2UsIGFyZWEsIGRpc3QsIG91dGVyKSB7XG4gICAgaWYgKHNsaWNlLmxlbmd0aCkge1xuICAgICAgICAvLyB3ZSBkb24ndCByZWNhbGN1bGF0ZSB0aGUgYXJlYS9sZW5ndGggb2YgdGhlIHVuY2xpcHBlZCBnZW9tZXRyeSBiZWNhdXNlIHRoZSBjYXNlIHdoZXJlIGl0IGdvZXNcbiAgICAgICAgLy8gYmVsb3cgdGhlIHZpc2liaWxpdHkgdGhyZXNob2xkIGFzIGEgcmVzdWx0IG9mIGNsaXBwaW5nIGlzIHJhcmUsIHNvIHdlIGF2b2lkIGRvaW5nIHVubmVjZXNzYXJ5IHdvcmtcbiAgICAgICAgc2xpY2UuYXJlYSA9IGFyZWE7XG4gICAgICAgIHNsaWNlLmRpc3QgPSBkaXN0O1xuICAgICAgICBpZiAob3V0ZXIgIT09IHVuZGVmaW5lZCkgc2xpY2Uub3V0ZXIgPSBvdXRlcjtcblxuICAgICAgICBzbGljZXMucHVzaChzbGljZSk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBjb252ZXJ0O1xuXG52YXIgc2ltcGxpZnkgPSByZXF1aXJlKCcuL3NpbXBsaWZ5Jyk7XG52YXIgY3JlYXRlRmVhdHVyZSA9IHJlcXVpcmUoJy4vZmVhdHVyZScpO1xuXG4vLyBjb252ZXJ0cyBHZW9KU09OIGZlYXR1cmUgaW50byBhbiBpbnRlcm1lZGlhdGUgcHJvamVjdGVkIEpTT04gdmVjdG9yIGZvcm1hdCB3aXRoIHNpbXBsaWZpY2F0aW9uIGRhdGFcblxuZnVuY3Rpb24gY29udmVydChkYXRhLCB0b2xlcmFuY2UpIHtcbiAgICB2YXIgZmVhdHVyZXMgPSBbXTtcblxuICAgIGlmIChkYXRhLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb252ZXJ0RmVhdHVyZShmZWF0dXJlcywgZGF0YS5mZWF0dXJlc1tpXSwgdG9sZXJhbmNlKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZGF0YS50eXBlID09PSAnRmVhdHVyZScpIHtcbiAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIGRhdGEsIHRvbGVyYW5jZSk7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBzaW5nbGUgZ2VvbWV0cnkgb3IgYSBnZW9tZXRyeSBjb2xsZWN0aW9uXG4gICAgICAgIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCB7Z2VvbWV0cnk6IGRhdGF9LCB0b2xlcmFuY2UpO1xuICAgIH1cbiAgICByZXR1cm4gZmVhdHVyZXM7XG59XG5cbmZ1bmN0aW9uIGNvbnZlcnRGZWF0dXJlKGZlYXR1cmVzLCBmZWF0dXJlLCB0b2xlcmFuY2UpIHtcbiAgICBpZiAoZmVhdHVyZS5nZW9tZXRyeSA9PT0gbnVsbCkge1xuICAgICAgICAvLyBpZ25vcmUgZmVhdHVyZXMgd2l0aCBudWxsIGdlb21ldHJ5XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgIHR5cGUgPSBnZW9tLnR5cGUsXG4gICAgICAgIGNvb3JkcyA9IGdlb20uY29vcmRpbmF0ZXMsXG4gICAgICAgIHRhZ3MgPSBmZWF0dXJlLnByb3BlcnRpZXMsXG4gICAgICAgIGlkID0gZmVhdHVyZS5pZCxcbiAgICAgICAgaSwgaiwgcmluZ3MsIHByb2plY3RlZFJpbmc7XG5cbiAgICBpZiAodHlwZSA9PT0gJ1BvaW50Jykge1xuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZUZlYXR1cmUodGFncywgMSwgW3Byb2plY3RQb2ludChjb29yZHMpXSwgaWQpKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlRmVhdHVyZSh0YWdzLCAxLCBwcm9qZWN0KGNvb3JkcyksIGlkKSk7XG5cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICBmZWF0dXJlcy5wdXNoKGNyZWF0ZUZlYXR1cmUodGFncywgMiwgW3Byb2plY3QoY29vcmRzLCB0b2xlcmFuY2UpXSwgaWQpKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ011bHRpTGluZVN0cmluZycgfHwgdHlwZSA9PT0gJ1BvbHlnb24nKSB7XG4gICAgICAgIHJpbmdzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHByb2plY3RlZFJpbmcgPSBwcm9qZWN0KGNvb3Jkc1tpXSwgdG9sZXJhbmNlKTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnUG9seWdvbicpIHByb2plY3RlZFJpbmcub3V0ZXIgPSAoaSA9PT0gMCk7XG4gICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3RlZFJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlRmVhdHVyZSh0YWdzLCB0eXBlID09PSAnUG9seWdvbicgPyAzIDogMiwgcmluZ3MsIGlkKSk7XG5cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgIHJpbmdzID0gW107XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0ZWRSaW5nID0gcHJvamVjdChjb29yZHNbaV1bal0sIHRvbGVyYW5jZSk7XG4gICAgICAgICAgICAgICAgcHJvamVjdGVkUmluZy5vdXRlciA9IChqID09PSAwKTtcbiAgICAgICAgICAgICAgICByaW5ncy5wdXNoKHByb2plY3RlZFJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZlYXR1cmVzLnB1c2goY3JlYXRlRmVhdHVyZSh0YWdzLCAzLCByaW5ncywgaWQpKTtcblxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ0dlb21ldHJ5Q29sbGVjdGlvbicpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20uZ2VvbWV0cmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29udmVydEZlYXR1cmUoZmVhdHVyZXMsIHtcbiAgICAgICAgICAgICAgICBnZW9tZXRyeTogZ2VvbS5nZW9tZXRyaWVzW2ldLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHRhZ3NcbiAgICAgICAgICAgIH0sIHRvbGVyYW5jZSk7XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgZGF0YSBpcyBub3QgYSB2YWxpZCBHZW9KU09OIG9iamVjdC4nKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByb2plY3QobG9ubGF0cywgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHByb2plY3RlZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9ubGF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwcm9qZWN0ZWQucHVzaChwcm9qZWN0UG9pbnQobG9ubGF0c1tpXSkpO1xuICAgIH1cbiAgICBpZiAodG9sZXJhbmNlKSB7XG4gICAgICAgIHNpbXBsaWZ5KHByb2plY3RlZCwgdG9sZXJhbmNlKTtcbiAgICAgICAgY2FsY1NpemUocHJvamVjdGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHByb2plY3RlZDtcbn1cblxuZnVuY3Rpb24gcHJvamVjdFBvaW50KHApIHtcbiAgICB2YXIgc2luID0gTWF0aC5zaW4ocFsxXSAqIE1hdGguUEkgLyAxODApLFxuICAgICAgICB4ID0gKHBbMF0gLyAzNjAgKyAwLjUpLFxuICAgICAgICB5ID0gKDAuNSAtIDAuMjUgKiBNYXRoLmxvZygoMSArIHNpbikgLyAoMSAtIHNpbikpIC8gTWF0aC5QSSk7XG5cbiAgICB5ID0geSA8IDAgPyAwIDpcbiAgICAgICAgeSA+IDEgPyAxIDogeTtcblxuICAgIHJldHVybiBbeCwgeSwgMF07XG59XG5cbi8vIGNhbGN1bGF0ZSBhcmVhIGFuZCBsZW5ndGggb2YgdGhlIHBvbHlcbmZ1bmN0aW9uIGNhbGNTaXplKHBvaW50cykge1xuICAgIHZhciBhcmVhID0gMCxcbiAgICAgICAgZGlzdCA9IDA7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgYSwgYjsgaSA8IHBvaW50cy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgYSA9IGIgfHwgcG9pbnRzW2ldO1xuICAgICAgICBiID0gcG9pbnRzW2kgKyAxXTtcblxuICAgICAgICBhcmVhICs9IGFbMF0gKiBiWzFdIC0gYlswXSAqIGFbMV07XG5cbiAgICAgICAgLy8gdXNlIE1hbmhhdHRhbiBkaXN0YW5jZSBpbnN0ZWFkIG9mIEV1Y2xpZGlhbiBvbmUgdG8gYXZvaWQgZXhwZW5zaXZlIHNxdWFyZSByb290IGNvbXB1dGF0aW9uXG4gICAgICAgIGRpc3QgKz0gTWF0aC5hYnMoYlswXSAtIGFbMF0pICsgTWF0aC5hYnMoYlsxXSAtIGFbMV0pO1xuICAgIH1cbiAgICBwb2ludHMuYXJlYSA9IE1hdGguYWJzKGFyZWEgLyAyKTtcbiAgICBwb2ludHMuZGlzdCA9IGRpc3Q7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRmVhdHVyZTtcblxuZnVuY3Rpb24gY3JlYXRlRmVhdHVyZSh0YWdzLCB0eXBlLCBnZW9tLCBpZCkge1xuICAgIHZhciBmZWF0dXJlID0ge1xuICAgICAgICBpZDogaWQgfHwgbnVsbCxcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgZ2VvbWV0cnk6IGdlb20sXG4gICAgICAgIHRhZ3M6IHRhZ3MgfHwgbnVsbCxcbiAgICAgICAgbWluOiBbSW5maW5pdHksIEluZmluaXR5XSwgLy8gaW5pdGlhbCBiYm94IHZhbHVlc1xuICAgICAgICBtYXg6IFstSW5maW5pdHksIC1JbmZpbml0eV1cbiAgICB9O1xuICAgIGNhbGNCQm94KGZlYXR1cmUpO1xuICAgIHJldHVybiBmZWF0dXJlO1xufVxuXG4vLyBjYWxjdWxhdGUgdGhlIGZlYXR1cmUgYm91bmRpbmcgYm94IGZvciBmYXN0ZXIgY2xpcHBpbmcgbGF0ZXJcbmZ1bmN0aW9uIGNhbGNCQm94KGZlYXR1cmUpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5LFxuICAgICAgICBtaW4gPSBmZWF0dXJlLm1pbixcbiAgICAgICAgbWF4ID0gZmVhdHVyZS5tYXg7XG5cbiAgICBpZiAoZmVhdHVyZS50eXBlID09PSAxKSB7XG4gICAgICAgIGNhbGNSaW5nQkJveChtaW4sIG1heCwgZ2VvbWV0cnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VvbWV0cnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNhbGNSaW5nQkJveChtaW4sIG1heCwgZ2VvbWV0cnlbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59XG5cbmZ1bmN0aW9uIGNhbGNSaW5nQkJveChtaW4sIG1heCwgcG9pbnRzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIHA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcCA9IHBvaW50c1tpXTtcbiAgICAgICAgbWluWzBdID0gTWF0aC5taW4ocFswXSwgbWluWzBdKTtcbiAgICAgICAgbWF4WzBdID0gTWF0aC5tYXgocFswXSwgbWF4WzBdKTtcbiAgICAgICAgbWluWzFdID0gTWF0aC5taW4ocFsxXSwgbWluWzFdKTtcbiAgICAgICAgbWF4WzFdID0gTWF0aC5tYXgocFsxXSwgbWF4WzFdKTtcbiAgICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VvanNvbnZ0O1xuXG52YXIgY29udmVydCA9IHJlcXVpcmUoJy4vY29udmVydCcpLCAgICAgLy8gR2VvSlNPTiBjb252ZXJzaW9uIGFuZCBwcmVwcm9jZXNzaW5nXG4gICAgdHJhbnNmb3JtID0gcmVxdWlyZSgnLi90cmFuc2Zvcm0nKSwgLy8gY29vcmRpbmF0ZSB0cmFuc2Zvcm1hdGlvblxuICAgIGNsaXAgPSByZXF1aXJlKCcuL2NsaXAnKSwgICAgICAgICAgIC8vIHN0cmlwZSBjbGlwcGluZyBhbGdvcml0aG1cbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwJyksICAgICAgICAgICAvLyBkYXRlIGxpbmUgcHJvY2Vzc2luZ1xuICAgIGNyZWF0ZVRpbGUgPSByZXF1aXJlKCcuL3RpbGUnKTsgICAgIC8vIGZpbmFsIHNpbXBsaWZpZWQgdGlsZSBnZW5lcmF0aW9uXG5cblxuZnVuY3Rpb24gZ2VvanNvbnZ0KGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IEdlb0pTT05WVChkYXRhLCBvcHRpb25zKTtcbn1cblxuZnVuY3Rpb24gR2VvSlNPTlZUKGRhdGEsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gdGhpcy5vcHRpb25zID0gZXh0ZW5kKE9iamVjdC5jcmVhdGUodGhpcy5vcHRpb25zKSwgb3B0aW9ucyk7XG5cbiAgICB2YXIgZGVidWcgPSBvcHRpb25zLmRlYnVnO1xuXG4gICAgaWYgKGRlYnVnKSBjb25zb2xlLnRpbWUoJ3ByZXByb2Nlc3MgZGF0YScpO1xuXG4gICAgdmFyIHoyID0gMSA8PCBvcHRpb25zLm1heFpvb20sIC8vIDJeelxuICAgICAgICBmZWF0dXJlcyA9IGNvbnZlcnQoZGF0YSwgb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBvcHRpb25zLmV4dGVudCkpO1xuXG4gICAgdGhpcy50aWxlcyA9IHt9O1xuICAgIHRoaXMudGlsZUNvb3JkcyA9IFtdO1xuXG4gICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgncHJlcHJvY2VzcyBkYXRhJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdpbmRleDogbWF4Wm9vbTogJWQsIG1heFBvaW50czogJWQnLCBvcHRpb25zLmluZGV4TWF4Wm9vbSwgb3B0aW9ucy5pbmRleE1heFBvaW50cyk7XG4gICAgICAgIGNvbnNvbGUudGltZSgnZ2VuZXJhdGUgdGlsZXMnKTtcbiAgICAgICAgdGhpcy5zdGF0cyA9IHt9O1xuICAgICAgICB0aGlzLnRvdGFsID0gMDtcbiAgICB9XG5cbiAgICBmZWF0dXJlcyA9IHdyYXAoZmVhdHVyZXMsIG9wdGlvbnMuYnVmZmVyIC8gb3B0aW9ucy5leHRlbnQsIGludGVyc2VjdFgpO1xuXG4gICAgLy8gc3RhcnQgc2xpY2luZyBmcm9tIHRoZSB0b3AgdGlsZSBkb3duXG4gICAgaWYgKGZlYXR1cmVzLmxlbmd0aCkgdGhpcy5zcGxpdFRpbGUoZmVhdHVyZXMsIDAsIDAsIDApO1xuXG4gICAgaWYgKGRlYnVnKSB7XG4gICAgICAgIGlmIChmZWF0dXJlcy5sZW5ndGgpIGNvbnNvbGUubG9nKCdmZWF0dXJlczogJWQsIHBvaW50czogJWQnLCB0aGlzLnRpbGVzWzBdLm51bUZlYXR1cmVzLCB0aGlzLnRpbGVzWzBdLm51bVBvaW50cyk7XG4gICAgICAgIGNvbnNvbGUudGltZUVuZCgnZ2VuZXJhdGUgdGlsZXMnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RpbGVzIGdlbmVyYXRlZDonLCB0aGlzLnRvdGFsLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRzKSk7XG4gICAgfVxufVxuXG5HZW9KU09OVlQucHJvdG90eXBlLm9wdGlvbnMgPSB7XG4gICAgbWF4Wm9vbTogMTQsICAgICAgICAgICAgLy8gbWF4IHpvb20gdG8gcHJlc2VydmUgZGV0YWlsIG9uXG4gICAgaW5kZXhNYXhab29tOiA1LCAgICAgICAgLy8gbWF4IHpvb20gaW4gdGhlIHRpbGUgaW5kZXhcbiAgICBpbmRleE1heFBvaW50czogMTAwMDAwLCAvLyBtYXggbnVtYmVyIG9mIHBvaW50cyBwZXIgdGlsZSBpbiB0aGUgdGlsZSBpbmRleFxuICAgIHNvbGlkQ2hpbGRyZW46IGZhbHNlLCAgIC8vIHdoZXRoZXIgdG8gdGlsZSBzb2xpZCBzcXVhcmUgdGlsZXMgZnVydGhlclxuICAgIHRvbGVyYW5jZTogMywgICAgICAgICAgIC8vIHNpbXBsaWZpY2F0aW9uIHRvbGVyYW5jZSAoaGlnaGVyIG1lYW5zIHNpbXBsZXIpXG4gICAgZXh0ZW50OiA0MDk2LCAgICAgICAgICAgLy8gdGlsZSBleHRlbnRcbiAgICBidWZmZXI6IDY0LCAgICAgICAgICAgICAvLyB0aWxlIGJ1ZmZlciBvbiBlYWNoIHNpZGVcbiAgICBkZWJ1ZzogMCAgICAgICAgICAgICAgICAvLyBsb2dnaW5nIGxldmVsICgwLCAxIG9yIDIpXG59O1xuXG5HZW9KU09OVlQucHJvdG90eXBlLnNwbGl0VGlsZSA9IGZ1bmN0aW9uIChmZWF0dXJlcywgeiwgeCwgeSwgY3osIGN4LCBjeSkge1xuXG4gICAgdmFyIHN0YWNrID0gW2ZlYXR1cmVzLCB6LCB4LCB5XSxcbiAgICAgICAgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgZGVidWcgPSBvcHRpb25zLmRlYnVnLFxuICAgICAgICBzb2xpZCA9IG51bGw7XG5cbiAgICAvLyBhdm9pZCByZWN1cnNpb24gYnkgdXNpbmcgYSBwcm9jZXNzaW5nIHF1ZXVlXG4gICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgICAgICB5ID0gc3RhY2sucG9wKCk7XG4gICAgICAgIHggPSBzdGFjay5wb3AoKTtcbiAgICAgICAgeiA9IHN0YWNrLnBvcCgpO1xuICAgICAgICBmZWF0dXJlcyA9IHN0YWNrLnBvcCgpO1xuXG4gICAgICAgIHZhciB6MiA9IDEgPDwgeixcbiAgICAgICAgICAgIGlkID0gdG9JRCh6LCB4LCB5KSxcbiAgICAgICAgICAgIHRpbGUgPSB0aGlzLnRpbGVzW2lkXSxcbiAgICAgICAgICAgIHRpbGVUb2xlcmFuY2UgPSB6ID09PSBvcHRpb25zLm1heFpvb20gPyAwIDogb3B0aW9ucy50b2xlcmFuY2UgLyAoejIgKiBvcHRpb25zLmV4dGVudCk7XG5cbiAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLnRpbWUoJ2NyZWF0aW9uJyk7XG5cbiAgICAgICAgICAgIHRpbGUgPSB0aGlzLnRpbGVzW2lkXSA9IGNyZWF0ZVRpbGUoZmVhdHVyZXMsIHoyLCB4LCB5LCB0aWxlVG9sZXJhbmNlLCB6ID09PSBvcHRpb25zLm1heFpvb20pO1xuICAgICAgICAgICAgdGhpcy50aWxlQ29vcmRzLnB1c2goe3o6IHosIHg6IHgsIHk6IHl9KTtcblxuICAgICAgICAgICAgaWYgKGRlYnVnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGlsZSB6JWQtJWQtJWQgKGZlYXR1cmVzOiAlZCwgcG9pbnRzOiAlZCwgc2ltcGxpZmllZDogJWQpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHosIHgsIHksIHRpbGUubnVtRmVhdHVyZXMsIHRpbGUubnVtUG9pbnRzLCB0aWxlLm51bVNpbXBsaWZpZWQpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLnRpbWVFbmQoJ2NyZWF0aW9uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSAneicgKyB6O1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdHNba2V5XSA9ICh0aGlzLnN0YXRzW2tleV0gfHwgMCkgKyAxO1xuICAgICAgICAgICAgICAgIHRoaXMudG90YWwrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIGdlb21ldHJ5IGluIHRpbGUgc28gdGhhdCB3ZSBjYW4gZHJpbGwgZG93biBsYXRlciBpZiB3ZSBzdG9wIG5vd1xuICAgICAgICB0aWxlLnNvdXJjZSA9IGZlYXR1cmVzO1xuXG4gICAgICAgIC8vIGlmIGl0J3MgdGhlIGZpcnN0LXBhc3MgdGlsaW5nXG4gICAgICAgIGlmICghY3opIHtcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgbWF4IHpvb20sIG9yIGlmIHRoZSB0aWxlIGlzIHRvbyBzaW1wbGVcbiAgICAgICAgICAgIGlmICh6ID09PSBvcHRpb25zLmluZGV4TWF4Wm9vbSB8fCB0aWxlLm51bVBvaW50cyA8PSBvcHRpb25zLmluZGV4TWF4UG9pbnRzKSBjb250aW51ZTtcblxuICAgICAgICAvLyBpZiBhIGRyaWxsZG93biB0byBhIHNwZWNpZmljIHRpbGVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHN0b3AgdGlsaW5nIGlmIHdlIHJlYWNoZWQgYmFzZSB6b29tIG9yIG91ciB0YXJnZXQgdGlsZSB6b29tXG4gICAgICAgICAgICBpZiAoeiA9PT0gb3B0aW9ucy5tYXhab29tIHx8IHogPT09IGN6KSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gc3RvcCB0aWxpbmcgaWYgaXQncyBub3QgYW4gYW5jZXN0b3Igb2YgdGhlIHRhcmdldCB0aWxlXG4gICAgICAgICAgICB2YXIgbSA9IDEgPDwgKGN6IC0geik7XG4gICAgICAgICAgICBpZiAoeCAhPT0gTWF0aC5mbG9vcihjeCAvIG0pIHx8IHkgIT09IE1hdGguZmxvb3IoY3kgLyBtKSkgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9wIHRpbGluZyBpZiB0aGUgdGlsZSBpcyBzb2xpZCBjbGlwcGVkIHNxdWFyZVxuICAgICAgICBpZiAoIW9wdGlvbnMuc29saWRDaGlsZHJlbiAmJiBpc0NsaXBwZWRTcXVhcmUodGlsZSwgb3B0aW9ucy5leHRlbnQsIG9wdGlvbnMuYnVmZmVyKSkge1xuICAgICAgICAgICAgaWYgKGN6KSBzb2xpZCA9IHo7IC8vIGFuZCByZW1lbWJlciB0aGUgem9vbSBpZiB3ZSdyZSBkcmlsbGluZyBkb3duXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIHdlIHNsaWNlIGZ1cnRoZXIgZG93biwgbm8gbmVlZCB0byBrZWVwIHNvdXJjZSBnZW9tZXRyeVxuICAgICAgICB0aWxlLnNvdXJjZSA9IG51bGw7XG5cbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lKCdjbGlwcGluZycpO1xuXG4gICAgICAgIC8vIHZhbHVlcyB3ZSdsbCB1c2UgZm9yIGNsaXBwaW5nXG4gICAgICAgIHZhciBrMSA9IDAuNSAqIG9wdGlvbnMuYnVmZmVyIC8gb3B0aW9ucy5leHRlbnQsXG4gICAgICAgICAgICBrMiA9IDAuNSAtIGsxLFxuICAgICAgICAgICAgazMgPSAwLjUgKyBrMSxcbiAgICAgICAgICAgIGs0ID0gMSArIGsxLFxuICAgICAgICAgICAgdGwsIGJsLCB0ciwgYnIsIGxlZnQsIHJpZ2h0O1xuXG4gICAgICAgIHRsID0gYmwgPSB0ciA9IGJyID0gbnVsbDtcblxuICAgICAgICBsZWZ0ICA9IGNsaXAoZmVhdHVyZXMsIHoyLCB4IC0gazEsIHggKyBrMywgMCwgaW50ZXJzZWN0WCwgdGlsZS5taW5bMF0sIHRpbGUubWF4WzBdKTtcbiAgICAgICAgcmlnaHQgPSBjbGlwKGZlYXR1cmVzLCB6MiwgeCArIGsyLCB4ICsgazQsIDAsIGludGVyc2VjdFgsIHRpbGUubWluWzBdLCB0aWxlLm1heFswXSk7XG5cbiAgICAgICAgaWYgKGxlZnQpIHtcbiAgICAgICAgICAgIHRsID0gY2xpcChsZWZ0LCB6MiwgeSAtIGsxLCB5ICsgazMsIDEsIGludGVyc2VjdFksIHRpbGUubWluWzFdLCB0aWxlLm1heFsxXSk7XG4gICAgICAgICAgICBibCA9IGNsaXAobGVmdCwgejIsIHkgKyBrMiwgeSArIGs0LCAxLCBpbnRlcnNlY3RZLCB0aWxlLm1pblsxXSwgdGlsZS5tYXhbMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJpZ2h0KSB7XG4gICAgICAgICAgICB0ciA9IGNsaXAocmlnaHQsIHoyLCB5IC0gazEsIHkgKyBrMywgMSwgaW50ZXJzZWN0WSwgdGlsZS5taW5bMV0sIHRpbGUubWF4WzFdKTtcbiAgICAgICAgICAgIGJyID0gY2xpcChyaWdodCwgejIsIHkgKyBrMiwgeSArIGs0LCAxLCBpbnRlcnNlY3RZLCB0aWxlLm1pblsxXSwgdGlsZS5tYXhbMV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlYnVnID4gMSkgY29uc29sZS50aW1lRW5kKCdjbGlwcGluZycpO1xuXG4gICAgICAgIGlmIChmZWF0dXJlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHN0YWNrLnB1c2godGwgfHwgW10sIHogKyAxLCB4ICogMiwgICAgIHkgKiAyKTtcbiAgICAgICAgICAgIHN0YWNrLnB1c2goYmwgfHwgW10sIHogKyAxLCB4ICogMiwgICAgIHkgKiAyICsgMSk7XG4gICAgICAgICAgICBzdGFjay5wdXNoKHRyIHx8IFtdLCB6ICsgMSwgeCAqIDIgKyAxLCB5ICogMik7XG4gICAgICAgICAgICBzdGFjay5wdXNoKGJyIHx8IFtdLCB6ICsgMSwgeCAqIDIgKyAxLCB5ICogMiArIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvbGlkO1xufTtcblxuR2VvSlNPTlZULnByb3RvdHlwZS5nZXRUaWxlID0gZnVuY3Rpb24gKHosIHgsIHkpIHtcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcbiAgICAgICAgZXh0ZW50ID0gb3B0aW9ucy5leHRlbnQsXG4gICAgICAgIGRlYnVnID0gb3B0aW9ucy5kZWJ1ZztcblxuICAgIHZhciB6MiA9IDEgPDwgejtcbiAgICB4ID0gKCh4ICUgejIpICsgejIpICUgejI7IC8vIHdyYXAgdGlsZSB4IGNvb3JkaW5hdGVcblxuICAgIHZhciBpZCA9IHRvSUQoeiwgeCwgeSk7XG4gICAgaWYgKHRoaXMudGlsZXNbaWRdKSByZXR1cm4gdHJhbnNmb3JtLnRpbGUodGhpcy50aWxlc1tpZF0sIGV4dGVudCk7XG5cbiAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLmxvZygnZHJpbGxpbmcgZG93biB0byB6JWQtJWQtJWQnLCB6LCB4LCB5KTtcblxuICAgIHZhciB6MCA9IHosXG4gICAgICAgIHgwID0geCxcbiAgICAgICAgeTAgPSB5LFxuICAgICAgICBwYXJlbnQ7XG5cbiAgICB3aGlsZSAoIXBhcmVudCAmJiB6MCA+IDApIHtcbiAgICAgICAgejAtLTtcbiAgICAgICAgeDAgPSBNYXRoLmZsb29yKHgwIC8gMik7XG4gICAgICAgIHkwID0gTWF0aC5mbG9vcih5MCAvIDIpO1xuICAgICAgICBwYXJlbnQgPSB0aGlzLnRpbGVzW3RvSUQoejAsIHgwLCB5MCldO1xuICAgIH1cblxuICAgIGlmICghcGFyZW50IHx8ICFwYXJlbnQuc291cmNlKSByZXR1cm4gbnVsbDtcblxuICAgIC8vIGlmIHdlIGZvdW5kIGEgcGFyZW50IHRpbGUgY29udGFpbmluZyB0aGUgb3JpZ2luYWwgZ2VvbWV0cnksIHdlIGNhbiBkcmlsbCBkb3duIGZyb20gaXRcbiAgICBpZiAoZGVidWcgPiAxKSBjb25zb2xlLmxvZygnZm91bmQgcGFyZW50IHRpbGUgeiVkLSVkLSVkJywgejAsIHgwLCB5MCk7XG5cbiAgICAvLyBpdCBwYXJlbnQgdGlsZSBpcyBhIHNvbGlkIGNsaXBwZWQgc3F1YXJlLCByZXR1cm4gaXQgaW5zdGVhZCBzaW5jZSBpdCdzIGlkZW50aWNhbFxuICAgIGlmIChpc0NsaXBwZWRTcXVhcmUocGFyZW50LCBleHRlbnQsIG9wdGlvbnMuYnVmZmVyKSkgcmV0dXJuIHRyYW5zZm9ybS50aWxlKHBhcmVudCwgZXh0ZW50KTtcblxuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZSgnZHJpbGxpbmcgZG93bicpO1xuICAgIHZhciBzb2xpZCA9IHRoaXMuc3BsaXRUaWxlKHBhcmVudC5zb3VyY2UsIHowLCB4MCwgeTAsIHosIHgsIHkpO1xuICAgIGlmIChkZWJ1ZyA+IDEpIGNvbnNvbGUudGltZUVuZCgnZHJpbGxpbmcgZG93bicpO1xuXG4gICAgLy8gb25lIG9mIHRoZSBwYXJlbnQgdGlsZXMgd2FzIGEgc29saWQgY2xpcHBlZCBzcXVhcmVcbiAgICBpZiAoc29saWQgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIG0gPSAxIDw8ICh6IC0gc29saWQpO1xuICAgICAgICBpZCA9IHRvSUQoc29saWQsIE1hdGguZmxvb3IoeCAvIG0pLCBNYXRoLmZsb29yKHkgLyBtKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudGlsZXNbaWRdID8gdHJhbnNmb3JtLnRpbGUodGhpcy50aWxlc1tpZF0sIGV4dGVudCkgOiBudWxsO1xufTtcblxuZnVuY3Rpb24gdG9JRCh6LCB4LCB5KSB7XG4gICAgcmV0dXJuICgoKDEgPDwgeikgKiB5ICsgeCkgKiAzMikgKyB6O1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RYKGEsIGIsIHgpIHtcbiAgICByZXR1cm4gW3gsICh4IC0gYVswXSkgKiAoYlsxXSAtIGFbMV0pIC8gKGJbMF0gLSBhWzBdKSArIGFbMV0sIDFdO1xufVxuZnVuY3Rpb24gaW50ZXJzZWN0WShhLCBiLCB5KSB7XG4gICAgcmV0dXJuIFsoeSAtIGFbMV0pICogKGJbMF0gLSBhWzBdKSAvIChiWzFdIC0gYVsxXSkgKyBhWzBdLCB5LCAxXTtcbn1cblxuZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYykge1xuICAgIGZvciAodmFyIGkgaW4gc3JjKSBkZXN0W2ldID0gc3JjW2ldO1xuICAgIHJldHVybiBkZXN0O1xufVxuXG4vLyBjaGVja3Mgd2hldGhlciBhIHRpbGUgaXMgYSB3aG9sZS1hcmVhIGZpbGwgYWZ0ZXIgY2xpcHBpbmc7IGlmIGl0IGlzLCB0aGVyZSdzIG5vIHNlbnNlIHNsaWNpbmcgaXQgZnVydGhlclxuZnVuY3Rpb24gaXNDbGlwcGVkU3F1YXJlKHRpbGUsIGV4dGVudCwgYnVmZmVyKSB7XG5cbiAgICB2YXIgZmVhdHVyZXMgPSB0aWxlLnNvdXJjZTtcbiAgICBpZiAoZmVhdHVyZXMubGVuZ3RoICE9PSAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgZmVhdHVyZSA9IGZlYXR1cmVzWzBdO1xuICAgIGlmIChmZWF0dXJlLnR5cGUgIT09IDMgfHwgZmVhdHVyZS5nZW9tZXRyeS5sZW5ndGggPiAxKSByZXR1cm4gZmFsc2U7XG5cbiAgICB2YXIgbGVuID0gZmVhdHVyZS5nZW9tZXRyeVswXS5sZW5ndGg7XG4gICAgaWYgKGxlbiAhPT0gNSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgcCA9IHRyYW5zZm9ybS5wb2ludChmZWF0dXJlLmdlb21ldHJ5WzBdW2ldLCBleHRlbnQsIHRpbGUuejIsIHRpbGUueCwgdGlsZS55KTtcbiAgICAgICAgaWYgKChwWzBdICE9PSAtYnVmZmVyICYmIHBbMF0gIT09IGV4dGVudCArIGJ1ZmZlcikgfHxcbiAgICAgICAgICAgIChwWzFdICE9PSAtYnVmZmVyICYmIHBbMV0gIT09IGV4dGVudCArIGJ1ZmZlcikpIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBzaW1wbGlmeTtcblxuLy8gY2FsY3VsYXRlIHNpbXBsaWZpY2F0aW9uIGRhdGEgdXNpbmcgb3B0aW1pemVkIERvdWdsYXMtUGV1Y2tlciBhbGdvcml0aG1cblxuZnVuY3Rpb24gc2ltcGxpZnkocG9pbnRzLCB0b2xlcmFuY2UpIHtcblxuICAgIHZhciBzcVRvbGVyYW5jZSA9IHRvbGVyYW5jZSAqIHRvbGVyYW5jZSxcbiAgICAgICAgbGVuID0gcG9pbnRzLmxlbmd0aCxcbiAgICAgICAgZmlyc3QgPSAwLFxuICAgICAgICBsYXN0ID0gbGVuIC0gMSxcbiAgICAgICAgc3RhY2sgPSBbXSxcbiAgICAgICAgaSwgbWF4U3FEaXN0LCBzcURpc3QsIGluZGV4O1xuXG4gICAgLy8gYWx3YXlzIHJldGFpbiB0aGUgZW5kcG9pbnRzICgxIGlzIHRoZSBtYXggdmFsdWUpXG4gICAgcG9pbnRzW2ZpcnN0XVsyXSA9IDE7XG4gICAgcG9pbnRzW2xhc3RdWzJdID0gMTtcblxuICAgIC8vIGF2b2lkIHJlY3Vyc2lvbiBieSB1c2luZyBhIHN0YWNrXG4gICAgd2hpbGUgKGxhc3QpIHtcblxuICAgICAgICBtYXhTcURpc3QgPSAwO1xuXG4gICAgICAgIGZvciAoaSA9IGZpcnN0ICsgMTsgaSA8IGxhc3Q7IGkrKykge1xuICAgICAgICAgICAgc3FEaXN0ID0gZ2V0U3FTZWdEaXN0KHBvaW50c1tpXSwgcG9pbnRzW2ZpcnN0XSwgcG9pbnRzW2xhc3RdKTtcblxuICAgICAgICAgICAgaWYgKHNxRGlzdCA+IG1heFNxRGlzdCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICBtYXhTcURpc3QgPSBzcURpc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWF4U3FEaXN0ID4gc3FUb2xlcmFuY2UpIHtcbiAgICAgICAgICAgIHBvaW50c1tpbmRleF1bMl0gPSBtYXhTcURpc3Q7IC8vIHNhdmUgdGhlIHBvaW50IGltcG9ydGFuY2UgaW4gc3F1YXJlZCBwaXhlbHMgYXMgYSB6IGNvb3JkaW5hdGVcbiAgICAgICAgICAgIHN0YWNrLnB1c2goZmlyc3QpO1xuICAgICAgICAgICAgc3RhY2sucHVzaChpbmRleCk7XG4gICAgICAgICAgICBmaXJzdCA9IGluZGV4O1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0ID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgICBmaXJzdCA9IHN0YWNrLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBzcXVhcmUgZGlzdGFuY2UgZnJvbSBhIHBvaW50IHRvIGEgc2VnbWVudFxuZnVuY3Rpb24gZ2V0U3FTZWdEaXN0KHAsIGEsIGIpIHtcblxuICAgIHZhciB4ID0gYVswXSwgeSA9IGFbMV0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLFxuICAgICAgICBweCA9IHBbMF0sIHB5ID0gcFsxXSxcbiAgICAgICAgZHggPSBieCAtIHgsXG4gICAgICAgIGR5ID0gYnkgLSB5O1xuXG4gICAgaWYgKGR4ICE9PSAwIHx8IGR5ICE9PSAwKSB7XG5cbiAgICAgICAgdmFyIHQgPSAoKHB4IC0geCkgKiBkeCArIChweSAtIHkpICogZHkpIC8gKGR4ICogZHggKyBkeSAqIGR5KTtcblxuICAgICAgICBpZiAodCA+IDEpIHtcbiAgICAgICAgICAgIHggPSBieDtcbiAgICAgICAgICAgIHkgPSBieTtcblxuICAgICAgICB9IGVsc2UgaWYgKHQgPiAwKSB7XG4gICAgICAgICAgICB4ICs9IGR4ICogdDtcbiAgICAgICAgICAgIHkgKz0gZHkgKiB0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZHggPSBweCAtIHg7XG4gICAgZHkgPSBweSAtIHk7XG5cbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlVGlsZTtcblxuZnVuY3Rpb24gY3JlYXRlVGlsZShmZWF0dXJlcywgejIsIHR4LCB0eSwgdG9sZXJhbmNlLCBub1NpbXBsaWZ5KSB7XG4gICAgdmFyIHRpbGUgPSB7XG4gICAgICAgIGZlYXR1cmVzOiBbXSxcbiAgICAgICAgbnVtUG9pbnRzOiAwLFxuICAgICAgICBudW1TaW1wbGlmaWVkOiAwLFxuICAgICAgICBudW1GZWF0dXJlczogMCxcbiAgICAgICAgc291cmNlOiBudWxsLFxuICAgICAgICB4OiB0eCxcbiAgICAgICAgeTogdHksXG4gICAgICAgIHoyOiB6MixcbiAgICAgICAgdHJhbnNmb3JtZWQ6IGZhbHNlLFxuICAgICAgICBtaW46IFsyLCAxXSxcbiAgICAgICAgbWF4OiBbLTEsIDBdXG4gICAgfTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRpbGUubnVtRmVhdHVyZXMrKztcbiAgICAgICAgYWRkRmVhdHVyZSh0aWxlLCBmZWF0dXJlc1tpXSwgdG9sZXJhbmNlLCBub1NpbXBsaWZ5KTtcblxuICAgICAgICB2YXIgbWluID0gZmVhdHVyZXNbaV0ubWluLFxuICAgICAgICAgICAgbWF4ID0gZmVhdHVyZXNbaV0ubWF4O1xuXG4gICAgICAgIGlmIChtaW5bMF0gPCB0aWxlLm1pblswXSkgdGlsZS5taW5bMF0gPSBtaW5bMF07XG4gICAgICAgIGlmIChtaW5bMV0gPCB0aWxlLm1pblsxXSkgdGlsZS5taW5bMV0gPSBtaW5bMV07XG4gICAgICAgIGlmIChtYXhbMF0gPiB0aWxlLm1heFswXSkgdGlsZS5tYXhbMF0gPSBtYXhbMF07XG4gICAgICAgIGlmIChtYXhbMV0gPiB0aWxlLm1heFsxXSkgdGlsZS5tYXhbMV0gPSBtYXhbMV07XG4gICAgfVxuICAgIHJldHVybiB0aWxlO1xufVxuXG5mdW5jdGlvbiBhZGRGZWF0dXJlKHRpbGUsIGZlYXR1cmUsIHRvbGVyYW5jZSwgbm9TaW1wbGlmeSkge1xuXG4gICAgdmFyIGdlb20gPSBmZWF0dXJlLmdlb21ldHJ5LFxuICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlLFxuICAgICAgICBzaW1wbGlmaWVkID0gW10sXG4gICAgICAgIHNxVG9sZXJhbmNlID0gdG9sZXJhbmNlICogdG9sZXJhbmNlLFxuICAgICAgICBpLCBqLCByaW5nLCBwO1xuXG4gICAgaWYgKHR5cGUgPT09IDEpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGdlb20ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNpbXBsaWZpZWQucHVzaChnZW9tW2ldKTtcbiAgICAgICAgICAgIHRpbGUubnVtUG9pbnRzKys7XG4gICAgICAgICAgICB0aWxlLm51bVNpbXBsaWZpZWQrKztcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgICAvLyBzaW1wbGlmeSBhbmQgdHJhbnNmb3JtIHByb2plY3RlZCBjb29yZGluYXRlcyBmb3IgdGlsZSBnZW9tZXRyeVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZ2VvbS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmluZyA9IGdlb21baV07XG5cbiAgICAgICAgICAgIC8vIGZpbHRlciBvdXQgdGlueSBwb2x5bGluZXMgJiBwb2x5Z29uc1xuICAgICAgICAgICAgaWYgKCFub1NpbXBsaWZ5ICYmICgodHlwZSA9PT0gMiAmJiByaW5nLmRpc3QgPCB0b2xlcmFuY2UpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICh0eXBlID09PSAzICYmIHJpbmcuYXJlYSA8IHNxVG9sZXJhbmNlKSkpIHtcbiAgICAgICAgICAgICAgICB0aWxlLm51bVBvaW50cyArPSByaW5nLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNpbXBsaWZpZWRSaW5nID0gW107XG5cbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCByaW5nLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgcCA9IHJpbmdbal07XG4gICAgICAgICAgICAgICAgLy8ga2VlcCBwb2ludHMgd2l0aCBpbXBvcnRhbmNlID4gdG9sZXJhbmNlXG4gICAgICAgICAgICAgICAgaWYgKG5vU2ltcGxpZnkgfHwgcFsyXSA+IHNxVG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpbXBsaWZpZWRSaW5nLnB1c2gocCk7XG4gICAgICAgICAgICAgICAgICAgIHRpbGUubnVtU2ltcGxpZmllZCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aWxlLm51bVBvaW50cysrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gMykgcmV3aW5kKHNpbXBsaWZpZWRSaW5nLCByaW5nLm91dGVyKTtcblxuICAgICAgICAgICAgc2ltcGxpZmllZC5wdXNoKHNpbXBsaWZpZWRSaW5nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzaW1wbGlmaWVkLmxlbmd0aCkge1xuICAgICAgICB2YXIgdGlsZUZlYXR1cmUgPSB7XG4gICAgICAgICAgICBnZW9tZXRyeTogc2ltcGxpZmllZCxcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICB0YWdzOiBmZWF0dXJlLnRhZ3MgfHwgbnVsbFxuICAgICAgICB9O1xuICAgICAgICBpZiAoZmVhdHVyZS5pZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdGlsZUZlYXR1cmUuaWQgPSBmZWF0dXJlLmlkO1xuICAgICAgICB9XG4gICAgICAgIHRpbGUuZmVhdHVyZXMucHVzaCh0aWxlRmVhdHVyZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZXdpbmQocmluZywgY2xvY2t3aXNlKSB7XG4gICAgdmFyIGFyZWEgPSBzaWduZWRBcmVhKHJpbmcpO1xuICAgIGlmIChhcmVhIDwgMCA9PT0gY2xvY2t3aXNlKSByaW5nLnJldmVyc2UoKTtcbn1cblxuZnVuY3Rpb24gc2lnbmVkQXJlYShyaW5nKSB7XG4gICAgdmFyIHN1bSA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHJpbmcubGVuZ3RoLCBqID0gbGVuIC0gMSwgcDEsIHAyOyBpIDwgbGVuOyBqID0gaSsrKSB7XG4gICAgICAgIHAxID0gcmluZ1tpXTtcbiAgICAgICAgcDIgPSByaW5nW2pdO1xuICAgICAgICBzdW0gKz0gKHAyWzBdIC0gcDFbMF0pICogKHAxWzFdICsgcDJbMV0pO1xuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLnRpbGUgPSB0cmFuc2Zvcm1UaWxlO1xuZXhwb3J0cy5wb2ludCA9IHRyYW5zZm9ybVBvaW50O1xuXG4vLyBUcmFuc2Zvcm1zIHRoZSBjb29yZGluYXRlcyBvZiBlYWNoIGZlYXR1cmUgaW4gdGhlIGdpdmVuIHRpbGUgZnJvbVxuLy8gbWVyY2F0b3ItcHJvamVjdGVkIHNwYWNlIGludG8gKGV4dGVudCB4IGV4dGVudCkgdGlsZSBzcGFjZS5cbmZ1bmN0aW9uIHRyYW5zZm9ybVRpbGUodGlsZSwgZXh0ZW50KSB7XG4gICAgaWYgKHRpbGUudHJhbnNmb3JtZWQpIHJldHVybiB0aWxlO1xuXG4gICAgdmFyIHoyID0gdGlsZS56MixcbiAgICAgICAgdHggPSB0aWxlLngsXG4gICAgICAgIHR5ID0gdGlsZS55LFxuICAgICAgICBpLCBqLCBrO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IHRpbGUuZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZlYXR1cmUgPSB0aWxlLmZlYXR1cmVzW2ldLFxuICAgICAgICAgICAgZ2VvbSA9IGZlYXR1cmUuZ2VvbWV0cnksXG4gICAgICAgICAgICB0eXBlID0gZmVhdHVyZS50eXBlO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgZ2VvbS5sZW5ndGg7IGorKykgZ2VvbVtqXSA9IHRyYW5zZm9ybVBvaW50KGdlb21bal0sIGV4dGVudCwgejIsIHR4LCB0eSk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBnZW9tLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJpbmcgPSBnZW9tW2pdO1xuICAgICAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByaW5nLmxlbmd0aDsgaysrKSByaW5nW2tdID0gdHJhbnNmb3JtUG9pbnQocmluZ1trXSwgZXh0ZW50LCB6MiwgdHgsIHR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRpbGUudHJhbnNmb3JtZWQgPSB0cnVlO1xuXG4gICAgcmV0dXJuIHRpbGU7XG59XG5cbmZ1bmN0aW9uIHRyYW5zZm9ybVBvaW50KHAsIGV4dGVudCwgejIsIHR4LCB0eSkge1xuICAgIHZhciB4ID0gTWF0aC5yb3VuZChleHRlbnQgKiAocFswXSAqIHoyIC0gdHgpKSxcbiAgICAgICAgeSA9IE1hdGgucm91bmQoZXh0ZW50ICogKHBbMV0gKiB6MiAtIHR5KSk7XG4gICAgcmV0dXJuIFt4LCB5XTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNsaXAgPSByZXF1aXJlKCcuL2NsaXAnKTtcbnZhciBjcmVhdGVGZWF0dXJlID0gcmVxdWlyZSgnLi9mZWF0dXJlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcDtcblxuZnVuY3Rpb24gd3JhcChmZWF0dXJlcywgYnVmZmVyLCBpbnRlcnNlY3RYKSB7XG4gICAgdmFyIG1lcmdlZCA9IGZlYXR1cmVzLFxuICAgICAgICBsZWZ0ICA9IGNsaXAoZmVhdHVyZXMsIDEsIC0xIC0gYnVmZmVyLCBidWZmZXIsICAgICAwLCBpbnRlcnNlY3RYLCAtMSwgMiksIC8vIGxlZnQgd29ybGQgY29weVxuICAgICAgICByaWdodCA9IGNsaXAoZmVhdHVyZXMsIDEsICAxIC0gYnVmZmVyLCAyICsgYnVmZmVyLCAwLCBpbnRlcnNlY3RYLCAtMSwgMik7IC8vIHJpZ2h0IHdvcmxkIGNvcHlcblxuICAgIGlmIChsZWZ0IHx8IHJpZ2h0KSB7XG4gICAgICAgIG1lcmdlZCA9IGNsaXAoZmVhdHVyZXMsIDEsIC1idWZmZXIsIDEgKyBidWZmZXIsIDAsIGludGVyc2VjdFgsIC0xLCAyKSB8fCBbXTsgLy8gY2VudGVyIHdvcmxkIGNvcHlcblxuICAgICAgICBpZiAobGVmdCkgbWVyZ2VkID0gc2hpZnRGZWF0dXJlQ29vcmRzKGxlZnQsIDEpLmNvbmNhdChtZXJnZWQpOyAvLyBtZXJnZSBsZWZ0IGludG8gY2VudGVyXG4gICAgICAgIGlmIChyaWdodCkgbWVyZ2VkID0gbWVyZ2VkLmNvbmNhdChzaGlmdEZlYXR1cmVDb29yZHMocmlnaHQsIC0xKSk7IC8vIG1lcmdlIHJpZ2h0IGludG8gY2VudGVyXG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZDtcbn1cblxuZnVuY3Rpb24gc2hpZnRGZWF0dXJlQ29vcmRzKGZlYXR1cmVzLCBvZmZzZXQpIHtcbiAgICB2YXIgbmV3RmVhdHVyZXMgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZlYXR1cmUgPSBmZWF0dXJlc1tpXSxcbiAgICAgICAgICAgIHR5cGUgPSBmZWF0dXJlLnR5cGU7XG5cbiAgICAgICAgdmFyIG5ld0dlb21ldHJ5O1xuXG4gICAgICAgIGlmICh0eXBlID09PSAxKSB7XG4gICAgICAgICAgICBuZXdHZW9tZXRyeSA9IHNoaWZ0Q29vcmRzKGZlYXR1cmUuZ2VvbWV0cnksIG9mZnNldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdHZW9tZXRyeSA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmZWF0dXJlLmdlb21ldHJ5Lmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgbmV3R2VvbWV0cnkucHVzaChzaGlmdENvb3JkcyhmZWF0dXJlLmdlb21ldHJ5W2pdLCBvZmZzZXQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG5ld0ZlYXR1cmVzLnB1c2goY3JlYXRlRmVhdHVyZShmZWF0dXJlLnRhZ3MsIHR5cGUsIG5ld0dlb21ldHJ5LCBmZWF0dXJlLmlkKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0ZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBzaGlmdENvb3Jkcyhwb2ludHMsIG9mZnNldCkge1xuICAgIHZhciBuZXdQb2ludHMgPSBbXTtcbiAgICBuZXdQb2ludHMuYXJlYSA9IHBvaW50cy5hcmVhO1xuICAgIG5ld1BvaW50cy5kaXN0ID0gcG9pbnRzLmRpc3Q7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBuZXdQb2ludHMucHVzaChbcG9pbnRzW2ldWzBdICsgb2Zmc2V0LCBwb2ludHNbaV1bMV0sIHBvaW50c1tpXVsyXV0pO1xuICAgIH1cbiAgICByZXR1cm4gbmV3UG9pbnRzO1xufVxuIl19\n\n\t\t\t(function (global, factory) {\n  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :\n  typeof define === 'function' && define.amd ? define(['exports'], factory) :\n  (factory((global.topojson = global.topojson || {})));\n}(this, (function (exports) { 'use strict';\n\nfunction noop() {}\n\nfunction transformAbsolute(transform) {\n  if (!transform) return noop;\n  var x0,\n      y0,\n      kx = transform.scale[0],\n      ky = transform.scale[1],\n      dx = transform.translate[0],\n      dy = transform.translate[1];\n  return function(point, i) {\n    if (!i) x0 = y0 = 0;\n    point[0] = (x0 += point[0]) * kx + dx;\n    point[1] = (y0 += point[1]) * ky + dy;\n  };\n}\n\nfunction transformRelative(transform) {\n  if (!transform) return noop;\n  var x0,\n      y0,\n      kx = transform.scale[0],\n      ky = transform.scale[1],\n      dx = transform.translate[0],\n      dy = transform.translate[1];\n  return function(point, i) {\n    if (!i) x0 = y0 = 0;\n    var x1 = Math.round((point[0] - dx) / kx),\n        y1 = Math.round((point[1] - dy) / ky);\n    point[0] = x1 - x0;\n    point[1] = y1 - y0;\n    x0 = x1;\n    y0 = y1;\n  };\n}\n\nfunction reverse(array, n) {\n  var t, j = array.length, i = j - n;\n  while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;\n}\n\nfunction bisect(a, x) {\n  var lo = 0, hi = a.length;\n  while (lo < hi) {\n    var mid = lo + hi >>> 1;\n    if (a[mid] < x) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}\n\nfunction feature(topology, o) {\n  return o.type === \"GeometryCollection\" ? {\n    type: \"FeatureCollection\",\n    features: o.geometries.map(function(o) { return feature$1(topology, o); })\n  } : feature$1(topology, o);\n}\n\nfunction feature$1(topology, o) {\n  var f = {\n    type: \"Feature\",\n    id: o.id,\n    properties: o.properties || {},\n    geometry: object(topology, o)\n  };\n  if (o.id == null) delete f.id;\n  return f;\n}\n\nfunction object(topology, o) {\n  var absolute = transformAbsolute(topology.transform),\n      arcs = topology.arcs;\n\n  function arc(i, points) {\n    if (points.length) points.pop();\n    for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length, p; k < n; ++k) {\n      points.push(p = a[k].slice());\n      absolute(p, k);\n    }\n    if (i < 0) reverse(points, n);\n  }\n\n  function point(p) {\n    p = p.slice();\n    absolute(p, 0);\n    return p;\n  }\n\n  function line(arcs) {\n    var points = [];\n    for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);\n    if (points.length < 2) points.push(points[0].slice());\n    return points;\n  }\n\n  function ring(arcs) {\n    var points = line(arcs);\n    while (points.length < 4) points.push(points[0].slice());\n    return points;\n  }\n\n  function polygon(arcs) {\n    return arcs.map(ring);\n  }\n\n  function geometry(o) {\n    var t = o.type;\n    return t === \"GeometryCollection\" ? {type: t, geometries: o.geometries.map(geometry)}\n        : t in geometryType ? {type: t, coordinates: geometryType[t](o)}\n        : null;\n  }\n\n  var geometryType = {\n    Point: function(o) { return point(o.coordinates); },\n    MultiPoint: function(o) { return o.coordinates.map(point); },\n    LineString: function(o) { return line(o.arcs); },\n    MultiLineString: function(o) { return o.arcs.map(line); },\n    Polygon: function(o) { return polygon(o.arcs); },\n    MultiPolygon: function(o) { return o.arcs.map(polygon); }\n  };\n\n  return geometry(o);\n}\n\nfunction stitchArcs(topology, arcs) {\n  var stitchedArcs = {},\n      fragmentByStart = {},\n      fragmentByEnd = {},\n      fragments = [],\n      emptyIndex = -1;\n\n  // Stitch empty arcs first, since they may be subsumed by other arcs.\n  arcs.forEach(function(i, j) {\n    var arc = topology.arcs[i < 0 ? ~i : i], t;\n    if (arc.length < 3 && !arc[1][0] && !arc[1][1]) {\n      t = arcs[++emptyIndex], arcs[emptyIndex] = i, arcs[j] = t;\n    }\n  });\n\n  arcs.forEach(function(i) {\n    var e = ends(i),\n        start = e[0],\n        end = e[1],\n        f, g;\n\n    if (f = fragmentByEnd[start]) {\n      delete fragmentByEnd[f.end];\n      f.push(i);\n      f.end = end;\n      if (g = fragmentByStart[end]) {\n        delete fragmentByStart[g.start];\n        var fg = g === f ? f : f.concat(g);\n        fragmentByStart[fg.start = f.start] = fragmentByEnd[fg.end = g.end] = fg;\n      } else {\n        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n      }\n    } else if (f = fragmentByStart[end]) {\n      delete fragmentByStart[f.start];\n      f.unshift(i);\n      f.start = start;\n      if (g = fragmentByEnd[start]) {\n        delete fragmentByEnd[g.end];\n        var gf = g === f ? f : g.concat(f);\n        fragmentByStart[gf.start = g.start] = fragmentByEnd[gf.end = f.end] = gf;\n      } else {\n        fragmentByStart[f.start] = fragmentByEnd[f.end] = f;\n      }\n    } else {\n      f = [i];\n      fragmentByStart[f.start = start] = fragmentByEnd[f.end = end] = f;\n    }\n  });\n\n  function ends(i) {\n    var arc = topology.arcs[i < 0 ? ~i : i], p0 = arc[0], p1;\n    if (topology.transform) p1 = [0, 0], arc.forEach(function(dp) { p1[0] += dp[0], p1[1] += dp[1]; });\n    else p1 = arc[arc.length - 1];\n    return i < 0 ? [p1, p0] : [p0, p1];\n  }\n\n  function flush(fragmentByEnd, fragmentByStart) {\n    for (var k in fragmentByEnd) {\n      var f = fragmentByEnd[k];\n      delete fragmentByStart[f.start];\n      delete f.start;\n      delete f.end;\n      f.forEach(function(i) { stitchedArcs[i < 0 ? ~i : i] = 1; });\n      fragments.push(f);\n    }\n  }\n\n  flush(fragmentByEnd, fragmentByStart);\n  flush(fragmentByStart, fragmentByEnd);\n  arcs.forEach(function(i) { if (!stitchedArcs[i < 0 ? ~i : i]) fragments.push([i]); });\n\n  return fragments;\n}\n\nfunction mesh(topology) {\n  return object(topology, meshArcs.apply(this, arguments));\n}\n\nfunction meshArcs(topology, o, filter) {\n  var arcs = [];\n\n  function arc(i) {\n    var j = i < 0 ? ~i : i;\n    (geomsByArc[j] || (geomsByArc[j] = [])).push({i: i, g: geom});\n  }\n\n  function line(arcs) {\n    arcs.forEach(arc);\n  }\n\n  function polygon(arcs) {\n    arcs.forEach(line);\n  }\n\n  function geometry(o) {\n    if (o.type === \"GeometryCollection\") o.geometries.forEach(geometry);\n    else if (o.type in geometryType) geom = o, geometryType[o.type](o.arcs);\n  }\n\n  if (arguments.length > 1) {\n    var geomsByArc = [],\n        geom;\n\n    var geometryType = {\n      LineString: line,\n      MultiLineString: polygon,\n      Polygon: polygon,\n      MultiPolygon: function(arcs) { arcs.forEach(polygon); }\n    };\n\n    geometry(o);\n\n    geomsByArc.forEach(arguments.length < 3\n        ? function(geoms) { arcs.push(geoms[0].i); }\n        : function(geoms) { if (filter(geoms[0].g, geoms[geoms.length - 1].g)) arcs.push(geoms[0].i); });\n  } else {\n    for (var i = 0, n = topology.arcs.length; i < n; ++i) arcs.push(i);\n  }\n\n  return {type: \"MultiLineString\", arcs: stitchArcs(topology, arcs)};\n}\n\nfunction cartesianTriangleArea(triangle) {\n  var a = triangle[0], b = triangle[1], c = triangle[2];\n  return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1]));\n}\n\nfunction ring(ring) {\n  var i = -1,\n      n = ring.length,\n      a,\n      b = ring[n - 1],\n      area = 0;\n\n  while (++i < n) {\n    a = b;\n    b = ring[i];\n    area += a[0] * b[1] - a[1] * b[0];\n  }\n\n  return area / 2;\n}\n\nfunction merge(topology) {\n  return object(topology, mergeArcs.apply(this, arguments));\n}\n\nfunction mergeArcs(topology, objects) {\n  var polygonsByArc = {},\n      polygons = [],\n      components = [];\n\n  objects.forEach(function(o) {\n    if (o.type === \"Polygon\") register(o.arcs);\n    else if (o.type === \"MultiPolygon\") o.arcs.forEach(register);\n  });\n\n  function register(polygon) {\n    polygon.forEach(function(ring$$) {\n      ring$$.forEach(function(arc) {\n        (polygonsByArc[arc = arc < 0 ? ~arc : arc] || (polygonsByArc[arc] = [])).push(polygon);\n      });\n    });\n    polygons.push(polygon);\n  }\n\n  function area(ring$$) {\n    return Math.abs(ring(object(topology, {type: \"Polygon\", arcs: [ring$$]}).coordinates[0]));\n  }\n\n  polygons.forEach(function(polygon) {\n    if (!polygon._) {\n      var component = [],\n          neighbors = [polygon];\n      polygon._ = 1;\n      components.push(component);\n      while (polygon = neighbors.pop()) {\n        component.push(polygon);\n        polygon.forEach(function(ring$$) {\n          ring$$.forEach(function(arc) {\n            polygonsByArc[arc < 0 ? ~arc : arc].forEach(function(polygon) {\n              if (!polygon._) {\n                polygon._ = 1;\n                neighbors.push(polygon);\n              }\n            });\n          });\n        });\n      }\n    }\n  });\n\n  polygons.forEach(function(polygon) {\n    delete polygon._;\n  });\n\n  return {\n    type: \"MultiPolygon\",\n    arcs: components.map(function(polygons) {\n      var arcs = [], n;\n\n      // Extract the exterior (unique) arcs.\n      polygons.forEach(function(polygon) {\n        polygon.forEach(function(ring$$) {\n          ring$$.forEach(function(arc) {\n            if (polygonsByArc[arc < 0 ? ~arc : arc].length < 2) {\n              arcs.push(arc);\n            }\n          });\n        });\n      });\n\n      // Stitch the arcs into one or more rings.\n      arcs = stitchArcs(topology, arcs);\n\n      // If more than one ring is returned,\n      // at most one of these rings can be the exterior;\n      // choose the one with the greatest absolute area.\n      if ((n = arcs.length) > 1) {\n        for (var i = 1, k = area(arcs[0]), ki, t; i < n; ++i) {\n          if ((ki = area(arcs[i])) > k) {\n            t = arcs[0], arcs[0] = arcs[i], arcs[i] = t, k = ki;\n          }\n        }\n      }\n\n      return arcs;\n    })\n  };\n}\n\nfunction neighbors(objects) {\n  var indexesByArc = {}, // arc index -> array of object indexes\n      neighbors = objects.map(function() { return []; });\n\n  function line(arcs, i) {\n    arcs.forEach(function(a) {\n      if (a < 0) a = ~a;\n      var o = indexesByArc[a];\n      if (o) o.push(i);\n      else indexesByArc[a] = [i];\n    });\n  }\n\n  function polygon(arcs, i) {\n    arcs.forEach(function(arc) { line(arc, i); });\n  }\n\n  function geometry(o, i) {\n    if (o.type === \"GeometryCollection\") o.geometries.forEach(function(o) { geometry(o, i); });\n    else if (o.type in geometryType) geometryType[o.type](o.arcs, i);\n  }\n\n  var geometryType = {\n    LineString: line,\n    MultiLineString: polygon,\n    Polygon: polygon,\n    MultiPolygon: function(arcs, i) { arcs.forEach(function(arc) { polygon(arc, i); }); }\n  };\n\n  objects.forEach(geometry);\n\n  for (var i in indexesByArc) {\n    for (var indexes = indexesByArc[i], m = indexes.length, j = 0; j < m; ++j) {\n      for (var k = j + 1; k < m; ++k) {\n        var ij = indexes[j], ik = indexes[k], n;\n        if ((n = neighbors[ij])[i = bisect(n, ik)] !== ik) n.splice(i, 0, ik);\n        if ((n = neighbors[ik])[i = bisect(n, ij)] !== ij) n.splice(i, 0, ij);\n      }\n    }\n  }\n\n  return neighbors;\n}\n\nfunction compareArea(a, b) {\n  return a[1][2] - b[1][2];\n}\n\nfunction minAreaHeap() {\n  var heap = {},\n      array = [],\n      size = 0;\n\n  heap.push = function(object) {\n    up(array[object._ = size] = object, size++);\n    return size;\n  };\n\n  heap.pop = function() {\n    if (size <= 0) return;\n    var removed = array[0], object;\n    if (--size > 0) object = array[size], down(array[object._ = 0] = object, 0);\n    return removed;\n  };\n\n  heap.remove = function(removed) {\n    var i = removed._, object;\n    if (array[i] !== removed) return; // invalid request\n    if (i !== --size) object = array[size], (compareArea(object, removed) < 0 ? up : down)(array[object._ = i] = object, i);\n    return i;\n  };\n\n  function up(object, i) {\n    while (i > 0) {\n      var j = ((i + 1) >> 1) - 1,\n          parent = array[j];\n      if (compareArea(object, parent) >= 0) break;\n      array[parent._ = i] = parent;\n      array[object._ = i = j] = object;\n    }\n  }\n\n  function down(object, i) {\n    while (true) {\n      var r = (i + 1) << 1,\n          l = r - 1,\n          j = i,\n          child = array[j];\n      if (l < size && compareArea(array[l], child) < 0) child = array[j = l];\n      if (r < size && compareArea(array[r], child) < 0) child = array[j = r];\n      if (j === i) break;\n      array[child._ = i] = child;\n      array[object._ = i = j] = object;\n    }\n  }\n\n  return heap;\n}\n\nfunction presimplify(topology, triangleArea) {\n  var absolute = transformAbsolute(topology.transform),\n      relative = transformRelative(topology.transform),\n      heap = minAreaHeap();\n\n  if (!triangleArea) triangleArea = cartesianTriangleArea;\n\n  topology.arcs.forEach(function(arc) {\n    var triangles = [],\n        maxArea = 0,\n        triangle,\n        i,\n        n,\n        p;\n\n    // To store each point’s effective area, we create a new array rather than\n    // extending the passed-in point to workaround a Chrome/V8 bug (getting\n    // stuck in smi mode). For midpoints, the initial effective area of\n    // Infinity will be computed in the next step.\n    for (i = 0, n = arc.length; i < n; ++i) {\n      p = arc[i];\n      absolute(arc[i] = [p[0], p[1], Infinity], i);\n    }\n\n    for (i = 1, n = arc.length - 1; i < n; ++i) {\n      triangle = arc.slice(i - 1, i + 2);\n      triangle[1][2] = triangleArea(triangle);\n      triangles.push(triangle);\n      heap.push(triangle);\n    }\n\n    for (i = 0, n = triangles.length; i < n; ++i) {\n      triangle = triangles[i];\n      triangle.previous = triangles[i - 1];\n      triangle.next = triangles[i + 1];\n    }\n\n    while (triangle = heap.pop()) {\n      var previous = triangle.previous,\n          next = triangle.next;\n\n      // If the area of the current point is less than that of the previous point\n      // to be eliminated, use the latter's area instead. This ensures that the\n      // current point cannot be eliminated without eliminating previously-\n      // eliminated points.\n      if (triangle[1][2] < maxArea) triangle[1][2] = maxArea;\n      else maxArea = triangle[1][2];\n\n      if (previous) {\n        previous.next = next;\n        previous[2] = triangle[2];\n        update(previous);\n      }\n\n      if (next) {\n        next.previous = previous;\n        next[0] = triangle[0];\n        update(next);\n      }\n    }\n\n    arc.forEach(relative);\n  });\n\n  function update(triangle) {\n    heap.remove(triangle);\n    triangle[1][2] = triangleArea(triangle);\n    heap.push(triangle);\n  }\n\n  return topology;\n}\n\nvar version = \"1.6.27\";\n\nexports.version = version;\nexports.mesh = mesh;\nexports.meshArcs = meshArcs;\nexports.merge = merge;\nexports.mergeArcs = mergeArcs;\nexports.feature = feature;\nexports.neighbors = neighbors;\nexports.presimplify = presimplify;\n\nObject.defineProperty(exports, '__esModule', { value: true });\n\n})));\n\n\t\t\tvar slicers = {};\n\t\t\tvar options;\n\n\t\t\tonmessage = function (e) {\n\t\t\t\tif (e.data[0] === 'slice') {\n\t\t\t\t\t// Given a blob of GeoJSON and some topojson/geojson-vt options, do the slicing.\n\t\t\t\t\tvar geojson = e.data[1];\n\t\t\t\t\toptions     = e.data[2];\n\n\t\t\t\t\tif (geojson.type && geojson.type === 'Topology') {\n\t\t\t\t\t\tfor (var layerName in geojson.objects) {\n\t\t\t\t\t\t\tslicers[layerName] = self.geojsonvt(\n\t\t\t\t\t\t\t\tself.topojson.feature(geojson, geojson.objects[layerName])\n\t\t\t\t\t\t\t, options);\n\t\t\t\t\t\t}\n\t\t\t\t\t} else {\n\t\t\t\t\t\tslicers[options.vectorTileLayerName] = self.geojsonvt(geojson, options);\n\t\t\t\t\t}\n\n\t\t\t\t} else if (e.data[0] === 'get') {\n\t\t\t\t\t// Gets the vector tile for the given coordinates, sends it back as a message\n\t\t\t\t\tvar coords = e.data[1];\n\n\t\t\t\t\tvar tileLayers = {};\n\t\t\t\t\tfor (var layerName in slicers) {\n\t\t\t\t\t\tvar slicedTileLayer = slicers[layerName].getTile(coords.z, coords.x, coords.y);\n\n\t\t\t\t\t\tif (slicedTileLayer) {\n\t\t\t\t\t\t\tvar vectorTileLayer = {\n\t\t\t\t\t\t\t\tfeatures: [],\n\t\t\t\t\t\t\t\textent: options.extent,\n\t\t\t\t\t\t\t\tname: options.vectorTileLayerName,\n\t\t\t\t\t\t\t\tlength: slicedTileLayer.features.length\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tfor (var i in slicedTileLayer.features) {\n\t\t\t\t\t\t\t\tvar feat = {\n\t\t\t\t\t\t\t\t\tgeometry: slicedTileLayer.features[i].geometry,\n\t\t\t\t\t\t\t\t\tproperties: slicedTileLayer.features[i].tags,\n\t\t\t\t\t\t\t\t\ttype: slicedTileLayer.features[i].type\t// 1 = point, 2 = line, 3 = polygon\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tvectorTileLayer.features.push(feat);\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\ttileLayers[layerName] = vectorTileLayer;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tpostMessage({ layers: tileLayers, coords: coords });\n\t\t\t\t}\n\t\t\t}\n\t\t";

		// Create a shallow copy of this.options, excluding things that might
		// be functions - we only care about topojson/geojsonvt options
		var options = {};
		for (var i in this.options) {
			if (i !== 'rendererFactory' &&
				i !== 'vectorTileLayerStyles' &&
				typeof (this$1.options[i]) !== 'function'
			) {
				options[i] = this$1.options[i];
			}
		}

		this._worker = new Worker(window.URL.createObjectURL(new Blob([workerCode])));

		// Send initial data to worker.
		this._worker.postMessage(['slice', geojson, options]);

	},


	_getVectorTilePromise: function(coords) {

		var _this = this;

		var p = new Promise( function waitForWorker(res) {
			_this._worker.addEventListener('message', function recv(m) {
				if (m.data.coords &&
				    m.data.coords.x === coords.x &&
				    m.data.coords.y === coords.y &&
				    m.data.coords.z === coords.z ) {

					res(m.data);
					_this._worker.removeEventListener('message', recv);
				}
			});
		});

		this._worker.postMessage(['get', coords]);

		return p;
	},

});


L.vectorGrid.slicer = function (geojson, options) {
	return new L.VectorGrid.Slicer(geojson, options);
};



// Network & Protobuf powered!
// NOTE: Assumes the globals `VectorTile` and `Pbf` exist!!!
L.VectorGrid.Protobuf = L.VectorGrid.extend({

	options: {
		subdomains: 'abc',	// Like L.TileLayer
	},


	initialize: function(url, options) {
		// Inherits options from geojson-vt!
// 		this._slicer = geojsonvt(geojson, options);
		this._url = url;
		L.VectorGrid.prototype.initialize.call(this, options);
	},


	_getSubdomain: L.TileLayer.prototype._getSubdomain,


	_getVectorTilePromise: function(coords) {
		var tileUrl = L.Util.template(this._url, L.extend({
			s: this._getSubdomain(coords),
			x: coords.x,
			y: coords.y,
			z: coords.z
// 			z: this._getZoomForUrl()	/// TODO: Maybe replicate TileLayer's maxNativeZoom
		}, this.options));

		return fetch(tileUrl).then(function(response){

			if (!response.ok) {
				return {layers:[]};
			}

			return response.blob().then( function (blob) {
// 				console.log(blob);

				var reader = new FileReader();
				return new Promise(function(resolve){
					reader.addEventListener("loadend", function() {
						// reader.result contains the contents of blob as a typed array

						// blob.type === 'application/x-protobuf'
						var pbf = new Pbf( reader.result );
// 						console.log(pbf);
						return resolve(new vectorTile.VectorTile( pbf ));

					});
					reader.readAsArrayBuffer(blob);
				});
			});
		}).then(function(json){

// 			console.log('Vector tile:', json.layers);
// 			console.log('Vector tile water:', json.layers.water);	// Instance of VectorTileLayer

			// Normalize feature getters into actual instanced features
			for (var layerName in json.layers) {
				var feats = [];

				for (var i=0; i<json.layers[layerName].length; i++) {
					var feat = json.layers[layerName].feature(i);
					feat.geometry = feat.loadGeometry();
					feats.push(feat);
				}

				json.layers[layerName].features = feats;
			}

			return json;
		});
	}
});


L.vectorGrid.protobuf = function (url, options) {
	return new L.VectorGrid.Protobuf(url, options);
};




//# sourceMappingURL=/home/ivan/devel/Leaflet.VectorGrid/.gobble-build/09-concat/1/Leaflet.VectorGrid.bundled.js.map

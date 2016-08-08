var fs = require("fs");

module.exports = {
    forceDirectory: function (directory) {
        try {
            fs.statSync(directory);
        } catch (e) {
            fs.mkdirSync(directory);
        }
    },
    str: {
        reverse: function (s) {
            var o = '';
            for (var i = s.length - 1; i >= 0; i--)
                o += s[i];
            return o;
        },
        pad: function (s, c, n) {
            if (!s || !c || s.length >= n) {
                return s;
            }
            var max = (n - s.length) / c.length;
            for (var i = 0; i < max; i++) {
                s += c;
            }
            return s;
        },
        random: function (charcount) {
            charcount = charcount || 9;
            s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            for (var i = 0; i < charcount; i++) {
                s += r.charAt(Math.floor(Math.random() * r.length));
            }
            return s;
        },
        explode: function (str, chr, num) {
            var xx = str.toString();
            var pc = xx.split(chr);
            return pc[num];
        }
    },
    verify: {
        mail: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        name: function (name) {
            if (name.length > 20 || name.length < 3) {
                return false;
            }
            var re = /[^A-Za-z\.\ ]/;
            if (re.test(name)) {
                return false;
            }
            return true;
        },
        str: function (str) {
            var r = /[^A-Za-z\.\ \-\_]/;
            if (r.test(str)) {
                return false;
            }
            return true;
        },
        int: function (int) {
            var r = /[^0-9\-]/;
            if (r.test(int)) {
                return false;
            }
            return true;
        },
        pass: function (pw, ver) {
            if (pw !== ver) {
                return 4;
            }
            if (pw.length > 12 || pw.length < 6) {
                return 5;
            }
            var re = /[^A-Za-z0-9 ]/;
            if (re.test(pw)) {
                return 6;
            }
            return 0;
        }
    },
    GetFileExt: function (fileName) {
        if (fileName.indexOf(".") >= 0) {
            return fileName.substr((fileName.lastIndexOf('.') + 1));
        }
        return "";
    },
    urldecode: function (str) {
        return decodeURIComponent((str + '').replace(/\+/g, '%20'));
    },
    rmProto: function (url) {
        var index = url.indexOf('://');
        if (index > -1)
            url = url.substr(index + 3);
        return url;
    },
    fixpath: function (str) {
        return str.replace("\\", "/");
    },
    InArray: function (arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    },
    InArrayEx: function (needle, arrhaystack) {
        return (arrhaystack.indexOf(needle) > -1);
    },
    ObjGetVals: function (obj) {
        var res = [];
        Object.keys(obj).forEach(function (key) {
            res.push(obj[key]);
        });
        return res;
    },
    ObjAddprefix: function (prefix, obj) {
        var n = {};
        var k = Object.keys(obj);
        for (var i = 0; i < k.length; i++) {
            var nk = prefix + "" + k[i];
            n[nk] = obj[k];
        }
        return n;
    },
    ObjDelprefix: function (prefix, obj) {
        var n = {};
        var k = Object.keys(obj);
        for (var i = 0; i < k.length; i++) {
            var nk = k[i].replace(prefix, "");
            n[nk] = obj[k[i]];
        }
        return n;
    },
    sec: {
        base64: {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = this._utf8_encode(input);
                while (i < input.length) {

                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

                }
                return output;
            },
            decode: function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;

                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                while (i < input.length) {

                    enc1 = this._keyStr.indexOf(input.charAt(i++));
                    enc2 = this._keyStr.indexOf(input.charAt(i++));
                    enc3 = this._keyStr.indexOf(input.charAt(i++));
                    enc4 = this._keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output = output + String.fromCharCode(chr1);

                    if (enc3 !== 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 !== 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = this._utf8_decode(output);
                return output;
            },
            _utf8_encode: function (string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";

                for (var n = 0; n < string.length; n++) {

                    var c = string.charCodeAt(n);

                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            },
            _utf8_decode: function (utftext) {
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;

                while (i < utftext.length) {

                    c = utftext.charCodeAt(i);

                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        },
        sha1: {
            _hex_chr: "0123456789abcdef",
            hex: function (num)
            {
                var str = "";
                for (var j = 7; j >= 0; j--)
                    str += this._hex_chr.charAt((num >> (j * 4)) & 0x0F);
                return str;
            },
            str2blks_SHA1: function (str)
            {
                var nblk = ((str.length + 8) >> 6) + 1;
                var blks = new Array(nblk * 16);
                for (var i = 0; i < nblk * 16; i++)
                    blks[i] = 0;
                for (i = 0; i < str.length; i++)
                    blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
                blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
                blks[nblk * 16 - 1] = str.length * 8;
                return blks;
            },
            add: function (x, y)
            {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            },
            rol: function (num, cnt)
            {
                return (num << cnt) | (num >>> (32 - cnt));
            },
            ft: function (t, b, c, d)
            {
                if (t < 20)
                    return (b & c) | ((~b) & d);
                if (t < 40)
                    return b ^ c ^ d;
                if (t < 60)
                    return (b & c) | (b & d) | (c & d);
                return b ^ c ^ d;
            },
            kt: function (t)
            {
                return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
                        (t < 60) ? -1894007588 : -899497514;
            },
            calc: function (str) {
                var x = this.str2blks_SHA1(str);
                var w = new Array(80);
                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;
                var e = -1009589776;

                for (var i = 0; i < x.length; i += 16)
                {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;
                    var olde = e;

                    for (var j = 0; j < 80; j++)
                    {
                        if (j < 16) {
                            w[j] = x[i + j];
                        } else {
                            w[j] = this.rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                        }
                        t = this.add(this.add(this.rol(a, 5), this.ft(j, b, c, d)), this.add(this.add(e, w[j]), this.kt(j)));
                        e = d;
                        d = c;
                        c = this.rol(b, 30);
                        b = a;
                        a = t;
                    }
                    a = this.add(a, olda);
                    b = this.add(b, oldb);
                    c = this.add(c, oldc);
                    d = this.add(d, oldd);
                    e = this.add(e, olde);
                }
                return this.hex(a) + this.hex(b) + this.hex(c) + this.hex(d) + this.hex(e);
            }
        }
    }
};

var e = -1,
    f, g, k, l, p = 'radio',
    q = [],
    r = [],
    t = 'radio',
    u, v, w = !0,
    y = !1,
    z, A = {},
    B = {};

function C() {
    var _0x6239x13 = null;
    if (document[_0xbfc4[1]] && 'radio' !== document[_0xbfc4[1]]) {
        for (var _0x6239x14 = document[_0xbfc4[1]][_0xbfc4[3]](_0xbfc4[2]), _0x6239x15 = 0; _0x6239x15 < _0x6239x14[_0xbfc4[4]]; _0x6239x15++) {
            var _0x6239x16 = jQuery[_0xbfc4[5]](_0x6239x14[_0x6239x15]);
            if (_0xbfc4[6] === _0x6239x16[_0xbfc4[7]](0, 10)) {
                _0x6239x13 = decodeURIComponent(_0x6239x16[_0xbfc4[7]](10));
                break
            }
        }
    };
    return _0x6239x13
}

function D(_0x6239x13) {
    _0x6239x13 = CryptoJS[_0xbfc4[10]][_0xbfc4[9]][_0xbfc4[8]](_0x6239x13);
    var _0x6239x14 = _0x6239x13[_0xbfc4[11]]();
    _0x6239x14[_0xbfc4[12]] = 16;
    _0x6239x14[_0xbfc4[13]]();
    _0x6239x13[_0xbfc4[15]][_0xbfc4[14]](0, 4);
    _0x6239x13[_0xbfc4[12]] -= 16;
    var _0x6239x15 = CryptoJS[_0xbfc4[10]][_0xbfc4[16]][_0xbfc4[8]](z);
    return CryptoJS[_0xbfc4[20]][_0xbfc4[19]]({
        ia: _0x6239x13
    }, _0x6239x15, {
        ya: _0x6239x14,
        mode: CryptoJS[_0xbfc4[18]][_0xbfc4[17]]
    }).toString(CryptoJS[_0xbfc4[10]].H)
}

function E(_0x6239x13) {
    return _0x6239x13[_0xbfc4[22]](0)[_0xbfc4[21]]() + _0x6239x13[_0xbfc4[23]](1)
}
var F = new ol[_0xbfc4[27]][_0xbfc4[26]]({
        source: new ol[_0xbfc4[25]].Z({
            url: _0xbfc4[24]
        })
    }),
    G = new ol.Map({
        Aa: [F],
        target: document[_0xbfc4[29]](_0xbfc4[28]),
        controls: ol[_0xbfc4[31]][_0xbfc4[35]]()[_0xbfc4[34]]([new ol[_0xbfc4[31]][_0xbfc4[30]], new ol[_0xbfc4[31]][_0xbfc4[32]], new ol[_0xbfc4[31]][_0xbfc4[33]]]),
        view: new ol[_0xbfc4[38]]({
            ha: ol[_0xbfc4[37]][_0xbfc4[36]]([12, 50]),
            zoom: 5
        })
    }),
    I = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[39],
            width: 3
        })
    }),
    J = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[43],
            width: 3
        })
    }),
    K = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[44],
            width: 3
        })
    }),
    L = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[45],
            width: 3
        })
    }),
    M = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[46],
            width: 3
        })
    });

function N(_0x6239x13) {
    r = _0x6239x13;
    q = [];
    for (_0x6239x13 = 0; _0x6239x13 < r[_0xbfc4[4]]; _0x6239x13++) {
        var _0x6239x14 = r[_0x6239x13],
            _0x6239x15 = r[_0x6239x13] + _0xbfc4[47];
        window[_0x6239x15] = new ol[_0xbfc4[25]].I({
            url: window[r[_0x6239x13][_0xbfc4[48]]() + _0xbfc4[47]],
            format: new ol[_0xbfc4[50]][_0xbfc4[49]]
        });
        O(_0x6239x15);
        window[_0x6239x14] = new ol[_0xbfc4[27]].I({
            source: window[_0x6239x15],
            style: I
        });
        window[_0x6239x14].Ia({
            title: _0x6239x14
        });
        G[_0xbfc4[51]](window[_0x6239x14])
    }
}

function O(_0x6239x13) {
    window[_0x6239x13][_0xbfc4[62]](_0xbfc4[52], function() {
        if (_0xbfc4[53] === window[_0x6239x13][_0xbfc4[54]]()) {
            var _0x6239x14 = window[_0x6239x13][_0xbfc4[55]]();
            q[_0xbfc4[56]](_0x6239x14);
            if (q[_0xbfc4[4]] == r[_0xbfc4[4]]) {
                var _0x6239x15, _0x6239x16, _0x6239x22;
                _0x6239x15 = [];
                _0x6239x16 = [];
                _0x6239x22 = [];
                for (var _0x6239x14 = [], _0x6239x23 = 0; _0x6239x23 < q[_0xbfc4[4]]; _0x6239x23++) {
                    _0x6239x15[_0xbfc4[56]](q[_0x6239x23][0]), _0x6239x16[_0xbfc4[56]](q[_0x6239x23][1]), _0x6239x22[_0xbfc4[56]](q[_0x6239x23][2]), _0x6239x14[_0xbfc4[56]](q[_0x6239x23][3])
                };
                _0x6239x15 = Math[_0xbfc4[58]][_0xbfc4[57]](null, _0x6239x15);
                _0x6239x16 = Math[_0xbfc4[58]][_0xbfc4[57]](null, _0x6239x16);
                _0x6239x22 = Math[_0xbfc4[59]][_0xbfc4[57]](null, _0x6239x22);
                _0x6239x14 = Math[_0xbfc4[59]][_0xbfc4[57]](null, _0x6239x14);
                _0x6239x14 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                    [_0x6239x15, _0x6239x16],
                    [_0x6239x22, _0x6239x14]
                ]);
                G.R().L(_0x6239x14, G.O())
            }
        }
    })
}

function P() {
    var _0x6239x13 = A[_0xbfc4[64]][e][_0xbfc4[63]],
        _0x6239x14 = D(A[_0xbfc4[64]][e][_0xbfc4[65]]),
        _0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[66]];
    if (_0xbfc4[67] == _0x6239x13) {
        _0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[68]], N(_0x6239x15)
    } else {
        if (1 != _0x6239x15[_0xbfc4[4]] || _0xbfc4[69] != _0x6239x15[0] && _0xbfc4[70] != _0x6239x15[0] && _0xbfc4[71] != _0x6239x15[0]) {
            N(_0x6239x15)
        } else {
            var _0x6239x16;
            switch (_0x6239x15[0]) {
                case _0xbfc4[69]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-1588153, 3158093],
                        [4123370, 6225122]
                    ]);
                    break;
                case _0xbfc4[70]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-3045174, 3995880],
                        [4298212, 11426687]
                    ]);
                    break;
                case _0xbfc4[71]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-19640644, -8767624],
                        [19232678, 11397547]
                    ])
            };
            G.R().L(_0x6239x16, G.O())
        }
    };
    _0xbfc4[72] == _0x6239x13 ? _0x6239x13 = _0xbfc4[73] : _0xbfc4[74] == _0x6239x13 ? (_0x6239x13 = _0xbfc4[75], 0 <= _0x6239x14[_0xbfc4[77]](_0xbfc4[76]) && (_0x6239x13 = _0xbfc4[78])) : _0xbfc4[67] == _0x6239x13 ? _0x6239x13 = _0xbfc4[79] + A[_0xbfc4[64]][e][_0xbfc4[80]][0] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][1] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][2] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][3] + _0xbfc4[82] : (_0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[68]], _0x6239x13 = _0xbfc4[83] + E(_0x6239x15[0]) + _0xbfc4[84] + E(_0x6239x15[1]) + _0xbfc4[85] + E(_0x6239x15[2]) + _0xbfc4[86] + E(_0x6239x15[3]) + _0xbfc4[87]);
    return _0x6239x13
}

function Q() {
    _0xbfc4[67] == A[_0xbfc4[64]][e][_0xbfc4[63]] ? 1 == w && (u = G[_0xbfc4[94]](_0xbfc4[88], function(_0x6239x13) {
        if (_0x6239x13 = G.M(_0x6239x13.Ca, function(_0x6239x13, _0x6239x15) {
                p = _0x6239x15[_0xbfc4[90]]()[_0xbfc4[89]];
                return _0x6239x13
            })) {
            if (window[p].P() == I) {
                window[p][_0xbfc4[91]](J);
                for (var _0x6239x14 = r[_0xbfc4[77]](p), _0x6239x15 = 0; _0x6239x15 < r[_0xbfc4[4]]; _0x6239x15++) {
                    _0x6239x15 != _0x6239x14 && window[r[_0x6239x15]][_0xbfc4[91]](I)
                }
            } else {
                window[p].P() == J && window[p][_0xbfc4[91]](I)
            };
            t = _0x6239x13[_0xbfc4[93]](_0xbfc4[92])
        }
    }), v = G[_0xbfc4[94]](_0xbfc4[95], function(_0x6239x13) {
        _0x6239x13 = G[_0xbfc4[96]](_0x6239x13.Ba);
        G.M(_0x6239x13, function(_0x6239x13) {
            return _0x6239x13
        });
        _0x6239x13 = G[_0xbfc4[97]](_0x6239x13);
        G.C()[_0xbfc4[41]][_0xbfc4[98]] = _0x6239x13 ? _0xbfc4[99] : 'radio'
    }), w = !1) : (G[_0xbfc4[100]](u), G[_0xbfc4[100]](v), G.C()[_0xbfc4[41]][_0xbfc4[98]] = 'radio', w = !0);
    return A[_0xbfc4[64]][e][_0xbfc4[101]] + _0xbfc4[102] + P() + _0xbfc4[103]
}

function R() {
    if (!y) {
        if (y = !0, g = 30, $(_0xbfc4[105])[_0xbfc4[104]](g), e++, 6 > e) {
            l = !1, question = Q(), $(_0xbfc4[106]).D(question), window[_0xbfc4[107]](f), f = setInterval(function() {
                g--;
                $(_0xbfc4[105])[_0xbfc4[104]](g);
                1 > g && (window[_0xbfc4[107]](f), k = 0, S())
            }, 1E3)
        } else {
            var _0x6239x13 = C();
            $[_0xbfc4[113]]({
                ga: function(_0x6239x15, _0x6239x14) {
                    /^(GET|HEAD|OPTIONS|TRACE)$/ [_0xbfc4[109]](_0x6239x14[_0xbfc4[108]]) || this[_0xbfc4[110]] || _0x6239x15[_0xbfc4[112]](_0xbfc4[111], _0x6239x13)
                }
            });
            var _0x6239x14 = JSON[_0xbfc4[114]](B);
            $.J({
                type: _0xbfc4[115],
                url: _0xbfc4[116],
                data: _0x6239x14,
                T: function(_0x6239x13) {
                    _0x6239x13 = _0x6239x13[_0xbfc4[117]];
                    $(_0xbfc4[121])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
                    $(_0xbfc4[121]).Ga(_0xbfc4[122]);
                    $(_0xbfc4[125]).D(_0xbfc4[123] + Math[_0xbfc4[124]](100 * _0x6239x13) / 100);
                    2 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_zero_one_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[129])) : 4 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_two_three_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[131])) : 6 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_four_five_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[132])) : ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_six_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[133]));
                    $(_0xbfc4[135])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134]);
                    A = {};
                    B = {}
                }
            })
        }
    }
}

function S() {
    var _0x6239x13, _0x6239x14, _0x6239x15 = {};
    _0x6239x13 = A[_0xbfc4[64]][e][_0xbfc4[63]];
    _0x6239x15[_0xbfc4[136]] = A[_0xbfc4[64]][e][_0xbfc4[137]];
    var _0x6239x16 = $(_0xbfc4[138] + thumb_up_source + _0xbfc4[139]),
        _0x6239x22 = $(_0xbfc4[140] + thumb_down_source + _0xbfc4[139]);
    if (_0xbfc4[72] == _0x6239x13 || _0xbfc4[141] == _0x6239x13) {
        _0x6239x13 = E(D(A[_0xbfc4[64]][e][_0xbfc4[65]])), _0x6239x14 = $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[104]](), _0x6239x14 == _0x6239x13 ? ($(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[147]](_0x6239x16), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[148], _0xbfc4[149])) : 'radio' == _0x6239x14 ? ($(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[46]), $(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146])) : ($(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[44]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[147]](_0x6239x22), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[148], _0xbfc4[149]))
    } else {
        if (_0xbfc4[67] == _0x6239x13) {
            _0x6239x13 = D(A[_0xbfc4[64]][e][_0xbfc4[152]]), _0x6239x14 = t, _0x6239x13 == t ? ($(_0xbfc4[153])[_0xbfc4[147]](_0x6239x16), window[t][_0xbfc4[91]](L), G[_0xbfc4[154]](window[t]), G[_0xbfc4[51]](window[t])) : ('radio' == t ? window[_0x6239x13][_0xbfc4[91]](M) : ($(_0xbfc4[153])[_0xbfc4[147]](_0x6239x22), window[t][_0xbfc4[91]](K), G[_0xbfc4[154]](window[t]), G[_0xbfc4[51]](window[t]), window[_0x6239x13][_0xbfc4[91]](L)), G[_0xbfc4[154]](window[_0x6239x13]), G[_0xbfc4[51]](window[_0x6239x13])), G[_0xbfc4[100]](u), G[_0xbfc4[100]](v), G.C()[_0xbfc4[41]][_0xbfc4[98]] = 'radio', w = !0
        } else {
            _0x6239x13 = D(A[_0xbfc4[64]][e][_0xbfc4[65]]);
            _0x6239x14 = $(_0xbfc4[155]).G();
            var _0x6239x23, _0x6239x28, _0x6239x29 = !1;
            0 == isNaN(_0x6239x14) && (_0x6239x29 = !0);
            0 <= _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) ? (_0x6239x23 = 9 * _0x6239x13[_0xbfc4[23]](0, -1) / 10, _0x6239x28 = 11 * _0x6239x13[_0xbfc4[23]](0, -1) / 10, 100 < _0x6239x28 && (_0x6239x28 = 100)) : 0 > _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) && (_0x6239x23 = 8 * _0x6239x13 / 10, _0x6239x28 = 12 * _0x6239x13 / 10);
            0 == _0x6239x29 && 'radio' != _0x6239x14 && alert(_0xbfc4[156]);
            _0x6239x29 && _0x6239x14 >= _0x6239x23 && _0x6239x14 <= _0x6239x28 ? ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[157])[_0xbfc4[147]](_0x6239x16)) : 'radio' == _0x6239x14 ? ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[46]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), 0 <= _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) ? $(_0xbfc4[155]).G(_0x6239x13[_0xbfc4[23]](0, -1)) : $(_0xbfc4[155]).G(_0x6239x13)) : ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[44]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[157])[_0xbfc4[147]](_0x6239x22))
        }
    };
    _0x6239x15[_0xbfc4[65]] = _0x6239x14;
    _0x6239x15[_0xbfc4[158]] = k;
    B[_0xbfc4[64]][_0xbfc4[56]](_0x6239x15);
    0 == l && ($(_0xbfc4[160])[_0xbfc4[159]](), l = !0, $(_0xbfc4[106])[_0xbfc4[147]](_0xbfc4[161]), $(_0xbfc4[106])[_0xbfc4[147]](_0xbfc4[162] + A[_0xbfc4[64]][e][_0xbfc4[163]] + _0xbfc4[164] + A[_0xbfc4[64]][e][_0xbfc4[165]] + _0xbfc4[166] + A[_0xbfc4[64]][e][_0xbfc4[167]]))
}
$(_0xbfc4[178])[_0xbfc4[88]](function() {
    $[_0xbfc4[177]](_0xbfc4[171], function(_0x6239x13) {
        $(_0xbfc4[169])[_0xbfc4[104]]('radio');
        $(_0xbfc4[172])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
        $(_0xbfc4[121])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134]);
        $(_0xbfc4[121])[_0xbfc4[174]](_0xbfc4[173]);
        A[_0xbfc4[64]] = _0x6239x13[_0xbfc4[64]];
        z = _0x6239x13[_0xbfc4[175]];
        B[_0xbfc4[176]] = A[_0xbfc4[64]][0][_0xbfc4[176]];
        B[_0xbfc4[64]] = [];
        y = !1;
        R()
    })[_0xbfc4[170]](function() {
        $(_0xbfc4[169])[_0xbfc4[104]](_0xbfc4[168])
    })
});
$(_0xbfc4[179])[_0xbfc4[88]](function() {
    $(_0xbfc4[135])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
    e = -1;
    $(_0xbfc4[172])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134])
});
$(_0xbfc4[121])[_0xbfc4[94]](_0xbfc4[88], _0xbfc4[160], function() {
    window[_0xbfc4[107]](f);
    k = g;
    S()
});
$(_0xbfc4[121])[_0xbfc4[94]](_0xbfc4[88], _0xbfc4[180], function() {
    t = 'radio';
    for (var _0x6239x13 = 0; _0x6239x13 < r[_0xbfc4[4]]; _0x6239x13++) {
        G[_0xbfc4[154]](window[r[_0x6239x13]])
    };
    y = !1;
    R()
});
var T;
$[_0xbfc4[93]](_0xbfc4[181], function(_0x6239x13) {
    ParsedElements = $(_0x6239x13);
    T = ParsedElements[_0xbfc4[184]](_0xbfc4[183])[0][_0xbfc4[182]]
});
var U = 0;
if (!T || _0xbfc4[185] == T || _0xbfc4[186] == T || _0xbfc4[187] == T) {
    var V = {
        q: [],
        A: []
    };
    $(_0xbfc4[202])[_0xbfc4[94]](_0xbfc4[88], function(_0x6239x13) {
        btn = _0x6239x13[_0xbfc4[188]][_0xbfc4[137]];
        _0xbfc4[189] == btn ? (U++, d = new Date, V[_0xbfc4[190]][_0xbfc4[56]](d), V[_0xbfc4[190]][_0xbfc4[56]]($(_0xbfc4[105]).D()), 6 == U && (d = new Date, V[_0xbfc4[191]] = d, V[_0xbfc4[192]] = T, $.J({
            type: _0xbfc4[115],
            url: _0xbfc4[193],
            data: JSON[_0xbfc4[114]](V),
            T: function(_0x6239x13) {
                console[_0xbfc4[194]](_0x6239x13)
            },
            contentType: _0xbfc4[195],
            dataType: _0xbfc4[196]
        }))) : _0xbfc4[197] == btn ? (d = new Date, V[_0xbfc4[198]][_0xbfc4[56]](d)) : _0xbfc4[199] == btn ? (d = new Date, V[_0xbfc4[200]] = d) : _0xbfc4[201] == btn && (V = {
            q: [],
            A: []
        }, U = 0)
    })
}, 'extend', 'oa', 'qa', 'Da', 'ca', '#6ab6d4', 'f', 'style', 'g', '#025dab', 'rgba(224, 0, 0, 1)', 'rgba(0, 205, 0, 1)', 'rgba(255, 102, 0, 1)', '_source', 'toLowerCase', 'Y', 'format', 'i', 'change', 'ready', 'va', 'sa', 'push', 'apply', 'min', 'max', 'o', 's', 'once', 'w', 'a', 'l', 'ka', 'MB', 'K', 'Mediterranean', 'Europe', 'World', 'TF', '<form id=\'tfForm\'><label><input type=\'radio\' name=\'tf\' id=\'true\'><span id=\'labelText\'>TRUE</span></label><br><label><input type=\'radio\' name=\'tf\' id=\'false\'><span id=\'labelText\'>FALSE</span></label></form>', 'TB', '<span id=\'spanTextInput\'><input id=\'textInput\' placeholder=\'type here...\' type=\'text\'></span>', '%', 'indexOf', '<span id=\'spanTextInput\'><input id=\'textInput\' placeholder=\'type here...\' type=\'text\'>%</span>', '<form id=\'mbForm\'>Select one of the countries <i>', 'j', '</i>, <i>', '</i> <b>on the map</b>, then press the <i>Submit</i> button.<span id=\'thumb\'></span></form>', '<form id=\'mcForm\'><label><input type=\'radio\' name=\'mc\' id=\'one\'><span id=\'labelText\'>', '</span></label><br><label><input type=\'radio\' name=\'mc\' id=\'two\'><span id=\'labelText\'>', '</span></label><br><label><input type=\'radio\' name=\'mc\' id=\'three\'><span id=\'labelText\'>', '</span></label><br><label><input type=\'radio\' name=\'mc\' id=\'four\'><span id=\'labelText\'>', '</span></label></form>', 'click', 'title', 'ua', 'c', 'ISO3166_1_', 'get', 'h', 'pointermove', 'ra', 'wa', 'cursor', 'pointer', 'v', 'Ea', '<br>', '<button id=\'submitButton\' type=\'button\'>Submit</button>', 'text', '#timer', '#questionnaire p', 'clearInterval', 'type', 'test', 'la', 'X-CSRFToken', 'setRequestHeader', 'ea', 'stringify', 'POST', '/migrate/finish/', 'Ha', 'visibility', 'hidden', 'b', '#questionnaire', 'bigEntrance', 'Game is finished!<br>Your score is: ', 'round', '#end #pFirst', 'src', 'm', '.box#end img', 'Come on, you can do better than this!', '#end #pSecond', 'Not so bad, keep on playing!', 'You\u2019re almost there!', 'Your knowledge is impressive, congratulations!', 'visible', '#end', 'Fa', 'id', '<img id=\'thumb_up\' src=\'', '\'>', '<img id=\'thumb_down\' src=\'', 'MC', 'parent', 'input[type="radio"]:checked', 'color', 'font-weight', 'bold', 'append', 'width', 'calc(100% - 32px)', 'span:contains(\'', '\')', 'fa', '#thumb', 'u', '#textInput', 'The answer is an integer!', '#spanTextInput', 'Ja', 'remove', '#submitButton', '<button id=\'nextButton\' type=\'button\'>Next</button>', '<b>Data source:</b> <a href= \'', 'na', '\' target=\'_blank\'>', 'ma', '</a><br>', 'xa', 'No internet connection!', '#noConnection', 'pa', '/migrate/game/restart/', '#start', 'box bigEntrance', 'da', 'za', 'N', 'ta', '#startButton', '#closeButton', '#nextButton', 'http://geomobile.como.polimi.it/migrate/profile/', 'innerHTML', 'h2', 'find', '7dado88', 'ValeP', 'Gabriele', 'target', 'submitButton', 'q', 'end', 'name', 'http://192.168.243.66:8081/ranking', 'log', 'application/json', 'json', 'nextButton', 'A', 'startButton', 'start', 'closeButton', 'body'];
var e = -1,
    f, g, k, l, p = 'radio',
    q = [],
    r = [],
    t = 'radio',
    u, v, w = !0,
    y = !1,
    z, A = {},
    B = {};

function C() {
    var _0x6239x13 = null;
    if (document[_0xbfc4[1]] && 'radio' !== document[_0xbfc4[1]]) {
        for (var _0x6239x14 = document[_0xbfc4[1]][_0xbfc4[3]](_0xbfc4[2]), _0x6239x15 = 0; _0x6239x15 < _0x6239x14[_0xbfc4[4]]; _0x6239x15++) {
            var _0x6239x16 = jQuery[_0xbfc4[5]](_0x6239x14[_0x6239x15]);
            if (_0xbfc4[6] === _0x6239x16[_0xbfc4[7]](0, 10)) {
                _0x6239x13 = decodeURIComponent(_0x6239x16[_0xbfc4[7]](10));
                break
            }
        }
    };
    return _0x6239x13
}

function D(_0x6239x13) {
    _0x6239x13 = CryptoJS[_0xbfc4[10]][_0xbfc4[9]][_0xbfc4[8]](_0x6239x13);
    var _0x6239x14 = _0x6239x13[_0xbfc4[11]]();
    _0x6239x14[_0xbfc4[12]] = 16;
    _0x6239x14[_0xbfc4[13]]();
    _0x6239x13[_0xbfc4[15]][_0xbfc4[14]](0, 4);
    _0x6239x13[_0xbfc4[12]] -= 16;
    var _0x6239x15 = CryptoJS[_0xbfc4[10]][_0xbfc4[16]][_0xbfc4[8]](z);
    return CryptoJS[_0xbfc4[20]][_0xbfc4[19]]({
        ia: _0x6239x13
    }, _0x6239x15, {
        ya: _0x6239x14,
        mode: CryptoJS[_0xbfc4[18]][_0xbfc4[17]]
    }).toString(CryptoJS[_0xbfc4[10]].H)
}

function E(_0x6239x13) {
    return _0x6239x13[_0xbfc4[22]](0)[_0xbfc4[21]]() + _0x6239x13[_0xbfc4[23]](1)
}
var F = new ol[_0xbfc4[27]][_0xbfc4[26]]({
        source: new ol[_0xbfc4[25]].Z({
            url: _0xbfc4[24]
        })
    }),
    G = new ol.Map({
        Aa: [F],
        target: document[_0xbfc4[29]](_0xbfc4[28]),
        controls: ol[_0xbfc4[31]][_0xbfc4[35]]()[_0xbfc4[34]]([new ol[_0xbfc4[31]][_0xbfc4[30]], new ol[_0xbfc4[31]][_0xbfc4[32]], new ol[_0xbfc4[31]][_0xbfc4[33]]]),
        view: new ol[_0xbfc4[38]]({
            ha: ol[_0xbfc4[37]][_0xbfc4[36]]([12, 50]),
            zoom: 5
        })
    }),
    I = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[39],
            width: 3
        })
    }),
    J = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[43],
            width: 3
        })
    }),
    K = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[44],
            width: 3
        })
    }),
    L = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[45],
            width: 3
        })
    }),
    M = new ol[_0xbfc4[41]][_0xbfc4[42]]({
        stroke: new ol[_0xbfc4[41]][_0xbfc4[40]]({
            color: _0xbfc4[46],
            width: 3
        })
    });

function N(_0x6239x13) {
    r = _0x6239x13;
    q = [];
    for (_0x6239x13 = 0; _0x6239x13 < r[_0xbfc4[4]]; _0x6239x13++) {
        var _0x6239x14 = r[_0x6239x13],
            _0x6239x15 = r[_0x6239x13] + _0xbfc4[47];
        window[_0x6239x15] = new ol[_0xbfc4[25]].I({
            url: window[r[_0x6239x13][_0xbfc4[48]]() + _0xbfc4[47]],
            format: new ol[_0xbfc4[50]][_0xbfc4[49]]
        });
        O(_0x6239x15);
        window[_0x6239x14] = new ol[_0xbfc4[27]].I({
            source: window[_0x6239x15],
            style: I
        });
        window[_0x6239x14].Ia({
            title: _0x6239x14
        });
        G[_0xbfc4[51]](window[_0x6239x14])
    }
}

function O(_0x6239x13) {
    window[_0x6239x13][_0xbfc4[62]](_0xbfc4[52], function() {
        if (_0xbfc4[53] === window[_0x6239x13][_0xbfc4[54]]()) {
            var _0x6239x14 = window[_0x6239x13][_0xbfc4[55]]();
            q[_0xbfc4[56]](_0x6239x14);
            if (q[_0xbfc4[4]] == r[_0xbfc4[4]]) {
                var _0x6239x15, _0x6239x16, _0x6239x22;
                _0x6239x15 = [];
                _0x6239x16 = [];
                _0x6239x22 = [];
                for (var _0x6239x14 = [], _0x6239x23 = 0; _0x6239x23 < q[_0xbfc4[4]]; _0x6239x23++) {
                    _0x6239x15[_0xbfc4[56]](q[_0x6239x23][0]), _0x6239x16[_0xbfc4[56]](q[_0x6239x23][1]), _0x6239x22[_0xbfc4[56]](q[_0x6239x23][2]), _0x6239x14[_0xbfc4[56]](q[_0x6239x23][3])
                };
                _0x6239x15 = Math[_0xbfc4[58]][_0xbfc4[57]](null, _0x6239x15);
                _0x6239x16 = Math[_0xbfc4[58]][_0xbfc4[57]](null, _0x6239x16);
                _0x6239x22 = Math[_0xbfc4[59]][_0xbfc4[57]](null, _0x6239x22);
                _0x6239x14 = Math[_0xbfc4[59]][_0xbfc4[57]](null, _0x6239x14);
                _0x6239x14 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                    [_0x6239x15, _0x6239x16],
                    [_0x6239x22, _0x6239x14]
                ]);
                G.R().L(_0x6239x14, G.O())
            }
        }
    })
}

function P() {
    var _0x6239x13 = A[_0xbfc4[64]][e][_0xbfc4[63]],
        _0x6239x14 = D(A[_0xbfc4[64]][e][_0xbfc4[65]]),
        _0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[66]];
    if (_0xbfc4[67] == _0x6239x13) {
        _0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[68]], N(_0x6239x15)
    } else {
        if (1 != _0x6239x15[_0xbfc4[4]] || _0xbfc4[69] != _0x6239x15[0] && _0xbfc4[70] != _0x6239x15[0] && _0xbfc4[71] != _0x6239x15[0]) {
            N(_0x6239x15)
        } else {
            var _0x6239x16;
            switch (_0x6239x15[0]) {
                case _0xbfc4[69]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-1588153, 3158093],
                        [4123370, 6225122]
                    ]);
                    break;
                case _0xbfc4[70]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-3045174, 3995880],
                        [4298212, 11426687]
                    ]);
                    break;
                case _0xbfc4[71]:
                    _0x6239x16 = ol[_0xbfc4[61]][_0xbfc4[60]]([
                        [-19640644, -8767624],
                        [19232678, 11397547]
                    ])
            };
            G.R().L(_0x6239x16, G.O())
        }
    };
    _0xbfc4[72] == _0x6239x13 ? _0x6239x13 = _0xbfc4[73] : _0xbfc4[74] == _0x6239x13 ? (_0x6239x13 = _0xbfc4[75], 0 <= _0x6239x14[_0xbfc4[77]](_0xbfc4[76]) && (_0x6239x13 = _0xbfc4[78])) : _0xbfc4[67] == _0x6239x13 ? _0x6239x13 = _0xbfc4[79] + A[_0xbfc4[64]][e][_0xbfc4[80]][0] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][1] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][2] + _0xbfc4[81] + A[_0xbfc4[64]][e][_0xbfc4[80]][3] + _0xbfc4[82] : (_0x6239x15 = A[_0xbfc4[64]][e][_0xbfc4[68]], _0x6239x13 = _0xbfc4[83] + E(_0x6239x15[0]) + _0xbfc4[84] + E(_0x6239x15[1]) + _0xbfc4[85] + E(_0x6239x15[2]) + _0xbfc4[86] + E(_0x6239x15[3]) + _0xbfc4[87]);
    return _0x6239x13
}

function Q() {
    _0xbfc4[67] == A[_0xbfc4[64]][e][_0xbfc4[63]] ? 1 == w && (u = G[_0xbfc4[94]](_0xbfc4[88], function(_0x6239x13) {
        if (_0x6239x13 = G.M(_0x6239x13.Ca, function(_0x6239x13, _0x6239x15) {
                p = _0x6239x15[_0xbfc4[90]]()[_0xbfc4[89]];
                return _0x6239x13
            })) {
            if (window[p].P() == I) {
                window[p][_0xbfc4[91]](J);
                for (var _0x6239x14 = r[_0xbfc4[77]](p), _0x6239x15 = 0; _0x6239x15 < r[_0xbfc4[4]]; _0x6239x15++) {
                    _0x6239x15 != _0x6239x14 && window[r[_0x6239x15]][_0xbfc4[91]](I)
                }
            } else {
                window[p].P() == J && window[p][_0xbfc4[91]](I)
            };
            t = _0x6239x13[_0xbfc4[93]](_0xbfc4[92])
        }
    }), v = G[_0xbfc4[94]](_0xbfc4[95], function(_0x6239x13) {
        _0x6239x13 = G[_0xbfc4[96]](_0x6239x13.Ba);
        G.M(_0x6239x13, function(_0x6239x13) {
            return _0x6239x13
        });
        _0x6239x13 = G[_0xbfc4[97]](_0x6239x13);
        G.C()[_0xbfc4[41]][_0xbfc4[98]] = _0x6239x13 ? _0xbfc4[99] : 'radio'
    }), w = !1) : (G[_0xbfc4[100]](u), G[_0xbfc4[100]](v), G.C()[_0xbfc4[41]][_0xbfc4[98]] = 'radio', w = !0);
    return A[_0xbfc4[64]][e][_0xbfc4[101]] + _0xbfc4[102] + P() + _0xbfc4[103]
}

function R() {
    if (!y) {
        if (y = !0, g = 30, $(_0xbfc4[105])[_0xbfc4[104]](g), e++, 6 > e) {
            l = !1, question = Q(), $(_0xbfc4[106]).D(question), window[_0xbfc4[107]](f), f = setInterval(function() {
                g--;
                $(_0xbfc4[105])[_0xbfc4[104]](g);
                1 > g && (window[_0xbfc4[107]](f), k = 0, S())
            }, 1E3)
        } else {
            var _0x6239x13 = C();
            $[_0xbfc4[113]]({
                ga: function(_0x6239x15, _0x6239x14) {
                    /^(GET|HEAD|OPTIONS|TRACE)$/ [_0xbfc4[109]](_0x6239x14[_0xbfc4[108]]) || this[_0xbfc4[110]] || _0x6239x15[_0xbfc4[112]](_0xbfc4[111], _0x6239x13)
                }
            });
            var _0x6239x14 = JSON[_0xbfc4[114]](B);
            $.J({
                type: _0xbfc4[115],
                url: _0xbfc4[116],
                data: _0x6239x14,
                T: function(_0x6239x13) {
                    _0x6239x13 = _0x6239x13[_0xbfc4[117]];
                    $(_0xbfc4[121])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
                    $(_0xbfc4[121]).Ga(_0xbfc4[122]);
                    $(_0xbfc4[125]).D(_0xbfc4[123] + Math[_0xbfc4[124]](100 * _0x6239x13) / 100);
                    2 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_zero_one_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[129])) : 4 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_two_three_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[131])) : 6 > _0x6239x13 ? ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_four_five_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[132])) : ($(_0xbfc4[128])[_0xbfc4[127]](_0xbfc4[126], badge_six_source), $(_0xbfc4[130])[_0xbfc4[104]](_0xbfc4[133]));
                    $(_0xbfc4[135])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134]);
                    A = {};
                    B = {}
                }
            })
        }
    }
}

function S() {
    var _0x6239x13, _0x6239x14, _0x6239x15 = {};
    _0x6239x13 = A[_0xbfc4[64]][e][_0xbfc4[63]];
    _0x6239x15[_0xbfc4[136]] = A[_0xbfc4[64]][e][_0xbfc4[137]];
    var _0x6239x16 = $(_0xbfc4[138] + thumb_up_source + _0xbfc4[139]),
        _0x6239x22 = $(_0xbfc4[140] + thumb_down_source + _0xbfc4[139]);
    if (_0xbfc4[72] == _0x6239x13 || _0xbfc4[141] == _0x6239x13) {
        _0x6239x13 = E(D(A[_0xbfc4[64]][e][_0xbfc4[65]])), _0x6239x14 = $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[104]](), _0x6239x14 == _0x6239x13 ? ($(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[147]](_0x6239x16), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[148], _0xbfc4[149])) : 'radio' == _0x6239x14 ? ($(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[46]), $(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146])) : ($(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[150] + _0x6239x13 + _0xbfc4[151])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[44]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[147]](_0x6239x22), $(_0xbfc4[143])[_0xbfc4[142]]()[_0xbfc4[120]](_0xbfc4[148], _0xbfc4[149]))
    } else {
        if (_0xbfc4[67] == _0x6239x13) {
            _0x6239x13 = D(A[_0xbfc4[64]][e][_0xbfc4[152]]), _0x6239x14 = t, _0x6239x13 == t ? ($(_0xbfc4[153])[_0xbfc4[147]](_0x6239x16), window[t][_0xbfc4[91]](L), G[_0xbfc4[154]](window[t]), G[_0xbfc4[51]](window[t])) : ('radio' == t ? window[_0x6239x13][_0xbfc4[91]](M) : ($(_0xbfc4[153])[_0xbfc4[147]](_0x6239x22), window[t][_0xbfc4[91]](K), G[_0xbfc4[154]](window[t]), G[_0xbfc4[51]](window[t]), window[_0x6239x13][_0xbfc4[91]](L)), G[_0xbfc4[154]](window[_0x6239x13]), G[_0xbfc4[51]](window[_0x6239x13])), G[_0xbfc4[100]](u), G[_0xbfc4[100]](v), G.C()[_0xbfc4[41]][_0xbfc4[98]] = 'radio', w = !0
        } else {
            _0x6239x13 = D(A[_0xbfc4[64]][e][_0xbfc4[65]]);
            _0x6239x14 = $(_0xbfc4[155]).G();
            var _0x6239x23, _0x6239x28, _0x6239x29 = !1;
            0 == isNaN(_0x6239x14) && (_0x6239x29 = !0);
            0 <= _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) ? (_0x6239x23 = 9 * _0x6239x13[_0xbfc4[23]](0, -1) / 10, _0x6239x28 = 11 * _0x6239x13[_0xbfc4[23]](0, -1) / 10, 100 < _0x6239x28 && (_0x6239x28 = 100)) : 0 > _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) && (_0x6239x23 = 8 * _0x6239x13 / 10, _0x6239x28 = 12 * _0x6239x13 / 10);
            0 == _0x6239x29 && 'radio' != _0x6239x14 && alert(_0xbfc4[156]);
            _0x6239x29 && _0x6239x14 >= _0x6239x23 && _0x6239x14 <= _0x6239x28 ? ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[45]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[157])[_0xbfc4[147]](_0x6239x16)) : 'radio' == _0x6239x14 ? ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[46]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), 0 <= _0x6239x13[_0xbfc4[77]](_0xbfc4[76]) ? $(_0xbfc4[155]).G(_0x6239x13[_0xbfc4[23]](0, -1)) : $(_0xbfc4[155]).G(_0x6239x13)) : ($(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[144], _0xbfc4[44]), $(_0xbfc4[155])[_0xbfc4[120]](_0xbfc4[145], _0xbfc4[146]), $(_0xbfc4[157])[_0xbfc4[147]](_0x6239x22))
        }
    };
    _0x6239x15[_0xbfc4[65]] = _0x6239x14;
    _0x6239x15[_0xbfc4[158]] = k;
    B[_0xbfc4[64]][_0xbfc4[56]](_0x6239x15);
    0 == l && ($(_0xbfc4[160])[_0xbfc4[159]](), l = !0, $(_0xbfc4[106])[_0xbfc4[147]](_0xbfc4[161]), $(_0xbfc4[106])[_0xbfc4[147]](_0xbfc4[162] + A[_0xbfc4[64]][e][_0xbfc4[163]] + _0xbfc4[164] + A[_0xbfc4[64]][e][_0xbfc4[165]] + _0xbfc4[166] + A[_0xbfc4[64]][e][_0xbfc4[167]]))
}
$(_0xbfc4[178])[_0xbfc4[88]](function() {
    $[_0xbfc4[177]](_0xbfc4[171], function(_0x6239x13) {
        $(_0xbfc4[169])[_0xbfc4[104]]('radio');
        $(_0xbfc4[172])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
        $(_0xbfc4[121])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134]);
        $(_0xbfc4[121])[_0xbfc4[174]](_0xbfc4[173]);
        A[_0xbfc4[64]] = _0x6239x13[_0xbfc4[64]];
        z = _0x6239x13[_0xbfc4[175]];
        B[_0xbfc4[176]] = A[_0xbfc4[64]][0][_0xbfc4[176]];
        B[_0xbfc4[64]] = [];
        y = !1;
        R()
    })[_0xbfc4[170]](function() {
        $(_0xbfc4[169])[_0xbfc4[104]](_0xbfc4[168])
    })
});
$(_0xbfc4[179])[_0xbfc4[88]](function() {
    $(_0xbfc4[135])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[119]);
    e = -1;
    $(_0xbfc4[172])[_0xbfc4[120]](_0xbfc4[118], _0xbfc4[134])
});
$(_0xbfc4[121])[_0xbfc4[94]](_0xbfc4[88], _0xbfc4[160], function() {
    window[_0xbfc4[107]](f);
    k = g;
    S()
});
$(_0xbfc4[121])[_0xbfc4[94]](_0xbfc4[88], _0xbfc4[180], function() {
    t = 'radio';
    for (var _0x6239x13 = 0; _0x6239x13 < r[_0xbfc4[4]]; _0x6239x13++) {
        G[_0xbfc4[154]](window[r[_0x6239x13]])
    };
    y = !1;
    R()
});
var T;
$[_0xbfc4[93]](_0xbfc4[181], function(_0x6239x13) {
    ParsedElements = $(_0x6239x13);
    T = ParsedElements[_0xbfc4[184]](_0xbfc4[183])[0][_0xbfc4[182]]
});
var U = 0;
if (!T || _0xbfc4[185] == T || _0xbfc4[186] == T || _0xbfc4[187] == T) {
    var V = {
        q: [],
        A: []
    };
    $(_0xbfc4[202])[_0xbfc4[94]](_0xbfc4[88], function(_0x6239x13) {
        btn = _0x6239x13[_0xbfc4[188]][_0xbfc4[137]];
        _0xbfc4[189] == btn ? (U++, d = new Date, V[_0xbfc4[190]][_0xbfc4[56]](d), V[_0xbfc4[190]][_0xbfc4[56]]($(_0xbfc4[105]).D()), 6 == U && (d = new Date, V[_0xbfc4[191]] = d, V[_0xbfc4[192]] = T, $.J({
            type: _0xbfc4[115],
            url: _0xbfc4[193],
            data: JSON[_0xbfc4[114]](V),
            T: function(_0x6239x13) {
                console[_0xbfc4[194]](_0x6239x13)
            },
            contentType: _0xbfc4[195],
            dataType: _0xbfc4[196]
        }))) : _0xbfc4[197] == btn ? (d = new Date, V[_0xbfc4[198]][_0xbfc4[56]](d)) : _0xbfc4[199] == btn ? (d = new Date, V[_0xbfc4[200]] = d) : _0xbfc4[201] == btn && (V = {
            q: [],
            A: []
        }, U = 0)
    })
}
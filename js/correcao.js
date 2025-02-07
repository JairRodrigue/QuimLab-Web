const correcaoComponentes = {
    "HO": "OH",
    "NH": "HN",
    "CH": "HC",
    "NO": "ON",
    "CO": "OC",
    "SO": "OS",
    "PO": "OP",
    "SH": "HS",
    "PH": "HP",
    "CN": "NC",
    "SiO": "OSi",
    "AlO": "OAl",
    "BO": "OB",
    "MgO": "OMg",
    "CaO": "OCa",
    "NaO": "ONa",
    "KO": "OK",
    "LiO": "OLi"
};

function corrigirComponentes(composto) {
    return correcaoComponentes[composto] || composto;
}

module.exports = corrigirComponentes;

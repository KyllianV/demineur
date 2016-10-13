const TAILLE = 16;
const NB_BOMBES = 30;

function genererMap() {
    var tableau = [];
    var randoms = [];

    while(randoms.length < NB_BOMBES) {
        var random = (Math.random() * (TAILLE*TAILLE)).toFixed(0);
        if(!randoms.includes(random)) {
            randoms.push(random);
        }
    }

    for(var i = 1; i <= (TAILLE*TAILLE); i++) {
        if(randoms.includes(i.toString())) {
            tableau.push({id: i, bombe: true, chiffre: null});
        } else {
            var chiffre = 0;
            if(randoms.includes( (i + TAILLE).toString() )) {
                chiffre++;
            }
            if(randoms.includes( (i - TAILLE).toString() )) {
                chiffre++;
            }
            if(randoms.includes( (i + 1).toString() ) && (i % TAILLE > 0) ) {
                chiffre++;
            }
            if(randoms.includes( (i - 1).toString() ) && (i % TAILLE != 1) ) {
                chiffre++;
            }
            if(randoms.includes( (i - TAILLE - 1).toString() ) && (i % TAILLE != 1) ) {
                chiffre++;
            }
            if(randoms.includes( (i - TAILLE + 1).toString() ) && (i % TAILLE > 0) ) {
                chiffre++;
            }
            if(randoms.includes( (i + TAILLE - 1).toString() ) && (i % TAILLE != 1) ) {
                chiffre++;
            }
            if(randoms.includes( (i + TAILLE + 1).toString() ) && (i % TAILLE > 0) ) {
                chiffre++;
            }

            tableau.push({id: i, bombe: false, chiffre: chiffre});
        }
    }

    return tableau;
}

var timer = Vue.component('timer', {
    template: "#timer",
    data: function() {
        return {
            time: 0
        };
    },
    created: function() {
        this.changeTime();
    },
    methods: {
        changeTime() {
            var self = this;
            setInterval(function() {
                self.time++;
            }, 1000);
        }
    }
});

var square = Vue.component('square', {
    template: "#square",
    computed: {
        squareClass: function() {
            var squareClass = "square";
            if(this.updated) {
                squareClass += " updated";
            } else if(this.flag) {
                squareClass += " flag"
            }
            if(this.infos.bombe && this.updated) {
                squareClass += " bombe";
            }
            if(this.infos.chiffre == 2) {
                squareClass += " green";
            } else if(this.infos.chiffre == 3) {
                squareClass += " red";
            } else if (this.infos.chiffre >= 4) {
                squareClass += " darkblue";
            }

            return squareClass;
        }
    },
    data: function() {
        return {
            updated: false,
            flag: false
        };
    },
    props: [
        'infos'
    ],
    methods: {
        updateMap: function() {
            if(!this.flag) {
                this.updated = true;
                if(this.infos.bombe) {
                    this.$parent.endGame();
                } else {
                    if(this.infos.chiffre == 0) {
                        this.$parent.revealAround(this.infos.id - 1);
                    }
                    this.$parent.checkWin();
                }
            }
        },
        putFlag: function(event) {
            event.preventDefault();
            if(!this.updated) {
                this.flag = !this.flag;
                if(this.flag) {
                    this.$parent.bombesRestantes--;
                } else {
                    this.$parent.bombesRestantes++;
                }
            }
        }
    }
});

var demineur = Vue.component('demineur', {
    template: "#template",
    data: function() {
        return {
            map: genererMap(),
            taille: TAILLE,
            bombesRestantes: NB_BOMBES,
            win: false,
            lose: false,
            widthMap: "width: calc(24px*"+ TAILLE +");"
        };
    },
    methods: {
        reset: function() {
            this.map = genererMap();
            this.$children.forEach(function(square) {
                square.updated = false;
                square.flag = false;
            });
            this.win = false;
            this.lose = false;
            this.bombesRestantes = NB_BOMBES;
            this.$children[0].time = 0;
        },
        checkWin: function() {
            var win = true;
            this.$children.forEach(function(square) {
                if(square.updated == false && square.infos.bombe == false) {
                    win = false;
                }
            });
            if(win) {
                this.win = true;
            }
        },
        endGame: function() {
            this.$children.forEach(function(square) {
                square.updated = true;
            });
            this.lose = true;
        },
        revealAround: function(position) {
            var squaresAround = {
                'N': this.$children[position - this.taille],
                'S': this.$children[position + this.taille],
                'E': this.$children[position + 1],
                'W': this.$children[position - 1],
                'NE': this.$children[position - this.taille + 1],
                'SE': this.$children[position + this.taille + 1],
                'SW': this.$children[position + this.taille - 1],
                'NW': this.$children[position - this.taille - 1]
            }
            var nouvellesPositions = [];

            if(typeof squaresAround.N !== "undefined" && squaresAround.N.infos.chiffre != null && squaresAround.N.updated == false) {
                squaresAround.N.updated = true;
                if(squaresAround.N.infos.chiffre == 0) {
                    nouvellesPositions.push(position - this.taille);
                }
            }
            if(typeof squaresAround.S !== "undefined" && squaresAround.S.infos.chiffre != null && squaresAround.S.updated == false) {
                squaresAround.S.updated = true;
                if(squaresAround.S.infos.chiffre == 0) {
                    nouvellesPositions.push(position + this.taille);
                }
            }
            if(typeof squaresAround.E !== "undefined" && ((position+1) % this.taille > 0) && squaresAround.E.infos.chiffre != null && squaresAround.E.updated == false) {
                squaresAround.E.updated = true;
                if(squaresAround.E.infos.chiffre == 0) {
                    nouvellesPositions.push(position + 1);
                }
            }
            if(typeof squaresAround.W !== "undefined" && ((position+1) % this.taille != 1) && squaresAround.W.infos.chiffre != null && squaresAround.W.updated == false) {
                squaresAround.W.updated = true;
                if(squaresAround.W.infos.chiffre == 0) {
                    nouvellesPositions.push(position - 1);
                }
            }
            if(typeof squaresAround.NE !== "undefined" && ((position+1) % this.taille > 0) && squaresAround.NE.infos.chiffre != null && squaresAround.NE.updated == false) {
                squaresAround.NE.updated = true;
                if(squaresAround.NE.infos.chiffre == 0) {
                    nouvellesPositions.push(position - this.taille + 1);
                }
            }
            if(typeof squaresAround.SE !== "undefined" && ((position+1) % this.taille > 0) && squaresAround.SE.infos.chiffre != null && squaresAround.SE.updated == false) {
                squaresAround.SE.updated = true;
                if(squaresAround.SE.infos.chiffre == 0) {
                    nouvellesPositions.push(position + this.taille + 1);
                }
            }
            if(typeof squaresAround.SW !== "undefined" && ((position+1) % this.taille != 1) && squaresAround.SW.infos.chiffre != null && squaresAround.SW.updated == false) {
                squaresAround.SW.updated = true;
                if(squaresAround.SW.infos.chiffre == 0) {
                    nouvellesPositions.push(position + this.taille - 1);
                }
            }
            if(typeof squaresAround.NW !== "undefined" && ((position+1) % this.taille != 1) && squaresAround.NW.infos.chiffre != null && squaresAround.NW.updated == false) {
                squaresAround.NW.updated = true;
                if(squaresAround.NW.infos.chiffre == 0) {
                    nouvellesPositions.push(position - this.taille - 1);
                }
            }

            // Récursive
            var self = this;
            nouvellesPositions.forEach(function(position) {
                self.revealAround(position);
            });
        }
    },
    components: {
        'square': square,
        'timer': timer
    }
});

new Vue({
    el: "#demineur"
});
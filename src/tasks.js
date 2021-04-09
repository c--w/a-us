var WORDS = {
    3: ["TOP", "TIP", "PUT", "DOM", "DIM", "SOL", "KIP", "KAP", "KUP", "PAS", "SUP",
    "ZUB", "ZEC", "MIŠ", "BIK", "PUŽ", "JEŽ", "ŠAL", "OKO", "DAN", "NOĆ", "GOL",
    "KIT", "SAT", "KAT", "MED", "LED", "BOG", "CRV", "KRV", "REP", "PAR", "RUB",
    "RED", "BAR", "ROD", "KUT", "MIR", "RUM", "TRK", "TRS", "SUD", "SAD", "TRG",
    "BRK", "VIC", "VRH", "ZOB", "ZOV", "GRB", "VRT", "VUK", "ZID", "DUG", "GAD",
    "GOD", "LAN", "LUK", "SIN", "NIZ", "BOJ", "BAT", "RAT", "MAT", "ŠAH", "ŠOS",
    "ŽIR", "RAŽ", "MAK", "RUŽ", "ćUK", "MOĆ", "MEČ", "TOK", "ROV", "RAK", "MUK",
    "POD", "PAD", "DAH", "HUK", "LUG", "PEH", "PUH", "ROG", "ROJ", "HOD", "IME"],
    4: ["BRAT", "BOCA", "DUŠA", "BOJA", "BROD", "BROJ", "BUKA", "CRTA", "ČUDO", "ČVOR", "TVOR",
    "FIGA", "FILM", "FRKA", "GLAD", "GOLF", "GRAD", "GRLO", "GNOJ", "KONJ", "GUZA", "IGRA", "JELA",
    "JEKA", "KAMP", "KĆER", "KIŠA", "KLUB", "KOZA", "KRAJ", "KVIZ", "KROV", "KRUG", "KRUH", "KUĆA",
    "KUNA", "KRPA", "KRDO", "KLIN", "KOSA", "LICE", "MISA", "MLIN", "MORE", "MRAK", "MRAZ", "MUHA",
    "NEBO", "NOGA", "NULA", "OKUS", "OPIS", "PARK", "PAUK", "PIVO", "PLAN", "PLES", "PLIN", "PLUS",
    "PRSA", "PUSA", "RIBA", "RODA", "ROLA", "RIVA", "ROBA", "RUKA", "PRST", "RUPA", "RUŽA", "ŠANK",
    "SELO", "ŠEST", "SKUP", "SOBA", "SIPA", "SRCE", "STOL", "SUZA", "TUGA", "ZVRK", "ULOG", "UPIS",
    "URED", "UTEG", "UČĆE", "UPIT", "UVOD", "UZOR", "UŽAS", "USTA", "VEZA", "VLAK", "VODA", "VRAG",
    "VRBA", "ZBOR", "ZIMA", "ZONA", "ŽENA", "PANJ", "MOST", "RIŽA", "KOŽA", "ČULO", "ZRAK", "ŽULJ",
    "KOST", ],
    5: ["AVION", "BALON", "BISER", "BLATO", "BORAC", "BRIGA", "BOŽIĆ", "CRKVA", "DEČKO", "DIOBA",
    "DOČEK", "DOKAZ", "EKIPA", "ELITA", "GOLUB", "GRUPA", "HEROJ", "HIMNA", "HOTEL", "GUŽVA", "HRČAK",
    "HLAĆE", "IDEJA", "IGRAČ", "ISKRA", "ISTOK", "IZBOR", "IZNOS", "JELKA", "JEZIK", "JUNAK", "JUTRO",
    "KLJUČ", "KOBRA", "KOLAŽ", "KOMAD", "KONAC", "KUGLA", "LISTA", "LOPTA", "MESAR", "METAK", "MJERA",
    "MISAO", "MODEL"]
}

var g_solving_task;
function solveTask(task) {
    var ani = me.name.toUpperCase().match(/(EEP|IIP|ANI|SUNČICA)/);
    var mama = me.name.toUpperCase().match(/(mama|mum)/);
    g_solving_task = task;
    var types = 7;
    if(ani)
        types = 6;
    var a = Math.floor(Math.random()*(types));
    if(a==0) {
        var range = 20;
        var num = 3;
        if(ani) {
            range = 2;
            num = 3;
        } else if(mama) {
            range = 100;
            num = 4;
        }
        solveMath(0, num, range);
    } else if (a == 1) {
        var range = 6;
        if(ani)
            range = 4;
        solveOrder(0, 2, range);
    } else if (a == 2) {
        var range = 5;
        if(ani)
            range = 3;
        solveColors(0, 3, range);
    } else if (a == 3) {
        var range = 4;
        if(ani)
            range = 3;
        if(mama)
            range = 5;
        solveNumbers(0, 3, range);
    } else if (a == 4) {
        var range = 4;
        if(ani)
            range = 3;
        if(mama)
            range = 5;
        solveSingleTree(0, 3, range);
    } else if (a == 5) {
        var range = 4;
        if(ani)
            range = 3;
        if(mama)
            range = 5;
        solveNotAllDifferent(0, 3, range);
    } else if (a == 6) {
        var range = 3;
        if(mama)
            range = 4;
        solveAnagram(0, 2, range);
    }
}

function taskSolved() {
    var taskDiv = Q("#task");
    g_solving_task.solved = true;
    g_solving_task.sprite.visible = false;
    send("completed");
    hide(taskDiv);
    var thisTaskInfoDiv = Q('#task_'+g_solving_task.index);
    if(thisTaskInfoDiv)
        thisTaskInfoDiv.style.color = "green";
}

function solveNotAllDifferent(i, num, range) {
    if(i == num) {
        taskSolved();
        return;
    }
    var taskDiv = Q("#task");
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' - Red s parom</div>'
    html+='<div style="text-align: center; padding-top: 30px;">'
    range = Number(range);
    i = Number(i);
    var a = Math.floor(Math.random()*range);
    for(var j=0; j<range; j++) {
        var arr = [];
        var randomNumber = Math.floor(Math.random()*50)+1;
        while(arr.length<range) {
            if(!arr.includes(randomNumber))
                arr.push(randomNumber);
            randomNumber = Math.floor(Math.random()*50)+1;
        }
        if(a == j) {
            var rnd1=Math.floor(Math.random()*range);
            var rnd2;
            do {
                rnd2 = Math.floor(Math.random()*range);
            } while (rnd2 == rnd1);
            arr[rnd1] = arr[rnd2];
            html+='<div onclick="ok(); solveNotAllDifferent('+(i+1)+', '+num+', '+(range+1)+')" style="display: inline-block; margin-bottom: 10px">'
        } else {
            html+='<div onclick="nok(); solveNotAllDifferent('+(i)+', '+num+', '+(range)+')" style="display: inline-block">'
        }
        for(var k=0; k<arr.length; k++) {
            html+='<img src="img/'+String(arr[k]).padStart(3, "0")+'-tree.png" width=30 height=30 style="margin-right: 20px; display: inline-block"/>'
        }
        html+='</div><br>'
    }
    html+='</div>'
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}

function solveSingleTree(i, num, range) {
    if(i == num) {
        taskSolved();
        return;
    }
    var taskDiv = Q("#task");
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+'  - Usamljeno drvo</div>'
    range = Number(range);
    i = Number(i);
    var a = Math.floor(Math.random()*range);
    var lastPartHtml='';
    var tree = Math.floor(Math.random()*50)+1;
    for(var j=0; j<range; j++) {
        if(a == j) {
            var x = Math.floor(Math.random()*(window.innerWidth-50))+10;
            var y = Math.floor(Math.random()*(window.innerHeight-160))+50;
            lastPartHtml+='<img src="img/'+String(tree).padStart(3, "0")+'-tree.png" width=30 height=30 onclick="ok(); solveSingleTree('+(i+1)+', '+num+', '+(range+2)+')" style="-webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px"/>'
        } else {
            var randomTree;
            do {
                randomTree = Math.floor(Math.random()*50)+1;
            } while (randomTree == tree);
            for(var k=0; k<2; k++) {
                var x = Math.floor(Math.random()*(window.innerWidth-50))+10;
                var y = Math.floor(Math.random()*(window.innerHeight-160))+50;
                html+='<img src="img/'+String(randomTree).padStart(3, "0")+'-tree.png" width=30 height=30 onclick="nok(); solveSingleTree('+(i)+', '+num+', '+(range)+')" style="-webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px"/>'
            }
        }
    }
    html+=lastPartHtml;
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}

function solveNumbers(i, num, range) {
    if(i == num) {
        taskSolved();
        return;
    }
    var taskDiv = Q("#task");
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' - Broj brojeva</div>'
    range = Number(range);
    i = Number(i);
    var a = Math.floor(Math.random()*range)+1;
    var lastPartHtml='';
    for(var j=1; j<=range; j++) {
        var randomNumber;
        if(a == j) {
            for(var k=1; k<=a; k++) {
                var x = Math.floor(Math.random()*(window.innerWidth-40))+10;
                var y = Math.floor(Math.random()*(window.innerHeight-120))+50;
                lastPartHtml+='<div onclick="ok(); solveNumbers('+(i+1)+', '+num+', '+(range+1)+')" style="-webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+a+'</div>'
            }
        } else {
            do {
                randomNumber = Math.floor(Math.random()*range) + 1;
            } while (randomNumber == j);
            for(var k=1; k<=randomNumber; k++) {
                var x = Math.floor(Math.random()*(window.innerWidth-40))+10;
                var y = Math.floor(Math.random()*(window.innerHeight-120))+50;
                html+='<div onclick="nok(); solveNumbers('+(i)+', '+num+', '+range+')" style="-webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+j+'</div>'
            }
        }
    }
    html+=lastPartHtml;
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);

}

function solveColors(i, num, range) {
    if(i == num) {
        taskSolved();
        return;
    }
    var taskDiv = Q("#task");
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' - Boja=Tekst</div>'
    range = Number(range);
    i = Number(i);
    var colors = [
        {name: "ŽUTA", color: "yellow"},
        {name: "PLAVA", color: "blue"},
        {name: "ZELENA", color: "green"},
        {name: "CRVENA", color: "red"},
        {name: "SIVA", color: "gray"},
        {name: "CRNA", color: "black"},
        {name: "ROZA", color: "pink"},
        {name: "LJUBIČASTA", color: "violet"},
        {name: "SMEĐA", color: "brown"},
        {name: "NARANČASTA", color: "orange"},
    ]
    var a = Math.floor(Math.random()*range);
    for(var j=0; j<range; j++) {
        var x = Math.floor(Math.random()*(window.innerWidth/2))+10;
        var y = Math.floor(Math.random()*(window.innerHeight-120))+50;
        var randomColor1 = Math.floor(Math.random()*colors.length);
        var randomColor2;
        var lastPartHtml;
        if(a == j) { // true
            lastPartHtml='<div onclick="ok(); solveColors('+(i+1)+', '+num+', '+(range+3)+')" style="color: '+colors[a].color+'; -webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+colors[a].name+'</div>'
        } else {
            do {
                randomColor2 = Math.floor(Math.random()*colors.length);
            } while (randomColor2 == randomColor1);
            html+='<div onclick="nok(); solveColors('+(i)+', '+num+', '+range+')" style="color: '+colors[randomColor1].color+'; -webkit-text-stroke-width: 0; font-size: 20px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+colors[randomColor2].name+'</div>'
        }
    }
    html+=lastPartHtml;
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);

}

function solveAnagram(i, num, range) {
    if(i == num) {
        taskSolved();
        return;
    }
    g_last_order_number = 0;
    var taskDiv = Q("#task");
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' - Nađi riječ</div>'
    range = Number(range);
    i = Number(i);
    var a = Math.floor(Math.random()*WORDS[range].length);
    var word = WORDS[range][a];
    var letters = word.split("");
    for(var j=0; j<range; j++) {
        var x = Math.floor(Math.random()*(window.innerWidth-46))+10;
        var y = Math.floor(Math.random()*(window.innerHeight-120))+50;
        html+='<div data-word="'+word+'" data-i="'+i+'" data-val="'+(j+1)+'" data-num="'+num+'" data-range="'+range+'" onclick="checkAnagram()" style="font-size: 36px; position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+letters[j]+'</div>'
    }
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}

function checkAnagram() {
    var next_number = Number(event.target.dataset.val);
    var i = Number(event.target.dataset.i);
    var num = Number(event.target.dataset.num);
    var range = Number(event.target.dataset.range);
    if(next_number - g_last_order_number == 1){
        event.target.innerHTML = '';
        g_last_order_number = next_number;
        if(next_number == range) {
            ok();
            solveAnagram(i + 1, num, range+1)
        }
    } else {
        solveAnagram(i, num, range)
        nok()
    }
}
function solveOrder(i, num, range) {
    g_last_order_number = 0;
    var taskDiv = Q("#task");
    if(i == num) {
        taskSolved();
        return;
    }
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' Klikni po redu</div>'
    range = Number(range);
    i = Number(i);
    for(var j=0; j<range; j++) {
        var x = Math.floor(Math.random()*(window.innerWidth-50))+10;
        var y = Math.floor(Math.random()*(window.innerHeight-160))+40;
        html+='<div data-i="'+i+'" data-val="'+(j+1)+'" data-num="'+num+'" data-range="'+range+'" onclick="checkOrder()" style="position: absolute; z-index: '+(100-j)+'; left: '+x+'px; top: '+y+'px">'+(j+1)+'</div>'
    }
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}

var g_last_order_number = 0;
function checkOrder() {
    var next_number = Number(event.target.dataset.val);
    var i = Number(event.target.dataset.i);
    var num = Number(event.target.dataset.num);
    var range = Number(event.target.dataset.range);
    if(next_number - g_last_order_number == 1){
        event.target.innerHTML = '';
        g_last_order_number = next_number;
        if(next_number == range) {
            solveOrder(i + 1, num, range*2)
            ok();
        }
    } else {
        solveOrder(i, num, range)
        nok();
    }
}

function solveMath(i, num, range) {
    var taskDiv = Q("#task");
    if(i == num) {
        taskSolved();
        return;
    }
    var html = '';
    range = Number(range);
    i = Number(i);
    var a = Math.floor(Math.random()*range);
    var b = Math.floor(Math.random()*range);
    var choices = [];
    var error=Math.pow(10, Math.floor(Math.log10(range))-1)
    if(error<1)
        error = 1;
    choices.push(a+b-error);
    choices.push(a+b+error);
    choices.push(a+b);
    shuffleArray(choices);
    html+= '<div>'+(Number(i)+1)+' / '+num+' - Izračunaj</div>'
    html+= '<div style="text-align: center">'
    html+= '<div style="display: inline-block">'+a+' + '+b+' = ?</div><br>'
    choices.forEach((choice) => {
        if(choice == a+b) {
            html+='<div onclick="ok(); solveMath('+(i+1)+', '+num+', '+(range*2)+')" style="font-size: 30px; margin-top:20px; display: inline-block">'+choice+'</div>';

        } else {
            html+='<div onclick="nok(); solveMath('+(i)+', '+num+', '+(range)+')" style="font-size: 30px; margin-top:20px; display: inline-block">'+choice+'</div>';

        }
        html+='<br>';
    });
    html+= '</div>'
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}
function hideTask() {
    hide(Q("#task"))
}

function ok() {
    showMessage("TOČNO", 1000, "gold");
}
function nok() {
    showMessage("KRIVO!", 1000, "red");
}

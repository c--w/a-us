var g_solving_task;
function solveTask(task) {
    var ani = me.name.toUpperCase().match(/(EEP|IIP|ANI|SUNČICA)/);
    g_solving_task = task;
    var types = 3;
    if(ani)
        types = 2;
    var a = Math.floor(Math.random()*(types));
    if(a==0) {
        var range = 20;
        var num = 4;
        if(ani) {
            range = 2;
            num = 3;
        }
        solveMath(0, num, range);
    } else if (a == 1) {
        var range = 4;
        if(ani)
            range = 3;
        solveOrder(0, 3, range);
    } else if (a == 2) {
        var range = 3
        solveAnagram(0, 3, range);
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

function solveAnagram(i, num, range) {
    g_last_order_number = 0;
    var taskDiv = Q("#task");
    if(i == num) {
        taskSolved();
        return;
    }
    var html = '';
    html+= '<div>'+(Number(i)+1)+' / '+num+' </div>'
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
            showMessage(event.target.dataset.word, 1000, "gold");
            solveAnagram(i + 1, num, range+1)
        }
    } else {
        solveAnagram(i, num, range)
        showMessage("ERROR!", 1000, "red");
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
    html+= '<div>'+(Number(i)+1)+' / '+num+' </div>'
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
            showMessage("ALL SORTED!", 1000, "gold");
        }
    } else {
        solveOrder(i, num, range)
        showMessage("ERROR!", 1000, "red");
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
    html+= '<div>'+(Number(i)+1)+' / '+num+' </div>'
    html+= '<div>'+a+' + '+b+' = ?</div>'
    html+= '<div>'
    choices.forEach((choice, i) => {
        html+='<label for="answerMath'+i+'" style="font-size: 30px; margin-top:-20px;margin-left:40px">'+choice+'</label>';
        html+='<input type="radio" id="answerMath'+i+'" name="answerMath" value="'+choice+'">';
        html+='<br>';
    });
    html+='<br>'
    html+='<input type="button" data-i="'+i+'" data-num="'+num+'" data-range="'+range+'" data-answer="'+(a+b)+'" onclick="checkMath(event)" value="Submit">'
    html+= '</div>'
    html+='<input type="button" onclick="hideTask()" value="CANCEL" style="position: absolute; bottom: 15px; right: 15px;" >'
    taskDiv.innerHTML = html;
    show(taskDiv);
}
function hideTask() {
    hide(Q("#task"))
}

function checkMath(event) {
    var correctAnswer = event.target.dataset.answer;
    var answer = Q('input[name="answerMath"]:checked').value;
    var i = event.target.dataset.i;
    var num = event.target.dataset.num;
    var range = event.target.dataset.range;
    if(correctAnswer == answer) {
        solveMath(Number(i)+1, num, range*2)
        showMessage("CORRECT!", 1000, "gold");
    } else {
        solveMath(i, num, range)
        showMessage("INCORRECT!", 1000, "gold");
    }

}

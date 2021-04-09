function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
function hide(el) {
    if(el.target)
        el = el.target;
	el.style.display = "none";
}
function show(el) {
	el.style.display = "inline-block";
}

function time() {
	return new Date().getTime();
}

var g_showMessageTimeout;
function showMessage(msg, timeout, color) {
    if(g_showMessageTimeout)
        clearTimeout(g_showMessageTimeout)
    var messageDiv = Q("#message");
    show(messageDiv);
    messageDiv.innerHTML = msg;
    messageDiv.style.color = color || "blue";
    if(timeout) {
        g_showMessageTimeout =  setTimeout(() => {
            hide(Q("#message"));
            g_showMessageTimeout = null;
        }, timeout);
    }
}
var g_cookies;
function getCookie(name) {
    try {
        if (!g_cookies) {
            g_cookies = {};
            var c = document.cookie;
            if(c) {
                var a = c.split(";");
                a.forEach((key_value) => {
                    var tmp = key_value.split("=");
                    g_cookies[tmp[0].trim()] = tmp[1].trim();
                });
            }
        }
        return g_cookies[name];
    } catch (e) {}
}
function setCookie(name, val) {
    document.cookie = name + "=" + val;
}

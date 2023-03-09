window.$=(function(xinfo) {
	
	var userSel = null;
	
	if(typeof xinfo === "object") {
		userSel=  xinfo;
	} else {
		userSel= document.querySelector(xinfo);
	}	
	
	userSel.html= function(val) {
		userSel.innerHTML = val;
	}
	userSel.append = function(val) {
		userSel.appendChild(val);
	}
	userSel.remove = function() {
		userSel.parentNode.removeChild(userSel);
	}
	userSel.attr = function(val1, val2){
		userSel.setAttribute(val1, val2);
	}
	userSel.val = function(val) {
		if(val==undefined) {
			return userSel.value;
		} else {
			userSel.value = val;
		}
	}
	
	return userSel;
	
})


$.get= function(url,funcall) {
	var xhr = new XMLHttpRequest();
	xhr.open("get", url, false);
	xhr.send(null);
	funcall(xhr.status, xhr.response);
}

$.log = function(val) {
	console.log(val);
}
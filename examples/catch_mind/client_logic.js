var logic = {
	sync_callback : function(resp) {
console.log(resp);
		if(!resp)
			return;

		var new_msg_arrived = false;

		for (vars in resp){
			if (resp[vars].name == "draw") {
				clickX = [clickX[clickX.length-1]].concat(resp[vars].value[0]);
				clickY = [clickY[clickY.length-1]].concat(resp[vars].value[1]);
				clickDrag = [clickDrag[clickDrag.length-1]].concat(resp[vars].value[2]);
				color = resp[vars].value[3];
				thickness = resp[vars].value[4];
				redraw();
			} else if (resp[vars].name == "clear") {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			} else if (resp[vars].name == "user_list") {
				$("#user_list").empty();
				for(user_index in resp[vars].value) {
					$("#user_list").append("<h6>" + resp[vars].value[user_index] + "</h6>");
				}
			} else if (resp[vars].name == "chat") {
				$("#text-field").append("<h6>" + resp[vars].value.replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</h6>");
				new_msg_arrived = true;
			} else if (resp[vars].name == "sys_chat") {
				$("#text-field").append(resp[vars].value);
				new_msg_arrived = true;
			} else if (resp[vars].name == "new_answer") {
				$("#question")[0].innerHTML = resp[vars].value;
			} else if (resp[vars].name == "correct") {
				score += 1;
				$("#score")[0].innerHTML = score;
			}
		}

		if (new_msg_arrived) {
			$("#text-field").scrollTop($("#text-field")[0].scrollHeight);
		}
	}
};

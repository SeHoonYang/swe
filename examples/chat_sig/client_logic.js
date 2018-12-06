var logic = {
	sync_callback : function(resp) {
		var new_msg_arrived = false;

		for (var i = 0; i < resp.length; i++) {
			if (resp[i].name == "user_list") {
				$("#id-field").empty();
				for (var j = resp[i].value.length - 1; j >=0; j--) {
					$("#id-field").append("<h6>" + resp[i].value[j] + "</h6>");
				}
			}
			else if (resp[i].name == "chat") {
				$("#text-field").append("<h6>" + resp[i].value + "</h6>");
				new_msg_arrived = true;
			}
		}

		if (new_msg_arrived) {
			$("#text-field").scrollTop($("#text-field")[0].scrollHeight);
		}
	}
};

var logic = {
	sync_callback : function(resp) {
		for (var i = resp.length - 1; i >= 0; i--) {
			if (resp[i].name == "user_list") {
				$("#id-field").empty();
				for (var j = resp[i].value.length - 1; j >=0; j--) {
					$("#id-field").append("<h6>" + resp[i].value[j] + "</h6>");
				}
			}
			else if (resp[i].name == "chat") {
				$("#text-field").empty();
				for (var j = 0; j < resp[i].value.length; j++) {
					$("#text-field").append("<h6>" + resp[i].value[j] + "</h6>");
				}
			}
		}
	}
};

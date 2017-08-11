$(".delete").on("click",function(){
	var id = $(this).parent().parent().attr("id");
	var cid = $(this).attr("id");
	$.ajax({
		url: id + "/comments/" + cid,
		type: "DELETE",
	})
})
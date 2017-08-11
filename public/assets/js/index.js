$(".comments").on("click", function() {
	console.log("Comments clicked")
	if ($(this).parent().parent().children("form").is(":hidden")) {
	    $(this).parent().parent().css("height", "298px");
		$(this).parent().parent().children("form").slideDown();
	} else {
		$(this).parent().parent().children("form").slideUp(null,null, () => $(this).parent().parent().css("height", "100px"));
	}
	// $(this).parent().children("form").slideToggle();
})

$(".saveButton").on("click", function(e) {
	$(".showSaved").text("Saved!")
})

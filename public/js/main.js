function setType(type) {
	$.ajax({
		type: "POST",
		url: window.location.href + 'set_type',
		data: { 'type' : type },
		success: function() {

		},
		dataType: 'JSON'
	});
}

function getNodes() {
	$.ajax({
		type: "GET",
		url: window.location.href + 'get_nodes',
		dataType: 'JSON',
		success: function(data) {
			//console.log(data);
			$('#visibleNodesData').empty();
			$('#visibleNodesData').append('<ul></ul>')
			for (var i = 0; i < data.nodes.length; i++) {
				if (data.nodes[i] === null) {
					continue;
				}

				$('#visibleNodesData ul').append('<li><b>' + i + '</b>: ' + String.fromCharCode(data.nodes[i]) + '</li>');
			}
		}
	});
}

function getMyNode() {
	$.ajax({
		type: "GET",
		url: window.location.href + 'get_type',
		dataType: 'JSON',
		success: function(data) {
			//console.log(data);
			$('#setType a').attr('style', '');
			$('#set' + data.type).attr('style', 'font-weight: bold; text-decoration: underline;');
		}
	});
}

$(document).ready(function() {
	$('#setType a').click(function(e) { 
		setType($(e.target).text());
	});

	setInterval(function() {
		getNodes();
		getMyNode();
	}, 5000);
});

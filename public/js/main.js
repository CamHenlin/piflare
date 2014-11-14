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

				$('#visibleNodesData ul').append('<li><b>' + i + '</b>: ' + data.nodes[i] + '</li>');
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

function setNodeConnection(e) {
	$.ajax({
		type: "POST",
		url: window.location.href + 'set_node_connection',
		data: { 'node_id' : $(e.target).attr('_id'), 'type' : $(e.target).attr('_text') },
		success: function() {

		},
		dataType: 'JSON'
	});
}

function getNodeConnections() {
	$.ajax({
		type: "GET",
		url: window.location.href + 'get_node_connections',
		dataType: 'JSON',
		success: function(data) {
			console.log(data);
			$('#connectedNodesData').empty();
			$('#connectedNodesData').append('<ul></ul>')
			for (var i = 0; i < data.node_connections.length; i++) {
				if (data.node_connections[i] === null) {
					continue;
				}

				$('#connectedNodesData ul').append('<li><a _id=' + i + ' _text=' + data.node_connections[i] + '><b>' + i + '</b>: ' + data.node_connections[i] + '</a></li>');
			}
		}
	});
}

function getAvailConnections() {
	$.ajax({
		type: "GET",
		url: window.location.href + 'get_nodes',
		dataType: 'JSON',
		success: function(data) {
			//console.log(data);
			$('#connectToNodesData').empty();
			$('#connectToNodesData').append('<ul></ul>')
			for (var i = 0; i < data.nodes.length; i++) {
				if (data.nodes[i] === null) {
					continue;
				}

				$('#connectToNodesData ul').append('<li><a _id=' + i + ' _text=' + data.nodes[i] + '><b>' + i + '</b>: ' + data.nodes[i] + '</a></li>');
			}

			$('#connectToNodes a').click(function(e) { 
				console.log('setting new connection');
				setNodeConnection(e);
			});

		}
	});
}

$(document).ready(function() {
	$('#setType a').click(function(e) { 
		setType($(e.target).text());
	});

	$('#connectToNodes a').click(function(e) { 
		setNodeConnection(e);
	});

	setInterval(function() {
		getNodes();
		getMyNode();
		getNodeConnections();
		getAvailConnections();


		$('#connectedNodesData a').click(function(e) { 
			setNodeConnection(e);
		});
	}, 5000);
});

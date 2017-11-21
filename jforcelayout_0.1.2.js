/*!
 * jsforcelayout3 v0.1.2
 *
 * Copyright 2017 kenshinee
 * Licensed under the Apache License v2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Making this world a better place, one code at a time @kenshinee
 *
 * A force-directed layout algorithm in 3D space
 */
jForceLayout = function () {
    var obj = {};

    var ga_nodes = {}; // array to hold nodes
    var ga_edges = {}; // array to hold edges

    var idealD = 300; // ideal distance
    var idealB = 1500; // maximum distance
    var minD = 100; // minimum distance

    var _gaTimer;
    var _gaCounter;
    var _callback;

    var maxNodeCount = 1;
    var maxEdgeCount = 1;

    obj.setIdealDistance = function (distance) { // ideal distance between objects
        idealD = distance;
    }

    obj.setMaxDistance = function (distance) { // ideal max distance between objects where comparison doesn't matter
        idealB = distance;
    }

    obj.setMinDistance = function (distance) { // ideal minumum where objects must obey
        minD = distance;
    }

    obj.resetAll = function () {
        ga_nodes = {};
        ga_edges = {};
    }

    obj.setMaxNodeCount = function (max) {
        maxNodeCount = max;
    }

    obj.setMaxEdgeCount = function (max) {
        maxEdgeCount = max;
    }


    obj.removeNode = function (id) {
        delete ga_nodes[id];
    }


    obj.addNode = function (id, name) {

		x = Math.random() * 5;
		y = Math.random() * 5;
		z = Math.random() * 5;
		
        var pt = new GAPoint(id, name, x, y, z);
        ga_nodes[id] = pt;


    }

    obj.removeEdge = function (id) {
        delete ga_edges[id];
    }

    obj.addEdge = function (ID1, ID2, weight) {
		
	var id = (ID1 + ID2).hashCode();
		 
        if (!ga_edges[id]) {
            var ed = new GAEdge(id, ID1, ID2, weight);
            ga_edges[id] = ed;
			
        } else {
			
            ga_edges[id].weight += weight;
			
        }
    }

    obj.addStartNode = function (ID, name) {

    }

    obj.addEndNode = function (ID, name) {

    }

    obj.getNodes = function () {
        return ga_nodes;
    }

    obj.getEdges = function () {
        return ga_edges;
    }

    obj.startRender = function (callback) {
        if (_gaTimer) {
            clearInterval(_gaTimer);
            _gaTimer = false;
        }

        _gaCounter = 2000;
        _callback = callback;
        _gaTimer = setInterval(_garender, 20);
    }

    _garender = function () {

        _gaCounter--;
        if (_gaCounter < 0) {
            clearTimeout(_gaTimer);
        }
        var totalweight = 0;


        // compare each node against each other;			
        for (var key1 in ga_nodes) {

            var n1 = ga_nodes[key1];

            // do a slight pull for everyone towards the X = 0
            var xc = new GAVector(0, 0, 0);
            var d = getDistance(n1, xc);
            var diff = d / 100;
            var p1 = new GAVector(n1.x, n1.y, n1.z);
            var p2 = new GAVector(xc.x, xc.y, xc.z);
            var ip2 = getPointInBetween(p1, p2, d, diff);
            n1.x = ip2.x;
            n1.y = ip2.y;
            n1.z = ip2.z;

            for (var key2 in ga_nodes) {
                totalweight = 0;
                var n2 = ga_nodes[key2];

                var k1 = (n1.id + n2.id).hashCode();

                if (ga_edges[k1]) totalweight += ga_edges[k1].weight;

                var d = getDistance(n1, n2);

                if (totalweight > 0) { // both nodes are connected

                    if (d > idealD) { // too far apart
					
                        var diff = (d - idealD) / 10;
                        var p1 = new GAVector(n1.x, n1.y, n1.z);
                        var p2 = new GAVector(n2.x, n2.y, n2.z);

                        var ip1 = getPointInBetween(p1, p2, d, diff);
                        n1.x = ip1.x;
                        n1.y = ip1.y;
                        n1.z = ip1.z;

                    } else if (d < minD) { // too close

                        var diff = (minD - d) / 20;
                        var p1 = new GAVector(n1.x, n1.y, n1.z);
                        var p2 = new GAVector(n2.x, n2.y, n2.z);

                        var ip2 = getPointInBetween(p2, p1, d, -diff);
                        n2.x = ip2.x;
                        n2.y = ip2.y;
                        n2.z = ip2.z;
                    }

                } else { /// nodes not related		

                    if (d < idealB) { // nodes are not related, too close
						
                        var diff = (idealB - d) / 30;
                        var p1 = new GAVector(n1.x, n1.y, n1.z);
                        var p2 = new GAVector(n2.x, n2.y, n2.z);
                        var ip2 = getPointInBetween(p2, p1, d, -diff);
                        n2.x = ip2.x;
                        n2.y = ip2.y;
                        n2.z = ip2.z;

                    }
                }

            }
        }

        _callback();

    }

    obj.resetAll();

	String.prototype.hashCode = function () {
        for (var ret = 0, i = 0, len = this.length; i < len; i++) {
            ret = (31 * ret + this.charCodeAt(i)) << 0;
        }
        return ret;
    };


    return obj;
}

GAVector = function (_x, _y, _z) {
    var obj = {};
    obj.x = _x;
    obj.y = _y;
    obj.z = _z;
    return obj;
}

GAPoint = function (_id, _name, _x, _y, _z) {
    var obj = {};
    obj.id = _id;
    obj.name = _name
    obj.x = _x;
    obj.y = _y;
    obj.z = _z;
    //obj.weight = _w;
    return obj;
}

GAEdge = function (id, _k1, _k2, _w) {
    var obj = {};
    obj.id = id;
    obj.startID = _k1;
    obj.endID = _k2;
    obj.weight = _w;
    return obj;
}

function getDistance(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getPointInBetween(pointA, pointB, distance, length) {

    if (distance == 0) distance = 0.001; // preventing division by zero
    var obj = new GAVector();
    obj.x = pointA.x + (pointB.x - pointA.x) / distance * length;
    obj.y = pointA.y + (pointB.y - pointA.y) / distance * length;
    obj.z = pointA.z + (pointB.z - pointA.z) / distance * length;
    return obj;
}

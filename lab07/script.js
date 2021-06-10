const ANIMATION_DURATION = 3000;
const RADIUS = 64;

window.addEventListener('load', function() {
    loadByPathAndAnimateNameCharacter('./邱.svg', '#chiu');
    loadByPathAndAnimateNameCharacter('./柏.svg', '#po');
    loadByPathAndAnimateNameCharacter('./政.svg', '#cheng');

    document.getElementById('drop-file').addEventListener('dragover', (evt) => {
        evt.preventDefault();
    });

    document.getElementById('drop-file').addEventListener('drop', (evt) => {
        evt.preventDefault();
        loadByDropAndAnimateNameCharacter(evt.dataTransfer.files[0], '#svg-drop');
    })
});

function loadByPathAndAnimateNameCharacter(filePath, elementId) {
    d3.xml(filePath).then(function(data) {
        var nameCharacter = d3.select(elementId);
        nameCharacter.node()
            .append(data.documentElement);
        animate(nameCharacter);
    });
}

function loadByDropAndAnimateNameCharacter(file, elementId) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event) {
        var nameCharacter = d3.select(elementId);
        nameCharacter.html(event.target.result);
        animate(nameCharacter);
    };
}

function animate(nameCharacter) {
    const characterPathD = nameCharacter.select('path')
        .attr('d');
    const circlePathD = getCirclePathD(characterPathD);
    var path = nameCharacter.select('path')
        .attr('d', circlePathD)
        .attr('fill', 'purple')
        .attr('stroke', 'purple')
        .attr('stroke-width', 2);
    repeat();

    function repeat() {
        path.transition()
            .duration(ANIMATION_DURATION)
            .attr('d', characterPathD)
            .transition()
            .duration(ANIMATION_DURATION)
            .attr('d', circlePathD)
            .on('end', repeat);
    }
}

function getCirclePathD(characterPathD) {
    var strokesN;
    var pointsNs;
    var orders;
    characterPathD = characterPathD.replaceAll('q', ' q ')
        .replaceAll('v', ' v ')
        .replaceAll('t', ' t ')
        .replaceAll('h', ' h ')
        .replaceAll('l', ' l ')
        .replaceAll('z', '')
        .replaceAll('/\s/g', ' ');
    [strokesN, pointsNs, orders] = getDataToBuildCirclePathD(characterPathD);
    var circlePathD = '';
    for (var index = 1; index < strokesN; ++index) {
        circlePathD += 'M';
        var gap = Math.PI * 2 / pointsNs[index - 1];
        var angle = 0;
        if (index === getMostComplicatedStrokeIndex(pointsNs) + 1) {
            circlePathD += (RADIUS * (Math.cos(angle)) + RADIUS * 2) + ' ' +
                (RADIUS * (Math.sin(angle)) + RADIUS * 2) + ' ';
            angle += gap;
            for (var j = 0, order = orders[index - 1]; j < order.length; ++j) {
                if (order[j] === 'q') {
                    circlePathD += ' q ';
                    var r = RADIUS / Math.cos(gap / 2);
                    circlePathD += (r * Math.cos(angle - gap / 2) - RADIUS * Math.cos(angle - gap)) + ' ' +
                        (r * Math.sin(angle - gap / 2) - RADIUS * Math.sin(angle - gap)) + ' ';

                    circlePathD += (RADIUS * (Math.cos(angle) - Math.cos(angle - gap))) + ' ' +
                        (RADIUS * (Math.sin(angle) - Math.sin(angle - gap))) + ' ';
                    angle += gap;
                } else if (order[j] === 'v') {
                    circlePathD += ' v 0 ';
                } else if (order[j] === 'h') {
                    circlePathD += ' h 0 ';
                } else if (order[j] === 't') {
                    circlePathD += 't';
                    if (order[j - 1] === 'q') {
                        circlePathD += (RADIUS * (Math.cos(angle) - Math.cos(angle - gap))) + ' ' +
                            (RADIUS * (Math.sin(angle) - Math.sin(angle - gap))) + ' ';
                        angle += gap;
                    } else {
                        circlePathD += ' 0 0 ';
                    }
                } else if (order[j] === 'l') {
                    circlePathD += ' l 0 0 ';
                }
            }
        } else {
            circlePathD += (RADIUS * (Math.cos(0)) + RADIUS) + ' ' +
                (RADIUS * (Math.sin(0)) + RADIUS) + ' ';
            for (var j = 0, order = orders[index - 1]; j < order.length; ++j) {
                if (order[j] === 'q') {
                    circlePathD += ' q 0 0 0 0 ';
                } else if (order[j] === 'v') {
                    circlePathD += ' v 0 ';
                } else if (order[j] === 'h') {
                    circlePathD += ' h 0 ';
                } else if (order[j] === 't') {
                    circlePathD += ' t 0 0 ';
                } else if (order[j] === 'l') {
                    circlePathD += ' l 0 0 ';
                }
            }
        }
        circlePathD += 'z';
    }
    return circlePathD;
}

function getMostComplicatedStrokeIndex(pointsNs) {
    var result = 0;
    for (var i = 0; i < pointsNs.length; ++i) {
        if (pointsNs[result] < pointsNs[i]) {
            result = i;
        }
    }
    return result;
}

function getDataToBuildCirclePathD(parsedCharacterPathD) {
    var strokes = parsedCharacterPathD.split('M');
    var pointsNs = [];
    var orders = [];
    for (var i = 1; i < strokes.length; ++i) {
        var points = strokes[i].split(' ');
        var order = ['dump'];
        var pointsN = 0;
        for (var j = 1; j < points.length; ++j) {
            if ('a' <= points[j] && points[j] <= 'z') {
                order.push(points[j]);
            }
            if (points[j] === 'q') {
                pointsN += 1;
            }
        }
        pointsNs.push(pointsN);
        orders.push(order);
    }
    return [strokes.length, pointsNs, orders];
}
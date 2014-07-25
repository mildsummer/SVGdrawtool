var s = Snap(800, 600);

Snap.pathArrayToString = function (array) {
    var str = "";
    for (var i = 0, l1 = array.length; i < l1; i++) {
        for (var j = 0, l2 = array[i].length; j < l2; j++) {
            str += array[i][j];
            str += " ";
        }
    }
    return str;
}

Array.prototype.fromLast = function (n, content) {
    if(content) {
        this[this.length - (n + 1)] = content;
    }
    return this[this.length - (n + 1)];
}

var ellipse = {
    type: "ellipse",
    init: function (x, y) {
        this.obj = s.ellipse(x, y, 0, 0);
        this.x1 = x;
        this.y1 = y;
        return this;
    },
    set: function (dx, dy, x, y) {
        this.obj.attr({
            cx: x - (dx / 2),
            cy: y - (dy / 2),
            rx: Math.abs(dx / 2),
            ry: Math.abs(dy / 2)
        });
        this.x2 = x;
        this.y2 = y;
        return this;
    }
}

var path = {
    type: "path",
    array: [],
    init: function (x, y) {
        this.array.push(["M", x, y]);
        this.obj = s.path(this.array);
        return this;
    },
    length: function() {
        return this.array.length;
    }
}

var ellipseCursor = {
    name: "ellipse",
    dragstart: function (x, y, e) {
        console.log("dragstart:" + this.cursor.name);
        var rect = s.node.getBoundingClientRect(),
            c = Object.create(ellipse).init(x - rect.left, y - rect.top);
        this.objects.push(c);
        return c;
    },
    dragmove: function (dx, dy, x, y, e) {
        console.log("dragmove:" + this.cursor.name);
        var rect = s.node.getBoundingClientRect();
        this.objects[this.objects.length - 1].set(dx, dy, x - rect.left, y - lect.top);
    },
    dragend: function (e) {
        console.log("dragend:" + this.cursor.name);
    }
}

var penCursor = {
    name: "pen",
    state: -2,
    set: function (x, y) {
        switch (this.cursor.state) {
        case -2: //最初の端点をクリック
            var p = Object.create(path).init(x, y);
            this.objects.push(p);
            break;
        case -1: //一つ目の制御点（マウスアップ）
            this.objects.fromLast(0).array.push(["C", x, y]);
            break;
        case 0: //もう一つの端点をクリック（レンダー）
            this.objects.fromLast(0).array.push([x, y]);
            this.objects.fromLast(0).array.push([x, y]);
            this.cursor.render(this.objects.fromLast(0));
            break;
        case 1: //二つ目の制御点＋次の一つ目の制御点（マウスアップ）
            var axisx = this.objects.fromLast(0).array.fromLast(0)[0],
                axisy = this.objects.fromLast(0).array.fromLast(0)[1], //軸
                opstx = x - 2 * (x - axisx),
                opsty = y - 2 * (y - axisy); //二つ目の制御点
            this.objects.fromLast(0).array.fromLast(1, [opstx, opsty]);
            this.cursor.render(this.objects.fromLast(0));
            this.objects.fromLast(0).array.push(["C", x, y]);
            break;
        }
        this.cursor.state = this.cursor.state + 1;
        if (this.cursor.state > 1) {
            this.cursor.state = 0;
        }
        console.log(this.cursor.state);
        console.log(this.objects.fromLast(0).array);
        console.log(Snap.pathArrayToString(this.objects.fromLast(0).array));
    },
    temp: function (x, y) {
        switch (this.cursor.state) {
        case -1: //最初の端点をクリック後、ハンドルをのばす
            //this.objects.fromLast(0).array.last(["C", x, y]));
            break;
        case 1: //もう一つの端点をクリック後、ハンドルをのばし曲線を描く
            var axisx = this.objects.fromLast(0).array.fromLast(0)[0],
                axisy = this.objects.fromLast(0).array.fromLast(0)[1], //軸
                opstx = x - 2 * (x - axisx),
                opsty = y - 2 * (y - axisy); //二つ目の制御点
            this.objects.fromLast(0).array.fromLast(1, [opstx, opsty]);
            this.cursor.render(this.objects.fromLast(0));
            break;
        }
    },
    render: function (path) {
        var array = path.array;
        path.obj.attr({
            d: Snap.pathArrayToString(array)
        });
    },
    dragstart: function (x, y, e) {
        console.log("dragstart:" + this.cursor.name);
        var rect = s.node.getBoundingClientRect();
        this.set(x - rect.left, y - rect.top);
    },
    dragmove: function (dx, dy, x, y, e) {
        console.log("dragmove:" + this.cursor.name);
        var rect = s.node.getBoundingClientRect();
    },
    dragend: function (e) {
        console.log("dragend:" + this.cursor.name);
        var rect = s.node.getBoundingClientRect();
        this.set(e.clientX - rect.left, e.clientY - rect.top);
    }
}

var canvas = {
    objects: [],
    isDrawing: false,
    cursor: Object.create(penCursor),
    init: function () {
        that = this;
        s.drag(function (dx, dy, x, y, e) {
            var rect = s.node.getBoundingClientRect();
            var newdragmove = that.cursor.temp.bind(that);
            newdragmove(x - rect.left, y - rect.top);
        }, function (x, y, e) {
            var rect = s.node.getBoundingClientRect();
            var newdragstart = that.cursor.set.bind(that);
            newdragstart(x - rect.left, y - rect.top);
        }, function (e) {
            var rect = s.node.getBoundingClientRect();
            var newdragend = that.cursor.set.bind(that);
            newdragend(e.clientX - rect.left, e.clientY - rect.top);
        })
        return this;
    }
};

var mycanvas = Object.create(canvas).init();
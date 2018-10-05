"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("data/observable");
let ZXing = require('nativescript-zxing');
let zx = new ZXing();
let ImageSource = require('image-source');
class PartiesViewModel extends observable_1.Observable {
    constructor() {
        super();
        const qrcode = zx.createBarcode({
            encode: "test",
            format: ZXing.QR_CODE,
            height: 128,
            width: 128
        });
        this.items = new Array({
            name: "Party #12",
            datetime: "Tuesday, 9th of October 2018",
            location: "BC229",
            status: "Get scanned",
            // qrcode: ''
            qrcode: ImageSource.fromNativeSource(qrcode)
        });
    }
}
exports.PartiesViewModel = PartiesViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGllcy12aWV3LW1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFydGllcy12aWV3LW1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQTJDO0FBRzNDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQzFDLElBQUksRUFBRSxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7QUFDckIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRTFDLHNCQUE4QixTQUFRLHVCQUFVO0lBRzVDO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFFUixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQzVCLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPO1lBQ3JCLE1BQU0sRUFBRSxHQUFHO1lBQ1gsS0FBSyxFQUFFLEdBQUc7U0FDYixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUNsQjtZQUNJLElBQUksRUFBRSxXQUFXO1lBQ2pCLFFBQVEsRUFBRSw4QkFBOEI7WUFDeEMsUUFBUSxFQUFFLE9BQU87WUFDakIsTUFBTSxFQUFFLGFBQWE7WUFDckIsYUFBYTtZQUNiLE1BQU0sRUFBRSxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO1NBQy9DLENBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSjtBQXhCRCw0Q0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge09ic2VydmFibGV9IGZyb20gXCJkYXRhL29ic2VydmFibGVcIjtcbmltcG9ydCB7SXRlbX0gZnJvbSBcIi4vc2hhcmVkL2l0ZW1cIjtcblxubGV0IFpYaW5nID0gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LXp4aW5nJyk7XG5sZXQgenggPSBuZXcgWlhpbmcoKTtcbmxldCBJbWFnZVNvdXJjZSA9IHJlcXVpcmUoJ2ltYWdlLXNvdXJjZScpO1xuXG5leHBvcnQgY2xhc3MgUGFydGllc1ZpZXdNb2RlbCBleHRlbmRzIE9ic2VydmFibGUge1xuICAgIGl0ZW1zOiBBcnJheTxJdGVtPjtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIGNvbnN0IHFyY29kZSA9IHp4LmNyZWF0ZUJhcmNvZGUoe1xuICAgICAgICAgICAgZW5jb2RlOiBcInRlc3RcIixcbiAgICAgICAgICAgIGZvcm1hdDogWlhpbmcuUVJfQ09ERSxcbiAgICAgICAgICAgIGhlaWdodDogMTI4LFxuICAgICAgICAgICAgd2lkdGg6IDEyOFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gbmV3IEFycmF5PEl0ZW0+KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiUGFydHkgIzEyXCIsXG4gICAgICAgICAgICAgICAgZGF0ZXRpbWU6IFwiVHVlc2RheSwgOXRoIG9mIE9jdG9iZXIgMjAxOFwiLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBcIkJDMjI5XCIsXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcIkdldCBzY2FubmVkXCIsXG4gICAgICAgICAgICAgICAgLy8gcXJjb2RlOiAnJ1xuICAgICAgICAgICAgICAgIHFyY29kZTogSW1hZ2VTb3VyY2UuZnJvbU5hdGl2ZVNvdXJjZShxcmNvZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19
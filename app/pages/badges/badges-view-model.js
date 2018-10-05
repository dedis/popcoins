"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const observable_1 = require("data/observable");
class BadgesViewModel extends observable_1.Observable {
    constructor() {
        super();
        this.items = new Array({
            name: "Party #12",
            datetime: "Tuesday, 9th of October 2018",
            location: "BC229",
        });
    }
}
exports.BadgesViewModel = BadgesViewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2VzLXZpZXctbW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYWRnZXMtdmlldy1tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGdEQUEyQztBQUczQyxxQkFBNkIsU0FBUSx1QkFBVTtJQUczQztRQUNJLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FDbEI7WUFDSSxJQUFJLEVBQUUsV0FBVztZQUNqQixRQUFRLEVBQUUsOEJBQThCO1lBQ3hDLFFBQVEsRUFBRSxPQUFPO1NBQ3BCLENBQ0osQ0FBQztJQUNOLENBQUM7Q0FDSjtBQWRELDBDQWNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tIFwiZGF0YS9vYnNlcnZhYmxlXCI7XG5pbXBvcnQge0l0ZW19IGZyb20gXCIuL3NoYXJlZC9pdGVtXCI7XG5cbmV4cG9ydCBjbGFzcyBCYWRnZXNWaWV3TW9kZWwgZXh0ZW5kcyBPYnNlcnZhYmxlIHtcbiAgICBpdGVtczogQXJyYXk8SXRlbT47XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLml0ZW1zID0gbmV3IEFycmF5PEl0ZW0+KFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IFwiUGFydHkgIzEyXCIsXG4gICAgICAgICAgICAgICAgZGF0ZXRpbWU6IFwiVHVlc2RheSwgOXRoIG9mIE9jdG9iZXIgMjAxOFwiLFxuICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBcIkJDMjI5XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19